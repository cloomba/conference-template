# AGENTS.md

Instructions for AI coding agents (and a fine orientation for humans) working in
this repository.

## What this is

An open-source conference website template on top of the Cloomba public API.
Yarn v1 workspaces monorepo: three publishable packages + one Astro app.

```
packages/client   @cloomba/client — typed fetch client for /public/v1.
                  Types are GENERATED from the live OpenAPI spec
                  (`yarn generate` inside the package) — never hand-edit
                  src/schema.d.ts.
packages/core     @cloomba/core — site-config schema (zod) + pure domain
                  logic: now/next agenda computation, agenda grouping,
                  formatting, iCal. Framework-free.
packages/react    @cloomba/react — React bindings ONLY. Hooks are thin
                  adapters over @cloomba/core; no logic lives here.
apps/astro-theme  the site template: Astro (static output) + React islands
                  + Tailwind.
```

## Commands

```bash
yarn install        # root — installs all workspaces
yarn build          # builds every workspace (tsup for packages, astro for the app)
yarn typecheck      # tsc --noEmit in every workspace
yarn lint           # eslint over packages/
```

## Hard rules

- **No framework imports in `packages/client` or `packages/core`** — enforced
  by eslint (`no-restricted-imports`). React belongs in `packages/react` and
  the app; Astro only in the app.
- **No logic in hooks.** If a `packages/react` hook grows past a few lines,
  the logic moves to `packages/core`.
- **The template never performs writes.** Registration runs inside the
  embedded Cloomba widget under the attendee's own auth. The API key used at
  build time is read-only; it lives in `.env` (gitignored) and must never be
  referenced from island/client-side code.
- **`DEMO_API_KEY` in `src/lib/env.ts` is committed on purpose** — it is what
  makes a fresh clone run with no setup. It is publishable only because its
  scope (`read_public`) cannot reach the attendee endpoints. Never widen it, and
  never commit any other key.
- **Cloomba's own surfaces are opt-in.** `cloomba_promo`, `cloomba_docs` and
  `footer.show_app_links` all default to FALSE, and the legal hrefs have no
  default at all; `apps/astro-theme/site.config.ts` turns them on because that
  file configures the demo. A fork is somebody's real conference — anything that
  advertises Cloomba, or points at Cloomba's policies, must be a choice they
  made. No analytics id is ever committed (the demo reads `UMAMI_WEBSITE_ID`
  from its build environment).
- **Semantic tokens only in components** — `bg-surface`, `text-text`,
  `text-primary`, never raw colors and never `dark:` variants; light/dark is
  handled entirely by token values.
- **One page width.** Every page container is `mx-auto max-w-5xl px-4` (the
  nav bar's width — left edges always align). Long-form TEXT may be capped at
  `max-w-3xl` for reading measure, but always left-aligned INSIDE the one
  container — never as a second centered layout. Every page title renders
  through `PageHeader` (top-level and detail pages alike). ONE sanctioned
  exception: the agenda's days area widens to `max-w-7xl` for events with 4+
  rooms (a data grid needs the room; the PageHeader above it stays at 5xl).
- **Images are `draggable='false'`** — every `<img>` in the app.
- **Whitespace collapse:** Astro drops the space when a text line ends and an
  inline element/expression starts the next line ("open-sourceCloomba",
  "·deployment"). End such lines with `{' '}` — and after editing prose,
  eyeball the rendered text or strip tags and scan for glued words.
- Package manager is **yarn v1** — never npm.

## API ground rules

- Base URL and key come from env (`CLOOMBA_API_URL`, `CLOOMBA_API_KEY`);
  `@cloomba/client` takes them as options — no globals.
- Build-time data flows through `@cloomba/client` (key-authed `/public/v1`).
  Runtime islands call the small set of anonymous CORS-open `/v1` endpoints
  instead — no key in the browser, ever.
- API errors carry a stable snake_case `code` — branch on `code`, never on
  `message`.
