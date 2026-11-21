/**
 * The Express application: security headers, the enquiry API, the health
 * check and the static frontend. Built by createApp() so tests can run the
 * exact production middleware chain in-process; server/index.ts reads the
 * environment, listens, and handles shutdown.
 */

import express from "express";
import compression from "compression";
import path from "node:path";
import defaultContactHandler, {
  MAX_BODY_BYTES,
  isClientRateLimited,
  sendRateLimited,
  type ApiRequest,
  type ApiResponse,
} from "../api/contact";

export type ContactHandler = (req: ApiRequest, res: ApiResponse) => Promise<void>;

export interface AppOptions {
  /** Directory holding the built frontend (index.html, assets/, legal pages). */
  distPath: string;
  /** Reverse proxies in front of the app that append to X-Forwarded-For. */
  trustProxyHops: number;
  /** Hostname every other host redirects to, or "" to disable redirects. */
  canonicalHost: string;
  /** Commit the running build came from; reported by /api/health. */
  buildSha: string;
  /** True once the process has started draining for shutdown. */
  isShuttingDown: () => boolean;
  /** Replaces the enquiry handler — tests only. */
  contactHandler?: ContactHandler;
}

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

export const CSP = contentSecurityPolicy("'self' 'unsafe-inline' 'unsafe-eval'");
export const CSP_REPORT_ONLY = contentSecurityPolicy("'self'");

/**
 * The legal pages and the app shell are also reachable under their file
 * names, because express.static serves dist/ as-is. Send those to the one
 * canonical URL each, so search engines never see duplicates.
 */
const LEGACY_PAGE_PATHS: Record<string, string> = {
  "/index.html": "/",
  "/privacy-policy.html": "/privacy-policy",
  "/terms-of-use.html": "/terms-of-use",
};

export function createApp(options: AppOptions): express.Express {
  const { distPath, trustProxyHops, canonicalHost, buildSha, isShuttingDown } = options;
  const contactHandler = options.contactHandler ?? defaultContactHandler;

  // Vite writes content-hashed build output here — the only files that are
  // safe to cache forever. Files copied from public/ land in dist/ itself.
  const hashedAssetsPath = path.join(distPath, "assets") + path.sep;

  const app = express();

  app.set("trust proxy", trustProxyHops);

  // Don't advertise the framework.
  app.disable("x-powered-by");

  // While draining, tell keep-alive clients (including the platform's front end,
  // which pools connections) not to reuse this connection.
  app.use((_req, res, next) => {
    if (isShuttingDown()) res.setHeader("Connection", "close");
    next();
  });

  // Gzip/brotli text responses (HTML/CSS/JS/JSON) — meaningfully smaller
  // transfers for near-zero cost. Images/fonts are already compressed formats
  // and this middleware skips them on its own.
  app.use(compression());

  app.use((_req, res, next) => {
    res.setHeader("Content-Security-Policy", CSP);
    res.setHeader("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    // interest-cohort (FLoC) is gone from browsers, which now log a console
    // error for it; the remaining features are still blocked.
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    // Only meaningful over HTTPS; the platform's front end terminates TLS.
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });

  // --- Canonical host -------------------------------------------------------
  // Only active when a canonical host is configured. The health check is
  // exempt: platform probes reach the instance on internal hostnames and must
  // get a plain 200.
  if (canonicalHost) {
    app.use((req, res, next) => {
      if (req.path === "/api/health") return next();

      const host = (req.headers.host ?? "").trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
      if (host === canonicalHost) return next();

      // Only ever redirect to the configured host — never echo the request's
      // Host header — and only with an origin-relative path.
      const target = req.originalUrl.startsWith("/") ? req.originalUrl : "/";
      // 308 preserves the method and body for non-GET requests (a form POST).
      const status = req.method === "GET" || req.method === "HEAD" ? 301 : 308;
      res.redirect(status, `https://${canonicalHost}${target}`);
    });
  }

  // --- API ------------------------------------------------------------------
  // API responses are per-request and sometimes personal; no cache may keep them.
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });

  // Express 4 doesn't catch rejected promises: without the .catch, an
  // unexpected error inside the handler would be an unhandled rejection, which
  // terminates the whole Node process.
  const runContact: express.RequestHandler = (req, res, next) => {
    contactHandler(req as unknown as ApiRequest, res as unknown as ApiResponse).catch(next);
  };

  // A client that is already over its limit is refused before its body is
  // parsed. The body is still read — and thrown away chunk by chunk, never
  // buffered — because answering mid-upload makes clients report a
  // connection reset instead of the 429 message (body-parser drains before
  // its 413 for the same reason). A body declared or found to be over the
  // size cap isn't worth reading: it gets the 429 at once and the connection
  // is closed.
  const refuseIfRateLimited: express.RequestHandler = (req, res, next) => {
    if (!isClientRateLimited(req as unknown as ApiRequest)) {
      next();
      return;
    }
    discardBody(req, MAX_BODY_BYTES, (complete) => {
      if (!complete) res.setHeader("Connection", "close");
      sendRateLimited(res as unknown as ApiResponse);
    });
  };

  // Bodies are parsed only here — for a POST to the enquiry endpoint — and
  // only after the rate limit is checked, so neither an arbitrary URL nor a
  // client that is already limited can make the server buffer and parse a
  // multi-megabyte upload. The limit is derived from the resume cap
  // (api/contact.ts MAX_BODY_BYTES).
  app.post("/api/contact", refuseIfRateLimited, express.json({ limit: MAX_BODY_BYTES }), runContact);
  // Every other method reaches the handler too, for its proper 405 + Allow.
  app.all("/api/contact", runContact);

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

  // Liveness for the platform's health check, plus the build that is running,
  // so a deployment can confirm the NEW build is serving rather than the one
  // it replaced. Reports 503 while draining so a load balancer stops routing
  // new traffic to an instance that is shutting down.
  app.get("/api/health", (_req, res) => {
    if (isShuttingDown()) {
      res.status(503).json({ ok: false, status: "shutting-down", version: buildSha });
      return;
    }
    res.status(200).json({ ok: true, version: buildSha });
  });

  // Unknown API routes answer in JSON, not with the HTML 404 page.
  app.use("/api", (_req, res) => {
    res.status(404).json({ ok: false, message: "Not found." });
  });

  // --- Static frontend ------------------------------------------------------
  app.get(Object.keys(LEGACY_PAGE_PATHS), (req, res) => {
    // Express matches routes case-insensitively and tolerates a trailing slash.
    const target = LEGACY_PAGE_PATHS[req.path.toLowerCase().replace(/\/+$/, "")] ?? "/";
    // The target is a fixed path; only the query string is carried over.
    const queryStart = req.originalUrl.indexOf("?");
    res.redirect(301, target + (queryStart === -1 ? "" : req.originalUrl.slice(queryStart)));
  });
  // The 404 page is a template, not a page in its own right.
  app.get("/404.html", (_req, res) => sendPage(res, distPath, "404.html", 404));

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

  // Single-page site: "/" is the only route that returns the interactive app
  // shell. The legal pages are deliberately plain static HTML, not part of the
  // React bundle — nobody needs the 3D scene to read a privacy policy, and it
  // keeps them reachable at clean URLs without pulling in a router.
  app.get("/", (_req, res) => sendPage(res, distPath, "index.html"));
  app.get("/privacy-policy", (_req, res) => sendPage(res, distPath, "privacy-policy.html"));
  app.get("/terms-of-use", (_req, res) => sendPage(res, distPath, "terms-of-use.html"));

  // Anything else is genuinely not found — a real 404 status with a branded
  // page, not a silent 200 of the homepage.
  app.use((_req, res) => sendPage(res, distPath, "404.html", 404));

  // Last-resort handler: log internally, return nothing revealing. If the
  // response had already started, Express's own handler closes the connection.
  app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[server] unhandled error:", err);
    if (res.headersSent) {
      next(err);
      return;
    }
    res.status(500).json({ ok: false, message: "Something went wrong. Please try again." });
  });

  return app;
}

function sendPage(res: express.Response, distPath: string, file: string, status = 200): void {
  res.status(status);
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.join(distPath, file));
}

/**
 * Reads a request body to its end and discards it, holding no more than one
 * chunk in memory. Calls done(true) once the whole body has been read, or
 * done(false) as soon as it is known to exceed `limit` (declared or actual)
 * or the stream fails.
 */
function discardBody(req: express.Request, limit: number, done: (complete: boolean) => void): void {
  if (Number(req.headers["content-length"] ?? 0) > limit) {
    done(false);
    return;
  }
  let received = 0;
  let settled = false;
  const settle = (complete: boolean) => {
    if (settled) return;
    settled = true;
    req.removeListener("data", onData);
    done(complete);
  };
  const onData = (chunk: Buffer) => {
    received += chunk.length;
    if (received > limit) settle(false);
  };
  req.on("data", onData);
  req.once("end", () => settle(true));
  req.once("error", () => settle(false));
  req.resume();
}

function isBodyParserError(err: unknown): err is { type: string; status?: number } {
  return typeof err === "object" && err !== null && typeof (err as { type?: unknown }).type === "string";
}
