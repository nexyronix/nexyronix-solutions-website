// Bundles server/index.ts (with server/app.ts, api/ and src/shared/) into
// dist-server/index.js — the only server file production runs.
//
// It also bakes in the commit the build came from. /api/health reports it, so
// the deployment workflow can confirm the NEW build is serving rather than the
// instance it replaced. Source of the id, first match wins:
//   BUILD_SHA               explicit override
//   GITHUB_SHA              GitHub Actions
//   git rev-parse HEAD      local builds ("-dirty" if tracked files changed)
//   "unknown"
import { build } from "esbuild";
import { execFileSync } from "node:child_process";

function gitSha() {
  const git = (...args) =>
    execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  try {
    const sha = git("rev-parse", "HEAD");
    return git("status", "--porcelain", "--untracked-files=no") ? `${sha}-dirty` : sha;
  } catch {
    return "";
  }
}

const buildSha =
  process.env.BUILD_SHA ||
  process.env.GITHUB_SHA ||
  gitSha() ||
  "unknown";

if (!/^[A-Za-z0-9._-]{1,80}$/.test(buildSha)) {
  throw new Error(`Refusing to embed an unexpected build id: ${JSON.stringify(buildSha)}`);
}

await build({
  entryPoints: ["server/index.ts"],
  bundle: true,
  platform: "node",
  target: "node24",
  format: "esm",
  // express and compression stay in node_modules; everything else is inlined.
  packages: "external",
  sourcemap: true,
  outfile: "dist-server/index.js",
  define: { "process.env.BUILD_SHA": JSON.stringify(buildSha) },
  logLevel: "info",
});

console.log(`  build id: ${buildSha}`);
