# AGENTS.md

Instructions for AI coding agents (and a fine orientation for humans) working in
this repository.

_Verified against the code 2026-10-02 (specs/190). Counts below are scale, not
inventory — a wrong one means this file has aged, so re-check rather than reason
from it._ (`CLAUDE.md` in this directory is a one-line `@AGENTS.md` import — this
file is the real one; edit here.)

## What this is

An open-source conference website template on top of the Cloomba public API.
Yarn v1 workspaces monorepo: three publishable packages + two apps that render
the SAME site — same design, same config shape, same routes.

```
packages/client   @cloomba/client — typed fetch client for /public/v1.
                  Types are GENERATED from the live OpenAPI spec
                  (`yarn generate` inside the package) — never hand-edit
                  src/schema.d.ts.
packages/core     @cloomba/core — site-config + content front-matter schemas
                  (zod) and pure domain logic: now/next agenda computation,
                  agenda grouping, formatting, iCal. Framework-free. Built one
                  file per module with `"sideEffects": false`, so a browser
                  import of the agenda/format helpers carries no zod.
packages/react    @cloomba/react — React bindings ONLY. Hooks are thin
                  adapters over @cloomba/core; no logic lives here.
apps/astro-theme  the template in Astro (static output) + React islands
                  + Tailwind. Hosts the /cloomba-for-conferences docs pages.
apps/tanstack     the template in React on TanStack Start + Tailwind — SSR on a
                  Node server (default) or prerendered static files.
```

Each app owns its `site.config.ts`, `strings.en.json` + `strings.ts`,
`global.css` tokens and `src/content/` — a fork deletes the app it doesn't use.
A change to the design or to a page lands in BOTH apps.

## Commands

```bash
yarn install                # root — installs all workspaces
yarn dev:astro              # packages, then astro dev → :4321
yarn build:astro            # packages, then apps/astro-theme/dist
yarn dev:tanstack           # packages, then vite dev → :4322
yarn build:tanstack         # packages, then the Node server build (.output/)
yarn start:tanstack         # node apps/tanstack/.output/server/index.mjs
yarn build:tanstack:static  # packages, then prerendered apps/tanstack/.output/public
yarn build                  # every workspace
yarn typecheck              # tsc --noEmit / astro check in every workspace
yarn lint                   # eslint over packages/
```

`engines.node` is `>=22`; `packageManager` pins yarn 1.22.22.

## Hard rules

- **No framework imports in `packages/client` or `packages/core`** — enforced
  by eslint (`no-restricted-imports`). React belongs in `packages/react` and
  the apps; Astro only in its app.
- **No logic in hooks.** If a `packages/react` hook grows past a few lines,
  the logic moves to `packages/core`.
- **The template never performs writes.** Registration runs inside the
  embedded Cloomba widget under the attendee's own auth. The API key is
  read-only; it lives in `.env` (gitignored) and must never be referenced from
  island/client-side code.
- **`DEMO_API_KEY` is committed on purpose** (`apps/astro-theme/src/lib/env.ts`,
  `apps/tanstack/src/server/env.ts`) — it is what makes a fresh clone run with
  no setup. It is publishable only because its scope (`read_public`) cannot
  reach the attendee endpoints. Never widen it, and never commit any other key.
- **Cloomba's own surfaces are opt-in.** `cloomba_promo`, `cloomba_docs` and
  `footer.show_app_links` all default to FALSE, and the legal hrefs have no
  default at all; each app's `site.config.ts` turns them on because that file
  configures the demo. A fork is somebody's real conference — anything that
  advertises Cloomba, or points at Cloomba's policies, must be a choice they
  made. No analytics id is ever committed (the demo reads `UMAMI_WEBSITE_ID`
  from its build environment).
- **Semantic tokens only in components** — `bg-surface`, `text-text`,
  `text-primary`, never raw colors and never `dark:` variants; light/dark is
  handled entirely by token values.
- **Motion is CSS only.** Keyframes live in each app's `global.css` (`@theme
  inline`); components apply them with Tailwind utilities, identical in both
  apps — no animation library, no script. Every transform and animation sits
  behind `motion-safe:` (with a `motion-reduce:` fallback where layout depends
  on it), and nothing starts hidden where an animation doesn't run. Lift and
  shadow only on links — a card that lifts reads as clickable; shadows are
  token-tinted (`shadow-primary/…`). Anything that moves on its own for more
  than five seconds needs a pause control (WCAG 2.2.2) — see the sponsors
  marquee.
- **One page width.** Every page container is `mx-auto max-w-5xl px-4` (the
  nav bar's width — left edges always align). Long-form TEXT may be capped at
  `max-w-3xl` for reading measure, but always left-aligned INSIDE the one
  container — never as a second centered layout. Every page title renders
  through `PageHeader` (top-level and detail pages alike). ONE sanctioned
  exception: the agenda's days area widens to `max-w-7xl` for events with 4+
  rooms (a data grid needs the room; the PageHeader above it stays at 5xl).
- **Images are not draggable** — every `<img>` in both apps
  (`draggable='false'` in Astro, `draggable={false}` in React).
- **Whitespace collapse (Astro):** Astro drops the space when a text line ends
  and an inline element/expression starts the next line ("open-sourceCloomba",
  "·deployment"). End such lines with `{' '}` — and after editing prose,
  eyeball the rendered text or strip tags and scan for glued words.
- Package manager is **yarn v1** — never npm.

## apps/tanstack rules

- **Server vs browser.** `src/server/` is server-only: the key (`env.ts`), the
  site config (`config.ts`), API reads (`data.ts`), markdown (`content.ts`,
  `markdown.ts`), and the mappers that build page data (`views.ts`). Routes
  reach it ONLY through the server functions in `src/server/functions.ts` —
  route loaders also run in the browser, so a loader never calls
  `@cloomba/client` itself. `src/lib/` and `src/components/` must stay
  browser-safe.
- **One switch.** How the site is served is Vite's `--mode` (`static` or not),
  read through `src/lib/output-mode.ts` by `vite.config.ts` (prerender on/off)
  and by `functions.ts` (static middleware on/off). Never add a second flag.
- **Format on the server.** Dates, times, prices and day grouping are
  formatted in `src/server/views.ts`; pages receive finished strings. Browser
  Intl data differs from Node's (Chrome 148 puts plain spaces around the dash
  in "November 3 – 4", Node's ICU 78 thin ones), so a string formatted in a
  component fails hydration. The live parts (`NowNext`, ticket availability)
  format only after their first poll, in the browser.
- **Page data is picked, not passed through.** Server functions return the
  shapes in `src/lib/views.ts`, never raw API objects. An on-request tier's
  price leaves the server only as its label.
- **Every page is listed.** `src/lib/page-paths.ts` is the one list behind
  `/sitemap.xml` and the static build's prerender list (`vite.config.ts`). A
  new kind of page adds itself there, or a static build leaves it out.
- **The static `404.html` is plain HTML.** The `conference:plain-404` plugin in
  `vite.config.ts` strips TanStack's scripts from it, because a host serves it
  at unknown URLs where `/404`'s markup can't hydrate. Nothing on the 404 page
  may depend on JS.
- **Static output sits at a domain root.** Static server functions fetch
  `/__tsr/staticServerFnCache/*.json` by absolute path.

## API ground rules

- Base URL and key come from env (`CLOOMBA_API_URL`, `CLOOMBA_API_KEY`);
  `@cloomba/client` takes them as options — no globals.
- Key-authed data flows through `@cloomba/client` (`/public/v1`) — at build
  time in Astro, in server functions in TanStack. The live parts call the small
  set of anonymous CORS-open `/v1` endpoints instead — no key in the browser,
  ever.
- API errors carry a stable snake_case `code` — branch on `code`, never on
  `message`.
