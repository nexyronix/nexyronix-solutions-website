/**
 * POST /api/contact — enquiry submission handler.
 *
 * Deployment: this is a standard serverless function signature that works on
 * Vercel (`/api/contact.ts`) and adapts trivially to Netlify Functions, AWS
 * Lambda, or an Express route (see README).
 *
 * SECURITY POSTURE
 * - Every field is re-validated here. The client's validation is never trusted.
 * - Unknown fields are dropped; only the whitelisted shape is ever used.
 * - All values are escaped before being embedded in the HTML email (XSS).
 * - Rate limited per IP. Body size capped. Honeypot checked.
 * - Credentials come from environment variables only — never from source.
 * - Error responses are generic; internal failures are logged server-side only.
 *
 * EMAIL DELIVERY
 * Sends via the Resend HTTPS API (fetch, no SDK dependency), not SMTP.
 * Originally chosen because Railway blocks outbound SMTP (ports
 * 25/465/587/2525) below its Pro plan — confirmed by testing two providers
 * from that deployment, both failing with ETIMEDOUT at TCP connect. It is
 * kept on every host: an HTTPS call on port 443 isn't subject to the
 * SMTP-port restrictions cloud platforms commonly apply, so delivery works
 * the same on Azure App Service, Railway or anywhere else. To go back to
 * generic SMTP on a host that permits it, swap deliverEnquiry() for a
 * nodemailer transport — nothing else in this file needs to change.
 */

import { isIP } from "node:net";
import {
  validateEnquiry,
  hasErrors,
  LIMITS,
  RESUME_ALLOWED_EXTENSIONS,
  RESUME_MAX_BYTES,
  RESUME_MIME_TYPES,
  RESUME_ENQUIRY_TYPES,
  type EnquiryPayload,
  type ResumeAttachment,
} from "../src/shared/enquiry";

/** Minimal request/response shape so this compiles without a framework dependency. */
export interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
  /**
   * Client address as resolved by the host framework. Express sets this from
   * X-Forwarded-For according to its `trust proxy` setting (see
   * server/index.ts), which is the only place the trusted-hop count is known.
   */
  ip?: string;
}

export interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

// A resume, base64-encoded (~37% larger than the original), can legitimately
// be close to RESUME_MAX_BYTES (5 MB) on its own; the cap here has headroom
// on top of that for the encoding overhead plus the rest of the form fields.
const MAX_BODY_BYTES = 8 * 1024 * 1024; // 8 MB

// ---------------------------------------------------------------------------
// Rate limiting
//
// In-memory: fine for a single instance, and it degrades safely (a cold start
// resets the window). For multi-instance deployments swap the Map for Redis or
// your platform's KV store — the interface below is deliberately small.
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5; // submissions per IP per window

const submissions = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissions.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    submissions.set(ip, recent);
    return true;
  }

  recent.push(now);
  submissions.set(ip, recent);

  // Opportunistic cleanup so the Map can't grow without bound
  if (submissions.size > 5000) {
    for (const [key, times] of submissions) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) submissions.delete(key);
    }
  }

  return false;
}

/**
 * Identifies the client for rate limiting.
 *
 * Never trusts the LEFTMOST X-Forwarded-For entry: the client writes that one,
 * so reading it let anyone bypass the limit by sending a fresh fake value per
 * request. Proxies APPEND to the header, so only entries added by our own
 * infrastructure (the rightmost ones) are trustworthy.
 *
 * - Under Express (server/index.ts), `req.ip` is already resolved from the
 *   header using the configured trusted-hop count — that's authoritative.
 * - Without a framework (serverless), fall back to the rightmost entry, which
 *   is the one the platform's own edge appended.
 */
function clientIp(req: ApiRequest): string {
  if (req.ip) return rateLimitKey(req.ip);

  const forwarded = req.headers["x-forwarded-for"];
  const joined = Array.isArray(forwarded) ? forwarded.join(",") : forwarded;
  const rightmost = joined
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .pop();

  return rateLimitKey(rightmost || req.socket?.remoteAddress || "");
}

/**
 * Normalises an address into a stable rate-limit key:
 * - strips a port (Azure App Service's front end forwards "IP:port", and the
 *   port changes with every connection, which would give each request a new
 *   bucket),
 * - unwraps IPv4-mapped IPv6 ("::ffff:203.0.113.5" -> "203.0.113.5"),
 * - buckets IPv6 by /64, since a single subscriber is normally handed a whole
 *   /64 and can rotate through it freely.
 * Anything unparseable shares one "unknown" bucket — failing closed, not open.
 */
function rateLimitKey(raw: string): string {
  let ip = raw.trim();

  const bracketed = /^\[([^\]]+)\](?::\d+)?$/.exec(ip); // "[2001:db8::1]:443"
  if (bracketed) {
    ip = bracketed[1];
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(ip)) {
    ip = ip.slice(0, ip.lastIndexOf(":")); // "203.0.113.5:51234"
  }

  const zone = ip.indexOf("%"); // "fe80::1%eth0"
  if (zone !== -1) ip = ip.slice(0, zone);
  ip = ip.toLowerCase();

  if (ip.startsWith("::ffff:") && isIP(ip.slice(7)) === 4) ip = ip.slice(7);

  const version = isIP(ip);
  if (version === 4) return ip;
  if (version === 6) return `${ipv6Prefix64(ip)}::/64`;
  return "unknown";
}

/** First four hextets of a valid IPv6 address, e.g. "2001:db8:aa:bb". */
function ipv6Prefix64(ip: string): string {
  const [head, tail] = ip.includes("::") ? ip.split("::") : [ip, undefined];
  // An embedded dotted IPv4 tail occupies two hextets; its value is irrelevant
  // here because only the first 64 bits are kept.
  const expand = (part: string | undefined) =>
    part ? part.split(":").flatMap((g) => (g.includes(".") ? ["0", "0"] : [g])) : [];
  const headGroups = expand(head);
  const tailGroups = expand(tail);
  const groups =
    tail === undefined
      ? headGroups
      : [...headGroups, ...Array(8 - headGroups.length - tailGroups.length).fill("0"), ...tailGroups];
  return groups
    .slice(0, 4)
    .map((g) => parseInt(g, 16).toString(16))
    .join(":");
}

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

/** Escapes HTML so submitted text can never execute in the notification email. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Strips control characters and trims. Applied before validation. */
function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max);
}

/** Header injection guard for anything placed into an email header. */
function safeHeader(value: string): string {
  return value.replace(/[\r\n]/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Resume upload
//
// Never stored: validated here and attached directly to the notification
// email (see deliverEnquiry), so there's no private file to secure, expose,
// or clean up later. This is Node-only (uses Buffer), which is why it lives
// here rather than in the isomorphic src/shared/enquiry.ts — the client's
// own checks in ResumeUploadField.tsx are a UX courtesy only, never trusted.
// ---------------------------------------------------------------------------

type ResumeExt = (typeof RESUME_ALLOWED_EXTENSIONS)[number];

/**
 * Checks the actual leading bytes against each format's real signature — an
 * extension check alone is defeated by renaming a .exe to .pdf, which costs
 * an attacker nothing. DOCX is itself a ZIP archive, so this only confirms
 * "is a ZIP file" for that one; fully validating its internal structure
 * would need real ZIP parsing, which is more than a resume upload warrants.
 * PDF and DOC (legacy binary/OLE2) are fully verified.
 */
function matchesFileSignature(buffer: Buffer, ext: ResumeExt): boolean {
  switch (ext) {
    case "pdf":
      return buffer.subarray(0, 4).toString("latin1") === "%PDF";
    case "doc":
      return buffer
        .subarray(0, 8)
        .equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
    case "docx":
      return buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  }
}

/** Never the user-supplied filename — that could carry path-traversal characters or arbitrary unicode. */
function safeResumeFilename(name: string, ext: ResumeExt): string {
  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "applicant";
  return `resume-${slug}-${Date.now()}.${ext}`;
}

/**
 * Returns a field error if the resume is present but invalid, and — only
 * when it's genuinely valid — a fully re-derived attachment (safe generated
 * filename, our own canonical MIME type, the original bytes) ready to hand
 * to Resend. Silently drops the resume (no error) if it wasn't offered for
 * this enquiry type at all, matching the client's own conditional field.
 */
function validateResume(
  resume: unknown,
  enquiryType: string,
  applicantName: string
): { error?: string; attachment?: ResumeAttachment } {
  if (resume === undefined || resume === null) return {};

  if (!RESUME_ENQUIRY_TYPES.includes(enquiryType as (typeof RESUME_ENQUIRY_TYPES)[number])) {
    return {};
  }

  if (
    typeof resume !== "object" ||
    typeof (resume as Partial<ResumeAttachment>).filename !== "string" ||
    typeof (resume as Partial<ResumeAttachment>).base64 !== "string"
  ) {
    return { error: "Please upload a valid resume file." };
  }

  const { filename, base64 } = resume as ResumeAttachment;

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!RESUME_ALLOWED_EXTENSIONS.includes(ext as ResumeExt)) {
    return { error: "Please upload a PDF, DOC or DOCX file." };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64, "base64");
  } catch {
    return { error: "We couldn't read that file. Please try again." };
  }

  if (buffer.length === 0 || buffer.length > RESUME_MAX_BYTES) {
    return { error: `Please keep your resume under ${RESUME_MAX_BYTES / (1024 * 1024)} MB.` };
  }

  if (!matchesFileSignature(buffer, ext as ResumeExt)) {
    return { error: "That file doesn't look like a valid resume." };
  }

  return {
    attachment: {
      filename: safeResumeFilename(applicantName, ext as ResumeExt),
      mimeType: RESUME_MIME_TYPES[ext as ResumeExt],
      base64,
    },
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, message: "Method not allowed." });
    return;
  }

  // Reject oversized bodies before doing any work
  const contentLength = Number(req.headers["content-length"] ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    res.status(413).json({ ok: false, message: "That request was too large." });
    return;
  }

  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    res.status(429).json({
      ok: false,
      message: "Too many enquiries from this connection. Please try again shortly.",
    });
    return;
  }

  const body = (typeof req.body === "object" && req.body !== null ? req.body : {}) as Record<
    string,
    unknown
  >;

  // Honeypot: a hidden field real users never fill. Respond 200 so bots get no
  // signal that they were caught, but do nothing with the submission.
  if (clean(body.website, 100)) {
    res.status(200).json({ ok: true });
    return;
  }

  // Whitelist — anything else the client sent is discarded
  const payload: EnquiryPayload = {
    name: clean(body.name, LIMITS.name),
    email: clean(body.email, LIMITS.email),
    phone: clean(body.phone, LIMITS.phone),
    organization: clean(body.organization, LIMITS.organization),
    enquiryType: clean(body.enquiryType, 60),
    budget: clean(body.budget, 60),
    source: clean(body.source, 60),
    message: clean(body.message, LIMITS.message),
  };

  const errors = validateEnquiry(payload);

  const { error: resumeError, attachment: resume } = validateResume(
    body.resume,
    payload.enquiryType,
    payload.name
  );
  if (resumeError) errors.resume = resumeError;
  if (resume) payload.resume = resume;

  if (hasErrors(errors)) {
    res.status(400).json({ ok: false, message: "Please check the highlighted fields.", errors });
    return;
  }

  const submittedAt = new Date();

  try {
    await deliverEnquiry(payload, submittedAt);

    // Optional persistence. Left as an explicit, documented hook rather than a
    // half-built integration — see storeEnquiry() below.
    await storeEnquiry(payload, submittedAt);

    res.status(200).json({ ok: true });
  } catch (error) {
    // Log internally; never leak transport/credential details to the client.
    console.error("[contact] delivery failed:", error);
    res.status(500).json({
      ok: false,
      message: "We couldn't submit your request right now. Please try again.",
    });
  }
}

// ---------------------------------------------------------------------------
// Email delivery
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/**
 * The site has exactly one form (see ContactForm.tsx) — "Internship" is one
 * of its selectable enquiry types, not a separate application flow. There is
 * no college/course/graduation-year field, so the internship email uses
 * only the fields that actually exist (plus the resume, see validateResume
 * above, which both Internship and Career Opportunity enquiries can attach).
 * Don't add fields here that the form doesn't collect.
 */
function isInternshipEnquiry(payload: EnquiryPayload): boolean {
  return payload.enquiryType === "Internship";
}

function buildEnquiryEmail(
  payload: EnquiryPayload,
  submittedAt: Date
): { subject: string; html: string; text: string } {
  const isInternship = isInternshipEnquiry(payload);
  const dateStr = submittedAt.toISOString().slice(0, 10);
  const timeStr = `${submittedAt.toISOString().slice(11, 19)} UTC`;

  const resumeRow: [string, string][] = payload.resume ? [["Resume", "Attached to this email"]] : [];

  const rows: [string, string][] = isInternship
    ? [
        ["Student Name", payload.name],
        ["Email", payload.email],
        ["Phone", payload.phone || "—"],
        ["College / University", payload.organization || "—"],
        ...resumeRow,
        ["Message", payload.message],
        ["Application Date", dateStr],
        ["Application Time", timeStr],
      ]
    : [
        ["Name", payload.name],
        ["Email", payload.email],
        ["Phone", payload.phone || "—"],
        ["Company / Organization", payload.organization || "—"],
        ["Enquiry Type", payload.enquiryType],
        ...resumeRow,
        ["Budget", payload.budget || "—"],
        ["How They Heard About Us", payload.source || "—"],
        ["Message", payload.message],
        ["Submission Date", dateStr],
        ["Submission Time", timeStr],
      ];

  const subject = isInternship
    ? "New Internship Application - Nexyronix"
    : "New Website Enquiry - Nexyronix";

  const heading = isInternship ? "New internship application" : "New website enquiry";

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#111;max-width:640px">
      <h2 style="margin:0 0 16px">${escapeHtml(heading)} — Nexyronix</h2>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
        ${rows
          .map(
            ([label, value]) =>
              `<tr>
                 <td style="border:1px solid #ddd;background:#fafafa;font-weight:600;width:180px;vertical-align:top">${escapeHtml(label)}</td>
                 <td style="border:1px solid #ddd;white-space:pre-wrap">${escapeHtml(value)}</td>
               </tr>`
          )
          .join("")}
      </table>
    </div>
  `;

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");

  return { subject, html, text };
}

const RESEND_TIMEOUT_MS = 10_000;

async function deliverEnquiry(payload: EnquiryPayload, submittedAt: Date): Promise<void> {
  const apiKey = requireEnv("RESEND_API_KEY");
  const to = requireEnv("CONTACT_EMAIL");
  // SMTP_FROM is a holdover name from the SMTP-based version of this
  // function — kept so an already-configured deployment doesn't need a new
  // variable just for this. From must be an address on a domain Resend has
  // verified; using the submitter's address here would fail DMARC/SPF or be
  // rejected outright. Their address goes in reply_to instead.
  const from = requireEnv("SMTP_FROM");

  const { subject, html, text } = buildEnquiryEmail(payload, submittedAt);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: safeHeader(from),
        to: [safeHeader(to)],
        reply_to: safeHeader(payload.email),
        subject: safeHeader(subject),
        text,
        html,
        ...(payload.resume
          ? {
              attachments: [
                {
                  filename: payload.resume.filename,
                  content: payload.resume.base64,
                  content_type: payload.resume.mimeType,
                },
              ],
            }
          : {}),
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Resend request timed out after ${RESEND_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // Read the body for the server-side log only — never forwarded to the client.
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend API responded ${response.status}: ${detail.slice(0, 500)}`);
  }
}

// ---------------------------------------------------------------------------
// Optional persistence
// ---------------------------------------------------------------------------

/**
 * Optional storage hook. Intentionally a no-op by default rather than a
 * half-wired database integration — wiring this to a specific database without
 * knowing which one you'll use would be guesswork.
 *
 * To enable, implement against your database using this shape:
 *
 *   id           uuid / auto
 *   name         text
 *   email        text
 *   phone        text | null
 *   organization text | null
 *   enquiryType  text
 *   budget       text | null
 *   source       text | null
 *   message      text
 *   createdAt    timestamptz
 *   status       enum('new','contacted','closed')  default 'new'
 *
 * Keep this table private — it must never be exposed through a public endpoint.
 * A storage failure deliberately does NOT fail the request: the email has
 * already been delivered, and the visitor shouldn't see an error for it.
 */
async function storeEnquiry(payload: EnquiryPayload, submittedAt: Date): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  try {
    // Implement your insert here, e.g. with Prisma, Drizzle, or pg:
    //   await db.insert(enquiries).values({ ...payload, createdAt: submittedAt, status: "new" });
    void payload;
    void submittedAt;
  } catch (error) {
    console.error("[contact] storage failed (email was still sent):", error);
  }
}
