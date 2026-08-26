# Cloomba Conference Template

An open-source conference website template powered by the
[Cloomba](https://cloomba.com) public API. It builds a complete, fast static
site for your conference — agenda, speakers, sponsors, tickets, custom pages —
while Cloomba runs registration, paid ticketing, and check-in behind it. Your
site never touches payments or personal data.

**Live demo:** [demo.cloomba.com](https://demo.cloomba.com) — a fictional
animal conference exercising every feature: paid and hidden ticket tiers,
coupons, a multi-stage agenda with a CSS-only filter, light/dark theming, and
Event structured data.

## Quick start

```bash
yarn install
cp apps/astro-theme/.env.example apps/astro-theme/.env
# put your free read-only API key (cloomba.com/me/developers) in .env
yarn build        # → apps/astro-theme/dist — deploy anywhere static
```

Point the template at your own event by editing
`apps/astro-theme/site.config.ts` — one typed, fully annotated file: event
slug, colors, fonts, section order, navigation. Validation runs at build; a
bad value fails with a readable message.

## Documentation

The demo hosts the full documentation, generated from this repository:

- [Features](https://demo.cloomba.com/cloomba-for-conferences/features)
- [Configuration](https://demo.cloomba.com/cloomba-for-conferences/configuration)
- [Customization](https://demo.cloomba.com/cloomba-for-conferences/customization)
- [Deployment](https://demo.cloomba.com/cloomba-for-conferences/deployment)

## Repository layout

```
packages/client   @cloomba/client — typed API client, generated from the live OpenAPI spec
packages/core     @cloomba/core   — site-config schema + pure domain logic (agenda, formatting, iCal)
packages/react    @cloomba/react  — thin React bindings for the live islands
apps/astro-theme  the site template: Astro (static) + React islands + Tailwind
```

`AGENTS.md` carries the working rules for contributors and AI coding agents.

## How it fits together

- **Build time:** the template pulls your event from `api.cloomba.com/public/v1`
  with a read-only key and renders static pages.
- **Runtime:** two small live elements (agenda now/next, ticket availability)
  poll anonymous endpoints; registration runs inside Cloomba's embedded
  widget under the attendee's own account.
- **Content:** editorial pages, FAQ, and news are markdown files in
  `apps/astro-theme/src/content/`; everything event-shaped is edited on
  Cloomba and picked up on the next build.
- **Language and wording:** every UI label the template renders lives in
  `apps/astro-theme/strings.en.json` — 81 of them. Override the ones you want
  in `apps/astro-theme/strings.ts` — it ships empty and is already wired in, so
  translating never means touching `site.config.ts`. Your entries merge over
  the English, and anything you skip stays English.

## License

[MIT](./LICENSE)
