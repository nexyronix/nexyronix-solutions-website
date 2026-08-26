/**
 * Production server (Railway / any Node host).
 *
 * Serves the built frontend from `dist/` and hosts the enquiry API on the same
 * origin, so no CORS configuration is needed. Reuses the exact same handler as
 * the serverless deployment — the request/response shapes are compatible, so
 * there is one implementation of the contact logic, not two.
 *
 * Start with:  npm run build && npm start
 */

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import contactHandler, { type ApiRequest, type ApiResponse } from "../api/contact";

// Named to avoid shadowing the __dirname global that @types/node declares.
const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(moduleDir, "../dist");

// Railway (and most hosts) inject PORT. Never hard-code it, and bind 0.0.0.0 —
// binding localhost would make the container unreachable from outside.
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

const app = express();

// Behind Railway's proxy, so x-forwarded-for is what identifies the client.
// Required for the API's per-IP rate limiting to see real addresses.
app.set("trust proxy", 1);

// Don't advertise the framework.
app.disable("x-powered-by");

/**
 * Security headers.
 *
 * The CSP below is deliberately tested against what this site actually uses:
 * - 'unsafe-inline' on style-src: Tailwind injects inline styles, and several
 *   components set style={{...}} for animation delays. Without it, layout breaks.
 * - 'unsafe-eval' on script-src: some Three.js builds compile shaders this way.
 *   Remove it and re-test the 3D scenes if you want to tighten further.
 * - fonts.googleapis.com / fonts.gstatic.com: the webfonts.
 * - blob: and data: on img-src: WebGL canvas readback and inline SVG data URLs.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
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

app.use((_req, res, next) => {
  res.setHeader("Content-Security-Policy", CSP);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  // Only meaningful over HTTPS; Railway terminates TLS in front of us.
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Body limit mirrors the cap enforced inside the handler.
app.use(express.json({ limit: "16kb" }));

// Malformed JSON should be a clean 400, not an unhandled crash.
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && typeof err === "object" && "type" in err) {
    res.status(400).json({ ok: false, message: "That request could not be read." });
    return;
  }
  next(err);
});

// --- API ------------------------------------------------------------------
app.post("/api/contact", (req, res) => {
  void contactHandler(req as unknown as ApiRequest, res as unknown as ApiResponse);
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// --- Static frontend ------------------------------------------------------
// Hashed build assets are safe to cache hard; index.html must not be.
app.use(
  express.static(distPath, {
    index: false,
    setHeaders(res, filePath) {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else if (/\.(js|css|woff2?|svg|png|jpg|webp|avif)$/.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  })
);

// Single-page site: "/" is the only real route, so it's the only path that
// should return the app shell.
app.get("/", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Anything else is genuinely not found — a real 404 status with a branded
// page, not a silent 200 of the homepage.
app.use((_req, res) => {
  res.status(404).sendFile(path.join(distPath, "404.html"));
});

// Last-resort handler: log internally, return nothing revealing.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] unhandled error:", err);
  if (!res.headersSent) {
    res.status(500).json({ ok: false, message: "Something went wrong. Please try again." });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Nexyronix server listening on http://${HOST}:${PORT}`);
});
