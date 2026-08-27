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
 * Railway blocks outbound SMTP (ports 25/465/587/2525) on every plan below
 * Pro — confirmed by testing against two different providers (a mailbox and
 * a transactional-email service) from this exact deployment, both failing
 * identically with an ETIMEDOUT at the TCP-connect stage. An HTTPS API call
 * isn't affected, since only the SMTP-specific ports are blocked. If you're
 * on Railway Pro (or a host that doesn't block SMTP) and want to go back to
 * generic SMTP for provider flexibility, swap deliverEnquiry() back to a
 * nodemailer transport — nothing else in this file needs to change.
 */

import {
  validateEnquiry,
  hasErrors,
  LIMITS,
  type EnquiryPayload,
} from "../src/shared/enquiry";

/** Minimal request/response shape so this compiles without a framework dependency. */
export interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}

export interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

const MAX_BODY_BYTES = 16 * 1024; // 16 KB — generous for text, hostile to abuse

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

function clientIp(req: ApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return raw?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
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
 * no college/course/graduation-year field and no resume upload anywhere in
 * this codebase (see README's "Note on the internship path"), so the
 * internship email uses only the fields that actually exist. Don't add
 * fields here that the form doesn't collect.
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

  const rows: [string, string][] = isInternship
    ? [
        ["Student Name", payload.name],
        ["Email", payload.email],
        ["Phone", payload.phone || "—"],
        ["College / University", payload.organization || "—"],
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
