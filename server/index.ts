/**
 * Production server (Azure App Service, Railway, or any Node host).
 *
 * Serves the built frontend from `dist/` and hosts the enquiry API on the same
 * origin, so no CORS configuration is needed. Reuses the exact same handler as
 * the serverless deployment — the request/response shapes are compatible, so
 * there is one implementation of the contact logic, not two.
 *
 *   npm run build   # typecheck, vite build -> dist/, esbuild this file -> dist-server/index.js
 *   npm start       # node dist-server/index.js
 *
 * The bundle inlines api/ and src/shared/, so at runtime the host only needs
 * dist/, dist-server/, package.json and the production node_modules
 * (express, compression). `npm run dev:server` runs this file unbundled via tsx.
 */

import express from "express";
import compression from "compression";
import path from "node:path";
import { fileURLToPath } from "node:url";
import contactHandler, { type ApiRequest, type ApiResponse } from "../api/contact";

// Named to avoid shadowing the __dirname global that @types/node declares.
const moduleDir = path.dirname(fileURLToPath(import.meta.url));
// server/ (tsx) and dist-server/ (bundled) both sit one level below the
// project root, so this resolves to the same dist/ either way.
const distPath = path.resolve(moduleDir, "../dist");
// Vite writes content-hashed build output here — the only files that are
// safe to cache forever. Files copied from public/ land in dist/ itself.
const hashedAssetsPath = path.join(distPath, "assets") + path.sep;

// The platform injects PORT (Azure App Service, Railway). Never hard-code it,
// and bind 0.0.0.0 — binding localhost makes the container unreachable.
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

/**
 * Number of reverse proxies in front of this process that append to
 * X-Forwarded-For. Express then takes the client address from the entry
 * those proxies added, ignoring anything the client wrote itself.
 *   1 = Azure App Service or Railway on their own (default)
 *   2 = e.g. Azure Front Door in front of App Service
 */
const TRUST_PROXY_HOPS = readHopCount("TRUST_PROXY_HOPS", 1);

/**
 * When set (e.g. "nexyronix.com"), requests for any other hostname —
 * www.nexyronix.com, <app>.azurewebsites.net — are permanently redirected
 * there. Leave it UNSET until the custom domain is bound to this deployment,
 * or pre-cutover testing on the platform's own hostname will bounce to
 * whichever host the domain currently points at.
 */
const CANONICAL_HOST = readCanonicalHost();

// Longer than the Resend request timeout (10 s, api/contact.ts), so an
// enquiry that is mid-send when the platform stops this instance completes.
const SHUTDOWN_TIMEOUT_MS = 15_000;

let shuttingDown = false;

const app = express();

app.set("trust proxy", TRUST_PROXY_HOPS);

// Don't advertise the framework.
app.disable("x-powered-by");

// While draining, tell keep-alive clients (including the platform's front end,
// which pools connections) not to reuse this connection.
app.use((_req, res, next) => {
  if (shuttingDown) res.setHeader("Connection", "close");
  next();
});

// Gzip/brotli text responses (HTML/CSS/JS/JSON) — meaningfully smaller
// transfers for near-zero cost. Images/fonts are already compressed formats
// and this middleware skips them on its own.
app.use(compression());

/**
 * Security headers.
 *
 * The enforced CSP is deliberately tested against what this site actually uses:
 * - 'unsafe-inline' on style-src: Tailwind injects inline styles, and several
 *   components set style={{...}} for animation delays. Without it, layout breaks.
 * - 'unsafe-eval' on script-src: some Three.js builds compile shaders this way.
 * - fonts.googleapis.com / fonts.gstatic.com: the webfonts.
 * - blob: and data: on img-src: WebGL canvas readback and inline SVG data URLs.
 *
 * A stricter candidate is sent alongside as Content-Security-Policy-Report-Only:
 * identical except script-src drops 'unsafe-inline' and 'unsafe-eval'. Browsers
 * never block anything because of it — they only log a console warning for
 * each script that WOULD have been blocked. Once a full pass over the site
 * (including both 3D scenes) logs no violations, promote it to the enforced
 * header. Add a `report-uri`/`report-to` directive if you want violations
 * collected centrally rather than read from DevTools.
 */
function contentSecurityPolicy(scriptSrc: string): string {
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

const CSP = contentSecurityPolicy("'self' 'unsafe-inline' 'unsafe-eval'");
const CSP_REPORT_ONLY = contentSecurityPolicy("'self'");

app.use((_req, res, next) => {
  res.setHeader("Content-Security-Policy", CSP);
  res.setHeader("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  // Only meaningful over HTTPS; the platform's front end terminates TLS.
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// --- Canonical host ---------------------------------------------------------
// Only active when CANONICAL_HOST is set. The health check is exempt: platform
// probes reach the instance on internal hostnames and must get a plain 200.
if (CANONICAL_HOST) {
  app.use((req, res, next) => {
    if (req.path === "/api/health") return next();

    const host = (req.headers.host ?? "").trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
    if (host === CANONICAL_HOST) return next();

    // Only ever redirect to the configured host — never echo the request's
    // Host header — and only with an origin-relative path.
    const target = req.originalUrl.startsWith("/") ? req.originalUrl : "/";
    // 308 preserves the method and body for non-GET requests (a form POST).
    const status = req.method === "GET" || req.method === "HEAD" ? 301 : 308;
    res.redirect(status, `https://${CANONICAL_HOST}${target}`);
  });
}

// Body limit mirrors the cap enforced inside the handler. Sized for a
// base64-encoded resume attachment (up to 5 MB raw, ~37% larger encoded)
// plus the rest of the form fields — see api/contact.ts's MAX_BODY_BYTES.
app.use(express.json({ limit: "8mb" }));

// Body-parser failures get a clean JSON response with the correct status —
// 413 for an oversized body, 415 for an unsupported encoding, otherwise 400 —
// rather than an unhandled crash or a misleading generic error.
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!isBodyParserError(err)) {
    next(err);
    return;
  }
  if (err.status === 413) {
    res.status(413).json({ ok: false, message: "That request was too large." });
  } else if (err.status === 415) {
    res.status(415).json({ ok: false, message: "That request could not be read." });
  } else {
    res.status(400).json({ ok: false, message: "That request could not be read." });
  }
});

// --- API ------------------------------------------------------------------
// All methods reach the handler so a GET/PUT gets its proper 405 + Allow.
app.all("/api/contact", (req, res) => {
  void contactHandler(req as unknown as ApiRequest, res as unknown as ApiResponse);
});

// Liveness for the platform's health check. Reports 503 while draining so a
// load balancer stops routing new traffic to an instance that is shutting down.
app.get("/api/health", (_req, res) => {
  if (shuttingDown) {
    res.status(503).json({ ok: false, status: "shutting-down" });
    return;
  }
  res.status(200).json({ ok: true });
});

// Unknown API routes answer in JSON, not with the HTML 404 page.
app.use("/api", (_req, res) => {
  res.status(404).json({ ok: false, message: "Not found." });
});

// --- Static frontend ------------------------------------------------------
// Content-hashed build output (dist/assets/) is cached for a year; a changed
// file gets a new name, so it can never go stale. Everything else (favicon,
// og-image, robots.txt, sitemap.xml) keeps its name across deploys, so it
// gets a short cache. HTML always revalidates.
app.use(
  express.static(distPath, {
    index: false,
    setHeaders(res, filePath) {
      if (filePath.startsWith(hashedAssetsPath)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else {
        res.setHeader("Cache-Control", "public, max-age=3600");
      }
    },
  })
);

function sendPage(res: express.Response, file: string, status = 200): void {
  res.status(status);
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.join(distPath, file));
}

// Single-page site: "/" is the only route that returns the interactive app
// shell. The legal pages are deliberately plain static HTML, not part of the
// React bundle — nobody needs the 3D scene to read a privacy policy, and it
// keeps them reachable at clean URLs without pulling in a router.
app.get("/", (_req, res) => sendPage(res, "index.html"));
app.get("/privacy-policy", (_req, res) => sendPage(res, "privacy-policy.html"));
app.get("/terms-of-use", (_req, res) => sendPage(res, "terms-of-use.html"));

// Anything else is genuinely not found — a real 404 status with a branded
// page, not a silent 200 of the homepage.
app.use((_req, res) => sendPage(res, "404.html", 404));

// Last-resort handler: log internally, return nothing revealing.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] unhandled error:", err);
  if (!res.headersSent) {
    res.status(500).json({ ok: false, message: "Something went wrong. Please try again." });
  }
});

const server = app.listen(PORT, HOST, () => {
  console.log(
    `Nexyronix server listening on http://${HOST}:${PORT} ` +
      `(trust proxy hops: ${TRUST_PROXY_HOPS}, canonical host: ${CANONICAL_HOST || "off"})`
  );
  // Names only — never values. Makes a misconfigured deployment obvious in
  // the platform's log stream instead of only when someone submits the form.
  const missing = ["RESEND_API_KEY", "CONTACT_EMAIL", "SMTP_FROM"].filter((name) => !process.env[name]);
  if (missing.length) {
    console.warn(`[server] contact form will fail until these are set: ${missing.join(", ")}`);
  }
});

// --- Graceful shutdown ----------------------------------------------------
// Platforms send SIGTERM before stopping an instance (restart, scale-in,
// deployment, slot swap). Stop accepting connections, let in-flight requests
// — e.g. an enquiry waiting on Resend — finish, then exit. A hard deadline
// guarantees the process never hangs the platform's stop sequence.
function shutdown(signal: NodeJS.Signals): void {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[server] ${signal} received — draining in-flight requests (max ${SHUTDOWN_TIMEOUT_MS / 1000}s)`);

  const deadline = setTimeout(() => {
    console.error("[server] drain deadline reached; exiting with requests still open");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  deadline.unref();

  // Keep-alive sockets with no request in flight would otherwise hold
  // close() open until they time out on their own.
  const sweep = setInterval(() => server.closeIdleConnections(), 500);
  sweep.unref();

  server.close((err) => {
    clearInterval(sweep);
    if (err) {
      console.error("[server] error while closing:", err);
      process.exit(1);
    }
    console.log("[server] all connections closed; exiting");
    process.exit(0);
  });
  server.closeIdleConnections();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// --- Config parsing ---------------------------------------------------------

function readHopCount(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  if (Number.isInteger(value) && value >= 0 && value <= 10) return value;
  console.warn(`[server] ignoring invalid ${name}=${JSON.stringify(raw)}; using ${fallback}`);
  return fallback;
}

function readCanonicalHost(): string {
  const raw = (process.env.CANONICAL_HOST ?? "").trim().toLowerCase().replace(/\.$/, "");
  if (!raw) return "";
  // A bare hostname only: no scheme, port, path or anything header-unsafe.
  if (/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(raw)) return raw;
  console.warn(`[server] ignoring invalid CANONICAL_HOST=${JSON.stringify(process.env.CANONICAL_HOST)}`);
  return "";
}

function isBodyParserError(err: unknown): err is { type: string; status?: number } {
  return typeof err === "object" && err !== null && typeof (err as { type?: unknown }).type === "string";
}
