/**
 * POST /api/contact — enquiry submission handler.
 *
 * Mounted by server/app.ts at POST /api/contact. It uses the minimal
 * ApiRequest / ApiResponse shapes below rather than Express types, which keeps
 * it independent of the framework and lets the tests drive it directly.
 *
 * SECURITY POSTURE
 * - Every field is re-validated here. The client's validation is never trusted.
 * - Unknown fields are dropped; only the whitelisted shape is ever used.
 * - All values are escaped before being embedded in the HTML email (XSS).
 * - Rate limited per client (accepted enquiries and raw attempts are capped
 *   separately). Body size capped. Only JSON accepted. Honeypot checked.
 * - Resume uploads are checked against each format's real structure, not
 *   just the file extension.
 * - Credentials come from environment variables only — never from source.
 * - Error responses are generic; internal failures are logged server-side only.
 *
 * EMAIL DELIVERY
 * Sends via the Resend HTTPS API (fetch, no SDK dependency), not SMTP. An
 * HTTPS call on port 443 isn't subject to the outbound SMTP-port restrictions
 * cloud platforms commonly apply, so delivery doesn't depend on the host's
 * network policy. To use generic SMTP instead, swap deliverEnquiry() for a
 * nodemailer transport — nothing else in this file needs to change.
 */

import { isIP } from "node:net";
import { inspect } from "node:util";
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

/**
 * Largest request body accepted, in bytes (~6.9 MB). Derived from the resume
 * cap so the two can't drift: base64 turns every 3 bytes into 4, and 256 KB
 * on top covers the text fields (a few KB at most) and JSON overhead. The
 * Express server applies the same number to its body parser.
 */
export const MAX_BODY_BYTES = Math.ceil(RESUME_MAX_BYTES / 3) * 4 + 256 * 1024;

// ---------------------------------------------------------------------------
// Rate limiting
//
// Two independent sliding windows per client:
//  - submissions: enquiries that passed validation and would send an email.
//    This is the real anti-spam limit.
//  - attempts: every POST, valid or not. Bounds how much work one client can
//    cause, without locking out someone who fixes a typo and resubmits.
//
// In-memory: fine for a single instance, and it degrades safely (a restart
// resets the windows). For multi-instance deployments swap the Map for Redis
// or your platform's KV store — the interface below is deliberately small.
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS = 5; // accepted enquiries per client per window
const MAX_ATTEMPTS = 20; // any POST per client per window
// Memory bound: beyond this many clients the least recently active one is
// forgotten. Each entry holds at most MAX_ATTEMPTS timestamps.
const MAX_TRACKED_CLIENTS = 10_000;

const RATE_LIMITED_MESSAGE = "Too many enquiries from this connection. Please try again shortly.";

/**
 * Sliding-window counter with a hard cap on tracked keys. The Map's insertion
 * order doubles as recency order (a key is re-inserted on every hit), so the
 * eviction candidate is always the first key — O(1), never a full sweep.
 */
export class SlidingWindowLimiter {
  private readonly hits = new Map<string, number[]>();
  private readonly max: number;
  private readonly windowMs: number;
  private readonly maxKeys: number;

  constructor(max: number, windowMs: number, maxKeys: number) {
    this.max = max;
    this.windowMs = windowMs;
    this.maxKeys = maxKeys;
  }

  /** True if `key` has used its allowance. Records nothing. */
  isLimited(key: string, now = Date.now()): boolean {
    return this.recent(key, now).length >= this.max;
  }

  /**
   * Records one hit for `key`, unless it is already limited. Returns true when
   * the hit was refused (and therefore not recorded).
   */
  hit(key: string, now = Date.now()): boolean {
    const recent = this.recent(key, now);
    if (recent.length >= this.max) return true;

    recent.push(now);
    this.hits.delete(key);
    this.hits.set(key, recent);

    while (this.hits.size > this.maxKeys) {
      const oldest = this.hits.keys().next().value;
      if (oldest === undefined) break;
      this.hits.delete(oldest);
    }
    return false;
  }

  /** Number of keys currently tracked (for tests and diagnostics). */
  get size(): number {
    return this.hits.size;
  }

  private recent(key: string, now: number): number[] {
    const times = this.hits.get(key);
    if (!times) return [];
    const recent = times.filter((t) => now - t < this.windowMs);
    if (recent.length === 0) this.hits.delete(key);
    else if (recent.length !== times.length) this.hits.set(key, recent);
    return recent;
  }
}

const attempts = new SlidingWindowLimiter(MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MS, MAX_TRACKED_CLIENTS);
const submissions = new SlidingWindowLimiter(MAX_SUBMISSIONS, RATE_LIMIT_WINDOW_MS, MAX_TRACKED_CLIENTS);

/**
 * True when this client has no allowance left. Records nothing, so a host can
 * call it BEFORE reading the request body — a client that is already limited
 * never gets a multi-megabyte upload parsed.
 */
export function isClientRateLimited(req: ApiRequest): boolean {
  const ip = clientIp(req);
  return attempts.isLimited(ip) || submissions.isLimited(ip);
}

export function sendRateLimited(res: ApiResponse): void {
  res.status(429).json({ ok: false, message: RATE_LIMITED_MESSAGE });
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
 * - If `req.ip` is unset (the handler called without Express), fall back to
 *   the rightmost entry, which is the one the platform's own edge appended.
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
export function rateLimitKey(raw: string): string {
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

/**
 * Single-line fields: every control character — line breaks included —
 * becomes a space, then the value is trimmed and capped. Applied before
 * validation.
 */
export function cleanLine(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max);
}

/**
 * Multi-line fields (the message). Line breaks carry the structure of what
 * someone wrote — paragraphs, lists — so they are kept, normalised to "\n".
 * Tabs are kept; every other control character becomes a space. The email
 * renders the result with white-space: pre-wrap, and HTML is escaped
 * separately, so keeping newlines adds no injection surface.
 */
export function cleanMultiline(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return (
    value
      .replace(/\r\n?/g, "\n")
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, " ")
      .trim()
      .slice(0, max)
  );
}

// ---------------------------------------------------------------------------
// Log redaction
//
// What this server writes to stdout/stderr (on Azure, the console logs) may
// be shipped to a log store with its own retention (see the privacy policy).
// Error text can quote a visitor's email address: Resend's error responses
// can repeat the value they rejected, and Node's JSON parse errors quote part
// of the input. Every error this server logs goes through describeErrorForLog().
//
// This is best-effort: it removes anything shaped like an address, but can't
// promise to catch every possible format. And it covers only what this
// process logs. The platform's own HTTP request logs (Azure's
// AppServiceHTTPLogs: client IP, URL with query string, user agent, referrer)
// are written outside the app and are not redacted.
// ---------------------------------------------------------------------------

/**
 * A run of characters that can't delimit an address in running text:
 * anything except whitespace, quotes, backticks, angle brackets, brackets,
 * commas, semicolons and colons. A single negated class with no alternation
 * or nesting, so splitting text into these tokens is linear in its length —
 * important because log text can come from outside (a deliberately crafted
 * "a…@b…@…." must not be able to stall the server).
 */
const LOG_TOKEN = /[^\s"'`<>()[\]{},;:]+/g;

/**
 * Whether a token is shaped like local@domain.tld: a non-empty local part
 * before the first "@" (or its URL-encoded form "%40", as in a query string),
 * and a dot inside the domain part (not straight after the "@", not the final
 * character, so "asha@example.com." at the end of a sentence still counts).
 * A token that ends right at a literal "@" is also redacted: that is a local
 * part cut off by a delimiter, as in "user@[203.0.113.7]". (Not for "%40",
 * which also appears in ordinary text such as "100%40".) Plain index checks —
 * linear, no backtracking.
 */
function looksLikeEmail(token: string): boolean {
  let at = token.indexOf("@");
  let width = 1;
  if (at === -1) {
    at = token.indexOf("%40");
    width = 3;
  }
  if (at <= 0) return false;
  if (at + width === token.length) return width === 1;
  return token.slice(at + width + 1, -1).includes(".");
}

/**
 * Replaces every email-like token with a fixed marker. Over-redaction is
 * deliberate: a whole token goes (e.g. "user=asha@example.com"), never part
 * of one, so no fragment of an address survives.
 */
export function redactEmails(text: string): string {
  return text.replace(LOG_TOKEN, (token) => (looksLikeEmail(token) ? "[email redacted]" : token));
}

/**
 * A log-safe description of a thrown value, with email addresses redacted.
 * Objects (Errors included) are formatted as console.error() would format
 * them: the stack, any extra properties, and the `cause` chain, which is
 * where e.g. fetch() puts the network error behind "fetch failed".
 * Primitives use String().
 */
export function describeErrorForLog(error: unknown): string {
  const text = typeof error === "object" && error !== null ? inspect(error) : String(error);
  return redactEmails(text);
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

type FileCheck = "ok" | "invalid" | "active-content";

/**
 * Checks the actual bytes, never just the extension — renaming a .exe to
 * .pdf costs an attacker nothing.
 * - PDF: the "%PDF" signature.
 * - DOC (legacy binary / OLE2): the 8-byte compound-file signature.
 * - DOCX: a ZIP archive whose contents are a Word document — see checkDocx.
 */
function checkFileContents(buffer: Buffer, ext: ResumeExt): FileCheck {
  switch (ext) {
    case "pdf":
      return buffer.subarray(0, 4).toString("latin1") === "%PDF" ? "ok" : "invalid";
    case "doc":
      return buffer
        .subarray(0, 8)
        .equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))
        ? "ok"
        : "invalid";
    case "docx":
      return checkDocx(buffer);
  }
}

// --- DOCX structure ----------------------------------------------------------
// A .docx is a ZIP archive, so a signature check alone would accept ANY zip —
// including one carrying an executable — and that file is then emailed to the
// team. Reading the archive's central directory (its table of contents) is
// cheap and needs no decompression: nothing is ever extracted.

/** Parts every Word document has. */
const DOCX_REQUIRED_PARTS = ["[content_types].xml", "word/document.xml"];

/** Where a Word document's parts live. Anything elsewhere has no business in a resume. */
const DOCX_ALLOWED_LOCATIONS = ["[content_types].xml", "_rels/", "docprops/", "word/", "customxml/"];

/**
 * Parts that carry active content: VBA macros (only legitimate in .docm),
 * ActiveX controls, embedded OLE objects (a long-standing malware vehicle, and
 * the format of the old Equation Editor), and executable or script files.
 */
const DOCX_ACTIVE_CONTENT =
  /(^|\/)vbaproject\.bin$|(^|\/)vbadata\.xml$|^word\/activex\/|^word\/embeddings\/.*\.bin$|\.(exe|dll|com|scr|pif|cpl|bat|cmd|ps1|vbs|vbe|js|jse|wsf|wsh|hta|msi|jar|lnk)$/;

const ZIP_MAX_ENTRIES = 2000;
const ZIP_LOCAL_HEADER = 0x04034b50;
const ZIP_CENTRAL_HEADER = 0x02014b50;
const ZIP_END_OF_DIRECTORY = 0x06054b50;

function checkDocx(buffer: Buffer): FileCheck {
  if (buffer.length < 30 || buffer.readUInt32LE(0) !== ZIP_LOCAL_HEADER) return "invalid";

  const entries = readZipDirectory(buffer);
  if (!entries) return "invalid";

  const names = new Set<string>();
  for (const { name, encrypted } of entries) {
    if (encrypted) return "invalid"; // can't be inspected, and Word never does this
    const lower = name.toLowerCase();
    // Never extracted, but a ".." or absolute path would dodge the location check.
    if (!lower || lower.startsWith("/") || lower.includes("\\") || lower.includes("\0")) return "invalid";
    if (lower.split("/").includes("..")) return "invalid";
    if (DOCX_ACTIVE_CONTENT.test(lower)) return "active-content";
    if (!DOCX_ALLOWED_LOCATIONS.some((loc) => (loc.endsWith("/") ? lower.startsWith(loc) : lower === loc))) {
      return "invalid";
    }
    names.add(lower);
  }

  return DOCX_REQUIRED_PARTS.every((part) => names.has(part)) ? "ok" : "invalid";
}

/**
 * Reads entry names from a ZIP's central directory, or returns null if the
 * archive is malformed, truncated, split across disks, ZIP64, or has more
 * entries than any resume would. Every offset is bounds-checked.
 */
function readZipDirectory(buffer: Buffer): { name: string; encrypted: boolean }[] | null {
  // The end-of-central-directory record is 22 bytes plus a comment of up to
  // 65,535 bytes, so it must start within the archive's last 65,557 bytes.
  const searchFloor = Math.max(0, buffer.length - (22 + 0xffff));
  let eocd = -1;
  for (let i = buffer.length - 22; i >= searchFloor; i--) {
    if (buffer.readUInt32LE(i) === ZIP_END_OF_DIRECTORY) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) return null;

  const thisDisk = buffer.readUInt16LE(eocd + 4);
  const directoryDisk = buffer.readUInt16LE(eocd + 6);
  const entriesOnDisk = buffer.readUInt16LE(eocd + 8);
  const totalEntries = buffer.readUInt16LE(eocd + 10);
  const directorySize = buffer.readUInt32LE(eocd + 12);
  const directoryOffset = buffer.readUInt32LE(eocd + 16);

  if (thisDisk !== 0 || directoryDisk !== 0 || entriesOnDisk !== totalEntries) return null;
  if (totalEntries === 0xffff || directorySize === 0xffffffff || directoryOffset === 0xffffffff) return null;
  if (totalEntries === 0 || totalEntries > ZIP_MAX_ENTRIES) return null;
  const directoryEnd = directoryOffset + directorySize;
  if (directoryEnd > eocd) return null;

  const entries: { name: string; encrypted: boolean }[] = [];
  let p = directoryOffset;
  for (let n = 0; n < totalEntries; n++) {
    if (p + 46 > directoryEnd || buffer.readUInt32LE(p) !== ZIP_CENTRAL_HEADER) return null;
    const flags = buffer.readUInt16LE(p + 8);
    const nameLength = buffer.readUInt16LE(p + 28);
    const extraLength = buffer.readUInt16LE(p + 30);
    const commentLength = buffer.readUInt16LE(p + 32);
    const nameEnd = p + 46 + nameLength;
    if (nameEnd > directoryEnd) return null;
    entries.push({ name: buffer.toString("utf8", p + 46, nameEnd), encrypted: (flags & 0x1) !== 0 });
    p = nameEnd + extraLength + commentLength;
  }
  return entries;
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
export function validateResume(
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

  // Buffer.from silently skips characters that aren't base64, so decode and
  // re-encode: only input that survives the round trip unchanged is genuine
  // base64 (the browser's FileReader always produces that). The attachment is
  // then built from the canonical re-encoding of the bytes that were checked.
  const buffer = Buffer.from(base64, "base64");
  const canonical = buffer.toString("base64");
  if (canonical !== base64) {
    return { error: "We couldn't read that file. Please try again." };
  }

  if (buffer.length === 0 || buffer.length > RESUME_MAX_BYTES) {
    return { error: `Please keep your resume under ${RESUME_MAX_BYTES / (1024 * 1024)} MB.` };
  }

  const check = checkFileContents(buffer, ext as ResumeExt);
  if (check === "active-content") {
    return {
      error:
        "That document contains macros or embedded objects. Please save it without them, or upload a PDF.",
    };
  }
  if (check !== "ok") {
    return { error: "That file doesn't look like a valid resume." };
  }

  return {
    attachment: {
      filename: safeResumeFilename(applicantName, ext as ResumeExt),
      mimeType: RESUME_MIME_TYPES[ext as ResumeExt],
      base64: canonical,
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

  // The form always sends JSON. Anything else would arrive unparsed, so say
  // so plainly instead of answering with a confusing set of field errors.
  const contentType = String(req.headers["content-type"] ?? "").split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    res.status(415).json({ ok: false, message: "That request could not be read." });
    return;
  }

  // Reject oversized bodies before doing any work
  const contentLength = Number(req.headers["content-length"] ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    res.status(413).json({ ok: false, message: "That request was too large." });
    return;
  }

  const ip = clientIp(req);
  if (attempts.hit(ip)) {
    sendRateLimited(res);
    return;
  }

  const body = (typeof req.body === "object" && req.body !== null ? req.body : {}) as Record<
    string,
    unknown
  >;

  // Honeypot: a hidden field real users never fill. Respond 200 so bots get no
  // signal that they were caught, but do nothing with the submission.
  if (cleanLine(body.website, 100)) {
    res.status(200).json({ ok: true });
    return;
  }

  // Whitelist — anything else the client sent is discarded
  const payload: EnquiryPayload = {
    name: cleanLine(body.name, LIMITS.name),
    email: cleanLine(body.email, LIMITS.email),
    phone: cleanLine(body.phone, LIMITS.phone),
    organization: cleanLine(body.organization, LIMITS.organization),
    enquiryType: cleanLine(body.enquiryType, 60),
    budget: cleanLine(body.budget, 60),
    source: cleanLine(body.source, 60),
    message: cleanMultiline(body.message, LIMITS.message),
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

  // Counted only once an enquiry is valid, i.e. would actually send an email.
  if (submissions.hit(ip)) {
    sendRateLimited(res);
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
    // The log line itself carries no email addresses (describeErrorForLog).
    console.error("[contact] delivery failed:", describeErrorForLog(error));
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
    // Read the body for the server-side log only — never forwarded to the
    // client. Resend can quote the address it rejected, so email addresses
    // are redacted before the text goes anywhere (and before truncating, so a
    // cut can't leave half an address behind).
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend API responded ${response.status}: ${redactEmails(detail).slice(0, 500)}`);
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
    console.error("[contact] storage failed (email was still sent):", describeErrorForLog(error));
  }
}
