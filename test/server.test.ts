/**
 * The HTTP behaviour of server/app.ts: routes, status codes, caching,
 * security headers, the health check and the canonical-host redirect.
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { CSP, CSP_REPORT_ONLY } from "../server/app";
import { freshIp, postEnquiry, request, startApp, TEST_BUILD_SHA, type RunningApp } from "./helpers";

let app: RunningApp;
before(async () => {
  app = await startApp();
});
after(async () => {
  await app.close();
});

describe("pages and status codes", () => {
  it("serves the app shell and legal pages with no-cache", async () => {
    for (const [path, title] of [
      ["/", "Home"],
      ["/privacy-policy", "Privacy Policy"],
      ["/terms-of-use", "Terms of Use"],
    ]) {
      const res = await request(app.port, { path });
      assert.equal(res.status, 200, path);
      assert.ok(res.text.includes(title), path);
      assert.equal(res.headers["cache-control"], "no-cache", path);
    }
  });

  it("answers unknown paths with the 404 page and a real 404 status", async () => {
    const res = await request(app.port, { path: "/does-not-exist" });
    assert.equal(res.status, 404);
    assert.ok(res.text.includes("Not Found"));
  });

  it("answers unknown API paths with JSON, not the HTML page", async () => {
    const res = await request(app.port, { path: "/api/nope" });
    assert.equal(res.status, 404);
    assert.deepEqual(res.json(), { ok: false, message: "Not found." });
    assert.equal(res.headers["cache-control"], "no-store");
  });

  it("does not read request bodies outside the enquiry endpoint (M1)", async () => {
    // Declare a 9 MB JSON body but send only 64 KB of it. A parser would
    // wait for the rest; getting the 404 while the upload is unfinished
    // proves the body is never buffered or parsed.
    const status = await new Promise<number>((resolve, reject) => {
      let answered = false;
      const req = http.request({
        host: "127.0.0.1",
        port: app.port,
        method: "POST",
        path: "/",
        headers: { "content-type": "application/json", "content-length": String(9 * 1024 * 1024) },
        agent: false,
      });
      req.on("response", (res) => {
        answered = true;
        resolve(res.statusCode ?? 0);
        res.resume();
        req.destroy(); // abandon the rest of the upload
      });
      // A reset after the response is expected (the upload was abandoned).
      req.on("error", (err) => {
        if (!answered) reject(err);
      });
      req.write(Buffer.alloc(64 * 1024, 0x61));
      setTimeout(() => reject(new Error("no response while the upload was unfinished")), 5000).unref();
    });
    assert.equal(status, 404);
  });
});

describe("legacy .html URLs (L5)", () => {
  it("301 to the clean URL, keeping only the query string", async () => {
    for (const [from, to] of [
      ["/index.html", "/"],
      ["/privacy-policy.html", "/privacy-policy"],
      ["/terms-of-use.html?ref=mail", "/terms-of-use?ref=mail"],
      ["/PRIVACY-POLICY.HTML", "/privacy-policy"],
    ]) {
      const res = await request(app.port, { path: from });
      assert.equal(res.status, 301, from);
      assert.equal(res.headers.location, to, from);
    }
  });

  it("never turns the query string into an off-site redirect", async () => {
    const res = await request(app.port, { path: "/index.html?//evil.example" });
    assert.equal(res.headers.location, "/?//evil.example");
  });

  it("serves /404.html with a 404 status, not as a page of its own", async () => {
    assert.equal((await request(app.port, { path: "/404.html" })).status, 404);
  });
});

describe("caching (L4)", () => {
  it("caches hashed assets forever, other static files for an hour", async () => {
    const asset = await request(app.port, { path: "/assets/index-AbC123.js" });
    assert.equal(asset.status, 200);
    assert.equal(asset.headers["cache-control"], "public, max-age=31536000, immutable");
    const favicon = await request(app.port, { path: "/favicon.svg" });
    assert.equal(favicon.headers["cache-control"], "public, max-age=3600");
  });

  it("marks every API response no-store", async () => {
    for (const path of ["/api/health", "/api/contact", "/api/unknown"]) {
      const res = await request(app.port, { path });
      assert.equal(res.headers["cache-control"], "no-store", path);
    }
  });

  it("compresses text responses", async () => {
    const res = await request(app.port, { path: "/assets/index-AbC123.js", headers: { "accept-encoding": "br" } });
    assert.equal(res.headers["content-encoding"], "br");
  });
});

describe("security headers", () => {
  it("sends the same enforced CSP as before, plus the stricter report-only policy", async () => {
    const res = await request(app.port, { path: "/" });
    const expectedCsp =
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'";
    assert.equal(CSP, expectedCsp);
    assert.equal(res.headers["content-security-policy"], expectedCsp);
    assert.equal(res.headers["content-security-policy-report-only"], CSP_REPORT_ONLY);
    assert.ok(CSP_REPORT_ONLY.includes("script-src 'self';"));
  });

  it("sends the remaining hardening headers on every response", async () => {
    for (const path of ["/", "/api/health", "/does-not-exist"]) {
      const h = (await request(app.port, { path })).headers;
      assert.equal(h["x-content-type-options"], "nosniff", path);
      assert.equal(h["x-frame-options"], "DENY", path);
      assert.equal(h["referrer-policy"], "strict-origin-when-cross-origin", path);
      assert.equal(h["strict-transport-security"], "max-age=31536000; includeSubDomains", path);
      assert.equal(h["permissions-policy"], "camera=(), microphone=(), geolocation=()", path);
      assert.equal(h["x-powered-by"], undefined, path);
    }
  });
});

describe("/api/health (M10)", () => {
  it("reports the build it is running", async () => {
    const res = await request(app.port, { path: "/api/health" });
    assert.equal(res.status, 200);
    assert.deepEqual(res.json(), { ok: true, version: TEST_BUILD_SHA });
  });

  it("returns 503 while draining for shutdown", async () => {
    const draining = await startApp({ isShuttingDown: () => true });
    try {
      const res = await request(draining.port, { path: "/api/health" });
      assert.equal(res.status, 503);
      assert.deepEqual(res.json(), { ok: false, status: "shutting-down", version: TEST_BUILD_SHA });
      assert.equal(res.headers.connection, "close");
    } finally {
      await draining.close();
    }
  });
});

describe("unexpected handler errors (M2)", () => {
  it("become a generic 500 and the server keeps serving", async () => {
    const failing = await startApp({
      contactHandler: async () => {
        throw new Error("boom: internal detail");
      },
    });
    const originalError = console.error;
    console.error = () => {};
    try {
      const res = await postEnquiry(failing.port, { name: "x" }, freshIp());
      assert.equal(res.status, 500);
      assert.deepEqual(res.json(), { ok: false, message: "Something went wrong. Please try again." });
      assert.ok(!res.text.includes("boom"));
      assert.equal((await request(failing.port, { path: "/api/health" })).status, 200, "still alive");
    } finally {
      console.error = originalError;
      await failing.close();
    }
  });
});

describe("canonical host redirect (H1)", () => {
  let canonical: RunningApp;
  before(async () => {
    canonical = await startApp({ canonicalHost: "www.nexyronix.com" });
  });
  after(async () => {
    await canonical.close();
  });

  const get = (host: string, path = "/", method = "GET") => request(canonical.port, { method, path, headers: { host } });

  it("serves the canonical host directly — no redirect, so no loop with the apex forwarder", async () => {
    assert.equal((await get("www.nexyronix.com")).status, 200);
    assert.equal((await get("WWW.NEXYRONIX.COM:443")).status, 200, "case and port are normalised");
    assert.equal((await get("www.nexyronix.com.")).status, 200, "trailing dot is normalised");
  });

  it("301s every other host to www, keeping the path and query", async () => {
    for (const host of ["nexyronix.com", "nexyronix-web-app-hagfbbbab7bbhaf3.centralindia-01.azurewebsites.net", "evil.example"]) {
      const res = await get(host, "/privacy-policy?x=1");
      assert.equal(res.status, 301, host);
      assert.equal(res.headers.location, "https://www.nexyronix.com/privacy-policy?x=1", host);
    }
  });

  it("uses 308 for non-GET methods so a POST keeps its method and body", async () => {
    const res = await get("nexyronix.com", "/api/contact", "POST");
    assert.equal(res.status, 308);
    assert.equal(res.headers.location, "https://www.nexyronix.com/api/contact");
  });

  it("never redirects the health check", async () => {
    const res = await get("10.0.0.5:8080", "/api/health");
    assert.equal(res.status, 200);
  });
});
