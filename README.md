# Nexyronix Solutions — Website

Production-ready marketing site for Nexyronix Solutions Private Limited.
React + TypeScript + Tailwind CSS + React Three Fiber, with an Express server
that hosts both the static build and the enquiry API.

## Quick start

Requires **Node.js 24** (see `.nvmrc`).

```bash
npm install
cp .env.example .env      # fill in RESEND_API_KEY / CONTACT_EMAIL / SMTP_FROM
npm run dev               # frontend only (no /api)
```

Production:

```bash
npm run build             # typecheck, vite build -> dist/, bundle server -> dist-server/
npm start                 # node dist-server/index.js on $PORT, serves dist/ + /api
```

`npm run dev:server` runs the unbundled server through `tsx` (after a
`vite build`), which is handy when changing `server/` or `api/`.

## Deployment

The production server is one Node process: Express serves the static build and
the enquiry API on the same origin. `npm run build` bundles `server/index.ts`
together with `api/` and `src/shared/` into `dist-server/index.js`, so a host
needs only these at runtime:

```
dist/                 static frontend (Vite)
dist-server/          bundled server (+ source map)
package.json, package-lock.json
node_modules/         production deps only: express, compression (npm ci --omit=dev)
```

The server reads `PORT`, binds `0.0.0.0`, answers `GET /api/health` with 200,
and shuts down gracefully on `SIGTERM` (in-flight requests finish, 15 s cap).

### Azure App Service (Linux) — prepared, not yet live

`.github/workflows/azure-app-service.yml` builds and smoke-tests the deployment
package on every push and pull request. It **deploys only once the
`AZURE_WEBAPP_NAME` repository variable exists**, authenticating with OIDC — no
publish profile or client secret is stored.

One-time setup:

1. **Web app**: Linux, runtime `NODE|24-lts`. Settings: HTTPS Only on, minimum
   TLS 1.2, Always On, ARR affinity **off**, FTP/FTPS and SCM basic-auth
   publishing **off**, Health check path `/api/health`.
2. **App Settings**: `CONTACT_EMAIL`, `SMTP_FROM`, `RESEND_API_KEY` (as a Key
   Vault reference via the app's managed identity), `NODE_ENV=production`,
   `SCM_DO_BUILD_DURING_DEPLOYMENT=false`. Set `CANONICAL_HOST=nexyronix.com`
   only **after** the custom domain is bound. Don't set `PORT`.
3. **Startup command**: `node --enable-source-maps dist-server/index.js` (the
   workflow sets it on each deploy). Run node directly rather than `npm start`
   so SIGTERM reaches the server.
4. **OIDC**: an Entra app registration or user-assigned managed identity with
   a federated credential for
   `repo:nexyronix/nexyronix-solutions-website:environment:production`,
   granted *Website Contributor* on the web app only. Then add repository
   secrets `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, a
   `production` environment, and finally the `AZURE_WEBAPP_NAME` variable
   (optionally `AZURE_WEBAPP_SLOT`).

The workflow also runs on the `azure-migration` branch so Azure can be
validated before anything reaches `main`. Remove that branch from the trigger
after cutover.

### Railway — current production until cutover

`railway.json`: build `npm run build`, start `npm start`, healthcheck
`/api/health`. `railway.json` and `vercel.json` are scheduled for removal after
a successful Azure migration.

**Before merging to `main`:** Railway redeploys from `main`. Check that its
builder honours `"engines": { "node": "24.x" }` (or set its Node version
explicitly), and that Railway's proxy appends exactly one `X-Forwarded-For`
hop (otherwise set `TRUST_PROXY_HOPS`), or merge only at cutover.

**Vercel (legacy):** `api/contact.ts` still works as a serverless function and
`vercel.json` carries the enforced security headers, but the Express server is
the maintained path.

## Environment variables

| Variable | When | Required | Purpose |
|---|---|---|---|
| `CONTACT_EMAIL` | runtime | yes | Where enquiries are delivered |
| `RESEND_API_KEY` | runtime | yes | **Secret.** [Resend](https://resend.com) API key, used over HTTPS (not SMTP), so outbound SMTP-port restrictions don't matter |
| `SMTP_FROM` | runtime | yes | From address on a domain verified in Resend. Name kept from the earlier SMTP-based version |
| `CANONICAL_HOST` | runtime | no | e.g. `nexyronix.com`; all other hostnames 301/308-redirect to it (`/api/health` exempt). Leave unset until the domain points at this deployment |
| `TRUST_PROXY_HOPS` | runtime | no | Proxies appending to `X-Forwarded-For` (default `1`; `2` with Front Door in front of App Service). Determines the client IP used for rate limiting |
| `NODE_ENV` | runtime | recommended | `production` on the host. Not where the build runs — it would skip devDependencies |
| `PORT` | runtime | no | Injected by the platform |
| `VITE_CONTACT_EMAIL` / `_PHONE` / `_LOCATION` | build | no | Override the public contact details defaulted in `src/data/site.ts` |
| `VITE_SITE_URL` | build | no | Declared but **currently unused** — canonical/OG/sitemap URLs are hard-coded |
| `DATABASE_URL` | — | no | **Not implemented**; `storeEnquiry()` is a no-op. Leave unset |

Only `VITE_`-prefixed values reach the browser, and they are fixed at build
time — set them where `npm run build` runs, not on the host. `RESEND_API_KEY`
deliberately has no prefix, so Vite cannot bundle it.

## Build & type checking

```bash
npm run typecheck   # app + server + vite config, three separate tsconfigs
npm run build       # typecheck, then vite build, then esbuild bundles the server
```

`build` deliberately type-checks first — Vite/esbuild strip types without
checking them, so without this step type errors would ship silently.

Three tsconfigs, deliberately separate because they target different runtimes:

| File | Covers | Runtime |
|---|---|---|
| `tsconfig.json` | `src/` | Browser (DOM libs, JSX) |
| `tsconfig.server.json` | `api/`, `server/`, `src/shared/` | Node (`@types/node`) |
| `tsconfig.node.json` | `vite.config.ts` | Node (build tooling) |

`src/shared/enquiry.ts` is intentionally in both the app and server projects —
it is isomorphic and must compile under both.

## Operational checklist

1. **Set `RESEND_API_KEY`, `CONTACT_EMAIL` and `SMTP_FROM`, and keep the
   sending domain verified in Resend.** Without them the form validates and
   then fails with a friendly error; the server also logs which are missing at
   startup (names only, never values).
2. **Domain changes**: the canonical/Open Graph URLs in `index.html`,
   `public/sitemap.xml`, `public/robots.txt` and the legal pages are
   hard-coded to `https://nexyronix.com`.
3. **DNS moves**: keep Resend's DKIM/SPF records and the mailbox MX records
   intact when repointing the site.
4. **Scaling out**: the rate limiter is in-memory, so each instance counts
   separately. Fine for one instance; use a shared store for several (see
   `api/contact.ts`).

## What's in this phase

- **Phases 1–10**: foundation, 3D hero, What We Create, Technology Universe, How We Work,
  Industries, Internship Experience, Technology Stack, Projects, About.
- **Phase 11** (this phase): Contact & Start a Project — see `src/components/Contact/`.
  - `Contact.tsx` — intro, three enquiry paths, split form layout, closing statement
  - `ContactOptions.tsx` — Start a Project / Internship / General Enquiry; selecting one
    preselects the matching enquiry type in the form
  - `ContactForm.tsx` — all fields, client validation, honeypot, submitting/success/error states
  - `FormField.tsx` — reusable accessible field (real `<label>`, `aria-invalid`, `aria-describedby`)
  - `FormStatus.tsx` — success and error displays with live-region announcements
  - `ContactInfo.tsx` — env-driven contact details (see note below)
  - `ContactVisual.tsx` — IDEA → NEXYRONIX → PRODUCT signal
  - `src/shared/enquiry.ts` — validation shared by client **and** server
  - `api/contact.ts` — the submission endpoint

## Backend notes

**Validation lives in one place.** `src/shared/enquiry.ts` is imported by both the form and the
API route, so the two can't drift. The server re-runs every check regardless of what the client
sent — client-side validation is purely for fast feedback and is never trusted.

**Security measures in `api/contact.ts`:**
- Server-side revalidation of every field; unknown fields are dropped via an explicit whitelist
- HTML-escaping of all values before they enter the notification email (XSS)
- Email-header sanitization (CRLF stripping) to prevent header injection
- Per-IP rate limiting (5 submissions / 10 minutes), keyed on the address the trusted proxy
  appended to `X-Forwarded-For` — never the client-written leftmost entry — with ports stripped,
  IPv4-mapped IPv6 unwrapped, and IPv6 bucketed per /64
- Request body cap of 8 MB (sized for a base64-encoded 5 MB resume); oversized bodies get a 413
- Resume uploads: PDF/DOC/DOCX only, ≤ 5 MB, verified by file signature, renamed server-side,
  attached to the email and never stored
- Honeypot field; bots that fill it get a 200 with no delivery, so they learn nothing
- Generic client-facing errors — transport and credential failures are logged server-side only

**Server behaviour** (`server/index.ts`): security headers on every response (CSP, HSTS,
X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) plus a stricter
`Content-Security-Policy-Report-Only` candidate that drops `'unsafe-inline'`/`'unsafe-eval'` from
`script-src` — it only logs browser console warnings and blocks nothing. Hashed files in
`dist/assets/` are cached for a year, other static files for an hour, HTML always revalidates.
Unknown pages get the branded 404 with a real 404 status; unknown `/api/*` routes get JSON 404s;
`/api/contact` answers non-POST methods with 405.

**Rate limiting is in-memory**, which suits a single instance and fails safe on cold start. For
multi-instance deployments, swap the `Map` in `api/contact.ts` for Redis or your platform's KV
store; the interface is deliberately tiny.

**Optional storage — not implemented.** `storeEnquiry()` is a documented no-op hook: it returns
early when `DATABASE_URL` is unset and does nothing when it is set. There is no database driver
and no database is needed. It's left unwired on purpose — guessing at a database you may not use
would be worse than an explicit hook. The intended table shape is documented in the function's
comment; if it's ever wired up, update the Privacy Policy, which states that submissions and
resumes are not stored by the website.

**Adapting to another host.** The handler uses a minimal request/response shape, so moving it to
Netlify Functions, Lambda, or an Express route (`app.post('/api/contact', ...)`) is a signature
change, not a rewrite.

## Note on contact details

`src/data/site.ts` ships Nexyronix's real, provided contact details (email, phone, Bengaluru office
address) as defaults. `VITE_CONTACT_EMAIL`, `VITE_CONTACT_PHONE` and `VITE_CONTACT_LOCATION` can
override them per build. Nothing else — office hours, social profiles — is invented;
`SOCIAL_LINKS` stays empty until real accounts exist.

Note the `VITE_` prefix: those three are *public* by design and shipped to the browser. The
`RESEND_API_KEY` deliberately has no prefix, so Vite will never bundle it.

## Note on the internship path

The Internship option preselects the "Internship" enquiry type in the shared form rather than
opening a separate application flow. Internship and Career Opportunity enquiries can attach an
optional resume (see Backend notes); there is still no dedicated internship route — the
`#internships` section anchor remains the entry point.

## Note on factual accuracy in Phase 10 — read before editing

`src/data/company.ts` contains **only** information that has actually been stated about
Nexyronix: the registered company name, its focus on software and digital solutions, and its
internship programme. The company info block shows exactly those three facts.

There are **no** invented founder biographies, employee details, awards, certifications,
partnerships, client relationships, testimonials, achievements, founding dates, headcounts,
project counts, revenue figures, student numbers, years of experience, or success percentages
anywhere in this phase — and no superlative claims ("leading", "number one", "guaranteed").

The file carries a comment saying so. If you add to it, keep to the same standard.

## Note on truthfulness in Phase 9 — read before editing

Every project in `src/data/projects.ts` is `status: "concept"`. The section states this plainly
in three places: a written disclosure above the projects, a "Concept / Placeholder" badge on
every card, and the status field itself.

There are **no** invented clients, logos, testimonials, awards, partnerships, revenue figures,
user numbers, performance percentages, or completion counts anywhere in this phase.

When replacing a concept with real work:
1. Change `status` to `"live"` or `"case-study"` — the badge updates automatically.
2. Fill in the `caseStudy` object (`challenge`, `approach`, `solution`, `technology`).
3. **Only** add `outcome` when you have verified, real results. `CaseStudyPreview` renders the
   outcome block solely when that field is populated — there is intentionally no placeholder
   state for it, because an empty outcome is far better than a fabricated metric.
4. Remove or reword the disclosure notice in `Projects.tsx` once concepts are gone.

## Note on technology icons

`TechIconGlyph` renders **original abstract marks, not the official vendor logos.** Brand logos
(React, AWS, Docker, PostgreSQL and so on) are trademarks whose usage terms vary by owner, and
reproducing them can imply an affiliation that doesn't exist — which the Phase 8 brief explicitly
rules out. The glyphs here are suggestive geometric shapes in the existing Nexyronix icon
language. If you later want the real logos, review each vendor's trademark/brand guidelines and
swap the glyph bodies in that one file.

## Note on claims in Phase 8

Technologies are presented only as technologies Nexyronix works with or plans to work with.
There are no claims of official partnerships, certifications, authorized-provider status, or
established expertise levels.

## Note on 3D budget

Phases 2 and 4 own the Three.js budget (the Hero and the Technology Universe). Phases 5–8
are deliberately SVG + CSS — each of their briefs warns against adding another heavy 3D scene,
and several more R3F canvases on one page would be exactly that problem. The visual language
(core, nodes, luminous connections, traveling pulses) carries across; the implementation doesn't.

## Note on Phase 2–4's 3D vs. Phase 5

Phase 5 intentionally has **no Three.js** — the brief for this phase explicitly asks for
lightweight CSS/SVG and warns against expensive 3D scenes, so `ProcessVisual` is pure inline
SVG with CSS transitions, reusing the same `animate-pulse-slow` / `animate-spin` / easing
tokens as everywhere else rather than introducing a new visual language.

## Note on the Phase 3 → 4 transition

The brief asked for service cards to visually dissolve into particles that migrate into the
3D universe. A literal DOM-to-WebGL particle handoff synced to scroll position is exactly the
kind of thing the brief's own "subtle and performance-conscious" instruction warns against
doing heavy-handedly — and it's not something I could verify works reliably without a real
browser to test in. Instead, Phase 4 opens with a soft gradient "seam" that echoes the Solutions
section's background before dissolving to black, so the two sections read as continuous rather
than a hard cut. Worth revisiting with real motion-design tooling later if you want the literal effect.

## Run it

```bash
npm install
npm run dev
```

## Design system — where things live

| What | Where |
|---|---|
| Colors, radii, shadows/glows, fonts | `src/index.css` (`:root` custom properties) |
| Tailwind tokens (`bg-*`, `text-*`, `shadow-glow-*`, `rounded-*`) | `tailwind.config.ts` |
| Buttons | `src/components/ui/Button.tsx` (`primary` / `secondary` / `ghost`) |
| Page width & gutters | `src/components/ui/Container.tsx` (`content` = 1280px, `page` = 1440px) |
| Wordmark | `src/components/ui/Logo.tsx` |
| Eyebrow / status pill | `src/components/ui/Badge.tsx` |

**To retheme the entire site**, edit the CSS variables at the top of `src/index.css`.
Everything downstream (Tailwind utilities, components) inherits from there.

### Palette

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#05070A` | Primary background |
| `--color-bg-secondary` | `#090C12` | Alternate section background |
| `--color-surface` | `#0D1119` | Cards / panels |
| `--color-border` | `#1B2230` | Hairline borders |
| `--color-text` | `#EDF1F6` | Primary text |
| `--color-text-muted` | `#93A0B4` | Secondary text |
| `--color-accent-primary` | `#2E7CF6` | Electric blue — primary CTA/interactive |
| `--color-accent-cyan` | `#45E0E8` | Cyan — glows, technical highlights |
| `--color-accent-violet` | `#7C6FE8` | Violet — rare, secondary emphasis only |

### Type

- **Display** (headings): Space Grotesk — geometric, technical, confident
- **Body**: Inter — clean, highly readable at small sizes
- **Mono** (eyebrows, labels, meta): JetBrains Mono — reinforces the technical personality

## Performance & accessibility

- **Hero (Phase 2)** and **Technology Universe (Phase 4)** both use `useDeviceTier` to scale
  particle/node/geometry complexity across low/medium/high, and both lazy-load their three.js/R3F
  bundle via `React.lazy` — never fetched for reduced-motion or no-WebGL visitors.
- **Solutions (Phase 3)**: no images, no extra 3D scenes — all eight card visuals are small
  inline SVG.
- **Technology Universe (Phase 4) accessibility**: the node list on the left is real, always-
  rendered DOM — a `role="group"` of buttons with an `aria-live` description panel. It's the
  authoritative source of node info and works identically with the mouse, the keyboard, or the
  static SVG fallback; the 3D scene's hover/click is an enhancement on top of it, not the only way in.
- **Process (Phase 5) accessibility**: the mobile vertical journey shows all six stages fully
  expanded at all times — comprehension never depends on hover, scroll position, or the
  reveal animation. The desktop timeline's active node is distinguished by size and fill,
  not color alone, and every node is a real `<button>` (keyboard-operable, `aria-pressed`).
- **Industries (Phase 6) accessibility**: `IndustryPanel` is a real, always-rendered `role="tabpanel"`
  with `aria-live` — the selected industry's description, solutions, and connected technologies
  are readable text regardless of whether anyone ever interacts with the SVG matrix. The selector
  is a real `role="tablist"`/`role="tab"` set, keyboard-operable, with `aria-selected`. The
  active state everywhere (selector, matrix nodes) is shown via size/fill/border changes, not
  color alone.
- **Internship (Phase 7) accessibility**: domain cards are real `<button>`s with `aria-expanded`
  / `aria-controls`, so the detail panel is reachable by keyboard and announced properly — no
  hover-only interaction anywhere. The group switch is a `role="tablist"`. Card open state is
  shown via border, background and a rotated chevron, not color alone.
- **Technology (Phase 8) accessibility**: filter tabs are a real `role="tablist"`; every card is a
  `<button>` with an `aria-label` carrying name, category and description, and `aria-pressed` for
  selection. Selected/dimmed states use border, background and opacity together, never color alone.
  The detail panel is `aria-live`.
- **Projects (Phase 9) accessibility**: filters are a real `role="tablist"`; each project is a
  semantic `<a>` whose `aria-label` includes title, category, concept status and description, so
  the placeholder nature is announced, not just shown. Filtered-out cards dim rather than
  unmount. All project information is readable with animation disabled.
- **About (Phase 10) accessibility**: proper heading hierarchy throughout (`h2` for the section,
  `h3` for sub-sections, `h4` for cards). The four pillars are mirrored by a keyboard-operable
  `<button>` list carrying the same content, so the SVG is never the only way to read them. The
  company facts use a semantic `<dl>`.
- **Contact (Phase 11) accessibility**: every field has a real `<label>` bound by id —
  placeholders are supplementary, never the only label. Errors are wired via `aria-invalid` and
  `aria-describedby`, the submission error is `role="alert"`, and the success panel is
  `role="status"` with `aria-live="polite"`. Full keyboard operation with visible focus rings.
- All motion respects `prefers-reduced-motion` via the global rule in `src/index.css`.

## Animation dependencies

There is no animation library: `framer-motion` was removed in Phase 12 because it was never
imported. Every animation is CSS-level (Tailwind keyframes and transitions) or driven by
`useFrame` inside the 3D scenes.
