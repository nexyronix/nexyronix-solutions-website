/**
 * Checks on the real production build (dist/ and dist-server/), so a config
 * change can't silently undo these fixes:
 *  - H4/B5: three.js must never be part of the initial page load.
 *  - H1: every absolute URL uses https://www.nexyronix.com.
 *  - M10: the server bundle carries an embedded build id.
 *
 * Needs `npm run build` first. Without a build these tests are skipped
 * locally; in CI (CI=true) a missing build is a failure.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const built = existsSync(path.join(dist, "index.html")) && existsSync(path.join(root, "dist-server", "index.js"));
const skip = built ? false : process.env.CI === "true" ? false : "no build output — run `npm run build` first";

const read = (...parts: string[]) => readFileSync(path.join(...parts), "utf8");
const CANONICAL = "https://www.nexyronix.com";

/** Relative specifiers a minified ES module imports statically (not import()). */
function staticImports(code: string): string[] {
  const found: string[] = [];
  const pattern = /\bimport\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']\.\/([^"']+\.js)["']/g;
  for (const match of code.matchAll(pattern)) found.push(match[1]);
  return found;
}

describe("build output", { skip }, () => {
  it("exists (a missing build fails in CI)", () => {
    assert.ok(built, "dist/ and dist-server/ must exist — run `npm run build`");
  });

  it("keeps three.js off the initial page load", () => {
    const html = read(dist, "index.html");
    const assets = readdirSync(path.join(dist, "assets")).filter((f) => f.endsWith(".js"));
    // Identify three.js by its renderer class rather than by chunk name.
    const threeChunks = assets.filter((f) => read(dist, "assets", f).includes("WebGLRenderer"));
    assert.ok(threeChunks.length > 0, "three.js should still be built, as a lazy chunk");

    const entry = /<script type="module"[^>]*src="\/assets\/([^"]+)"/.exec(html)?.[1];
    assert.ok(entry, "entry script found");
    const preloaded = [...html.matchAll(/<link rel="modulepreload"[^>]*href="\/assets\/([^"]+)"/g)].map((m) => m[1]);

    // Everything the browser fetches up front: the entry, its preloads, and
    // anything they import statically, transitively.
    const initial = new Set<string>();
    const queue = [entry, ...preloaded];
    while (queue.length) {
      const file = queue.pop()!;
      if (initial.has(file)) continue;
      initial.add(file);
      queue.push(...staticImports(read(dist, "assets", file)));
    }

    for (const chunk of threeChunks) {
      assert.ok(!initial.has(chunk), `${chunk} (three.js) must not load with the page; initial set: ${[...initial].join(", ")}`);
    }
    assert.ok(initial.size <= 3, `initial page load stays small: ${[...initial].join(", ")}`);
  });

  it("emits no empty chunks", () => {
    for (const file of readdirSync(path.join(dist, "assets"))) {
      if (file.endsWith(".js")) assert.ok(read(dist, "assets", file).trim().length > 0, `${file} is empty`);
    }
  });

  it("uses https://www.nexyronix.com for every absolute site URL", () => {
    for (const file of ["index.html", "privacy-policy.html", "terms-of-use.html", "404.html", "sitemap.xml", "robots.txt"]) {
      const text = read(dist, file);
      assert.ok(!/https?:\/\/nexyronix\.com/.test(text), `${file} still links to the bare domain`);
      for (const url of text.match(/https?:\/\/[a-z0-9.-]*nexyronix\.com[^\s"'<)]*/gi) ?? []) {
        assert.ok(url.startsWith(CANONICAL), `${file}: ${url}`);
      }
    }
  });

  it("has canonical, Open Graph, Twitter and structured-data URLs on www", () => {
    const html = read(dist, "index.html");
    assert.match(html, /<link rel="canonical" href="https:\/\/www\.nexyronix\.com\/" \/>/);
    assert.match(html, /<meta property="og:url" content="https:\/\/www\.nexyronix\.com\/" \/>/);
    assert.match(html, /<meta property="og:image" content="https:\/\/www\.nexyronix\.com\/og-image\.png" \/>/);
    assert.match(html, /<meta name="twitter:image" content="https:\/\/www\.nexyronix\.com\/og-image\.png" \/>/);
    const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    assert.equal(jsonLd.length, 2);
    for (const block of jsonLd) assert.equal(block.url, `${CANONICAL}/`);
    assert.equal(jsonLd[0].logo, `${CANONICAL}/favicon.svg`);

    assert.match(read(dist, "privacy-policy.html"), /<link rel="canonical" href="https:\/\/www\.nexyronix\.com\/privacy-policy" \/>/);
    assert.match(read(dist, "terms-of-use.html"), /<link rel="canonical" href="https:\/\/www\.nexyronix\.com\/terms-of-use" \/>/);
  });

  it("lists every page in the sitemap on www, each with a lastmod date", () => {
    const sitemap = read(dist, "sitemap.xml");
    const urls = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
    assert.equal(urls.length, 3);
    const locs = urls.map((u) => /<loc>([^<]+)<\/loc>/.exec(u)?.[1]);
    assert.deepEqual(locs, [`${CANONICAL}/`, `${CANONICAL}/privacy-policy`, `${CANONICAL}/terms-of-use`]);
    for (const u of urls) assert.match(u, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
    assert.match(read(dist, "robots.txt"), /^Sitemap: https:\/\/www\.nexyronix\.com\/sitemap\.xml$/m);
  });

  it("embeds a build id in the server bundle", () => {
    const bundle = read(root, "dist-server", "index.js");
    assert.ok(!bundle.includes("process.env.BUILD_SHA"), "BUILD_SHA was replaced at build time");
    if (process.env.GITHUB_SHA) assert.ok(bundle.includes(JSON.stringify(process.env.GITHUB_SHA)), "CI build embeds GITHUB_SHA");
  });
});
