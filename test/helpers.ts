/**
 * Shared test helpers. Plain node:http is used for requests (not fetch) so
 * tests can set the Host header and so the Resend stub, which replaces
 * globalThis.fetch, never intercepts the tests' own traffic.
 */
import http from "node:http";
import zlib from "node:zlib";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { createApp, type AppOptions } from "../server/app";

export interface TestResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  text: string;
  json: () => any;
}

export function request(
  port: number,
  options: { method?: string; path?: string; headers?: Record<string, string>; body?: string | Buffer } = {}
): Promise<TestResponse> {
  const { method = "GET", path: urlPath = "/", headers = {}, body } = options;
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: "127.0.0.1", port, method, path: urlPath, headers, agent: false },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          let raw = Buffer.concat(chunks);
          const encoding = res.headers["content-encoding"];
          if (encoding === "br") raw = zlib.brotliDecompressSync(raw);
          else if (encoding === "gzip") raw = zlib.gunzipSync(raw);
          const text = raw.toString("utf8");
          resolve({ status: res.statusCode ?? 0, headers: res.headers, text, json: () => JSON.parse(text) });
        });
      }
    );
    req.on("error", reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}

/** POSTs JSON to /api/contact as a given client address (via X-Forwarded-For; one trusted hop). */
export function postEnquiry(port: number, payload: unknown, clientIp: string, extraHeaders: Record<string, string> = {}) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  return request(port, {
    method: "POST",
    path: "/api/contact",
    headers: {
      "content-type": "application/json",
      "content-length": String(Buffer.byteLength(body)),
      "x-forwarded-for": clientIp,
      ...extraHeaders,
    },
    body,
  });
}

let ipCounter = 0;
/** A fresh documentation-range address per call, so rate-limit state never leaks between tests. */
export function freshIp(): string {
  ipCounter += 1;
  return `198.51.${Math.floor(ipCounter / 250)}.${(ipCounter % 250) + 1}`;
}

/** A minimal stand-in for dist/: every file the server routes to, plus one hashed asset. */
export function makeFixtureDist(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "nexyronix-dist-"));
  mkdirSync(path.join(dir, "assets"));
  const page = (title: string) => `<!doctype html><html><head><title>${title}</title></head><body>${title}</body></html>`;
  writeFileSync(path.join(dir, "index.html"), page("Home"));
  writeFileSync(path.join(dir, "404.html"), page("Not Found"));
  writeFileSync(path.join(dir, "privacy-policy.html"), page("Privacy Policy"));
  writeFileSync(path.join(dir, "terms-of-use.html"), page("Terms of Use"));
  writeFileSync(path.join(dir, "favicon.svg"), "<svg xmlns='http://www.w3.org/2000/svg'/>");
  writeFileSync(path.join(dir, "robots.txt"), "User-agent: *\n");
  writeFileSync(path.join(dir, "assets", "index-AbC123.js"), "console.log('asset');".repeat(200));
  return dir;
}

export const TEST_BUILD_SHA = "0123456789abcdef0123456789abcdef01234567";

export interface RunningApp {
  port: number;
  close: () => Promise<void>;
}

export async function startApp(overrides: Partial<AppOptions> = {}): Promise<RunningApp> {
  const app = createApp({
    distPath: overrides.distPath ?? makeFixtureDist(),
    trustProxyHops: 1,
    canonicalHost: "",
    buildSha: TEST_BUILD_SHA,
    isShuttingDown: () => false,
    ...overrides,
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const { port } = server.address() as AddressInfo;
  return {
    port,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}

// --- Resend stub --------------------------------------------------------------

export interface ResendCall {
  url: string;
  headers: Record<string, string>;
  body: any;
}

/**
 * Replaces globalThis.fetch for api.resend.com only. `respond` decides each
 * reply; the default is Resend's 200. Call restore() when done.
 */
export function stubResend(respond: (call: ResendCall) => Response = () => Response.json({ id: "test" })) {
  const realFetch = globalThis.fetch;
  const calls: ResendCall[] = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!url.startsWith("https://api.resend.com/")) return realFetch(input, init);
    const call: ResendCall = {
      url,
      headers: Object.fromEntries(new Headers(init?.headers).entries()),
      body: JSON.parse(String(init?.body)),
    };
    calls.push(call);
    return respond(call);
  }) as typeof fetch;
  return { calls, restore: () => (globalThis.fetch = realFetch) };
}

// --- ZIP builder --------------------------------------------------------------

/**
 * Builds a minimal, structurally valid ZIP (stored, no compression, CRCs left
 * at zero — the server reads only the central directory). Enough to exercise
 * the DOCX checks without binary fixtures in the repository.
 */
export function buildZip(entries: { name: string; data?: string; encrypted?: boolean }[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const data = Buffer.from(entry.data ?? "<x/>", "utf8");
    const flags = entry.encrypted ? 0x1 : 0;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(flags, 6);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    locals.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(flags, 8);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);

    offset += local.length + name.length + data.length;
  }

  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

/** The parts Word itself writes for a simple document. */
export const WORD_DOCUMENT_PARTS = [
  "[Content_Types].xml",
  "_rels/.rels",
  "docProps/app.xml",
  "docProps/core.xml",
  "word/document.xml",
  "word/_rels/document.xml.rels",
  "word/styles.xml",
  "word/settings.xml",
  "word/fontTable.xml",
  "word/theme/theme1.xml",
  "word/media/image1.png",
  "customXml/item1.xml",
];

export const PDF_BYTES = Buffer.from("%PDF-1.7\n1 0 obj << /Type /Catalog >> endobj\ntrailer << >>\n%%EOF\n");
export const DOC_BYTES = Buffer.concat([
  Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
  Buffer.alloc(504),
]);
