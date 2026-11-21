/**
 * Production server (Azure App Service, Railway, or any Node host).
 *
 * Serves the built frontend from `dist/` and hosts the enquiry API on the same
 * origin, so no CORS configuration is needed. Reuses the exact same handler as
 * the serverless deployment — the request/response shapes are compatible, so
 * there is one implementation of the contact logic, not two.
 *
 *   npm run build   # typecheck, vite build -> dist/, bundle this file -> dist-server/index.js
 *   npm start       # node dist-server/index.js
 *
 * The bundle inlines server/app.ts, api/ and src/shared/, so at runtime the
 * host only needs dist/, dist-server/, package.json and the production
 * node_modules (express, compression). `npm run dev:server` runs this file
 * unbundled via tsx.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app";

// Named to avoid shadowing the __dirname global that @types/node declares.
const moduleDir = path.dirname(fileURLToPath(import.meta.url));
// server/ (tsx) and dist-server/ (bundled) both sit one level below the
// project root, so this resolves to the same dist/ either way.
const distPath = path.resolve(moduleDir, "../dist");

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
 * When set (e.g. "www.nexyronix.com"), requests for any other hostname —
 * nexyronix.com, <app>.azurewebsites.net — are permanently redirected there.
 * Leave it UNSET until the custom domain is bound to this deployment, or
 * pre-cutover testing on the platform's own hostname will bounce to whichever
 * host the domain currently points at. Never set it to a host that itself
 * redirects back (today the apex forwards to www), or the two loop.
 */
const CANONICAL_HOST = readCanonicalHost();

/**
 * Commit this server was built from. `npm run build` bakes it in at bundle
 * time (scripts/build-server.mjs replaces this expression with a literal).
 * Unbundled (`npm run dev:server`) it comes from the environment, if at all.
 */
const BUILD_SHA = process.env.BUILD_SHA || "development";

// Longer than the Resend request timeout (10 s, api/contact.ts), so an
// enquiry that is mid-send when the platform stops this instance completes.
const SHUTDOWN_TIMEOUT_MS = 15_000;

let shuttingDown = false;

const app = createApp({
  distPath,
  trustProxyHops: TRUST_PROXY_HOPS,
  canonicalHost: CANONICAL_HOST,
  buildSha: BUILD_SHA,
  isShuttingDown: () => shuttingDown,
});

const server = app.listen(PORT, HOST, () => {
  console.log(
    `Nexyronix server listening on http://${HOST}:${PORT} ` +
      `(build ${BUILD_SHA}, trust proxy hops: ${TRUST_PROXY_HOPS}, canonical host: ${CANONICAL_HOST || "off"})`
  );
  // Names only — never values. Makes a misconfigured deployment obvious in
  // the platform's log stream instead of only when someone submits the form.
  const missing = ["RESEND_API_KEY", "CONTACT_EMAIL", "SMTP_FROM"].filter((name) => !process.env[name]);
  if (missing.length) {
    console.warn(`[server] contact form will fail until these are set: ${missing.join(", ")}`);
  }
});

// --- Connection timeouts ------------------------------------------------------
// Platform front ends pool connections to the app. Node's default 5 s
// keep-alive is shorter than a pooling proxy's idle timeout, so the proxy can
// reuse a connection Node has just closed, which surfaces as an occasional 502.
// Keeping idle connections for 65 s avoids that; headersTimeout must be longer
// still. requestTimeout bounds a slow-drip upload: 3 minutes still fits a
// full-size resume on a slow mobile connection, and is under App Service's
// 230 s front-end limit, so the app answers before the platform gives up.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;
server.requestTimeout = 180_000;

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
