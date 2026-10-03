// The site-config contract (site.config.yaml → this schema). This is the
// SINGLE source of truth for what a conference site can customize: the
// self-hosted template validates a YAML file against it, and Cloomba Cloud's
// settings UI writes the same shape to its store. Keep it small — every field
// here is public API for every deployed site.

import { z } from 'zod'

import { contrastRatio, hexToOklch, normalizeHex, oklchToHex } from './color'

// --- Theme tokens -----------------------------------------------------------

// The full token set. Values are CSS color strings (hex, oklch, …) — the
// template never restricts the color space. Unset tokens derive from a hex
// primary (see resolveTokens); the defaults below are the fallback and the
// lightness each neutral keeps.
const tokenNames = ['primary', 'primary_content', 'accent', 'surface', 'surface_alt', 'text', 'text_muted'] as const
export type TokenName = (typeof tokenNames)[number]
export type TokenSet = Record<TokenName, string>

const partialTokens = z
    .object({
        primary: z.string().min(1).optional(),
        primary_content: z.string().min(1).optional(),
        accent: z.string().min(1).optional(),
        surface: z.string().min(1).optional(),
        surface_alt: z.string().min(1).optional(),
        text: z.string().min(1).optional(),
        text_muted: z.string().min(1).optional(),
    })
    .prefault({})

export const LIGHT_DEFAULTS: TokenSet = {
    primary: '#2f5fe0',
    primary_content: '#ffffff',
    accent: '#2f5fe0',
    surface: '#ffffff',
    surface_alt: '#f5f6f8',
    text: '#17191c',
    text_muted: '#5b626b',
}

export const DARK_DEFAULTS: TokenSet = {
    primary: '#7c9ef5',
    primary_content: '#0c1526',
    accent: '#7c9ef5',
    surface: '#101215',
    surface_alt: '#1a1d21',
    text: '#e8eaed',
    text_muted: '#9aa2ac',
}

const SYSTEM_FONT_STACK = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

// --- Schema -----------------------------------------------------------------

export const SECTION_NAMES = [
    'hero',
    // Quick numbers computed from the event: speakers / sessions / sponsors /
    // days (+ registered guests once there are some).
    'stats',
    // Teaser split ([image][text]) linking to the full /about page.
    'about',
    // Three-up cards from src/content/features/.
    'features',
    'agenda',
    'speakers',
    // Alternating [image][text] / [text][image] splits from
    // src/content/highlights/.
    'highlights',
    'sponsors',
    // The organizing team — featured entries with kind 'host'.
    'team',
    'tickets',
    'venue',
    'faq',
    'news',
    // Closing call-to-action band.
    'cta',
] as const
export type SectionName = (typeof SECTION_NAMES)[number]

const linkSchema = z.object({ label: z.string().min(1), href: z.string().min(1) })

export const siteConfigSchema = z.object({
    site: z.object({
        // Conference name — the site title.
        name: z.string().min(1),
        // Optional logo shown in the header before the name — a path under
        // the app's public/ dir (e.g. "/logo.svg") or an absolute URL.
        logo: z.string().min(1).optional(),
        // Canonical absolute URL of the deployed site (og:url, sitemap, iCal URL).
        url: z.string().min(1).optional(),
        description: z.string().optional(),
        // BCP 47 tag for <html lang> and Intl formatting.
        language: z.string().default('en'),
        // Social-share preview image (og:image / twitter:image) for pages
        // without one of their own. Raster only (crawlers reject SVG); made
        // absolute against `url` at build. Ships as a rasterized hero scene.
        og_image: z.string().min(1).default('/og-default.jpg'),
        // Wide hero image (16:9) shown at full width under the title — a path
        // under public/ or an absolute URL. Without one the hero shows the
        // event's cover from Cloomba as a square beside the title.
        hero_image: z.string().min(1).optional(),
        // Keep the whole site out of search indexes (demo deploys).
        noindex: z.boolean().default(false),
        // When set, a banner with this text renders on every page (demo sites).
        demo_banner: z.string().optional(),
    }),
    event: z.object({
        // The Cloomba event slug this site renders. One event per site — a
        // satellite event is a second config/deployment.
        slug: z.string().min(1),
    }),
    api: z
        .object({
            // Key-authed base for the build (the key itself comes from env).
            base_url: z.string().min(1).default('https://api.cloomba.com/public/v1'),
            // Anonymous base the browser islands poll (CORS-open reads).
            browser_base_url: z.string().min(1).default('https://api.cloomba.com/v1'),
            // Embed origin for the registration iframe.
            embed_origin: z.string().min(1).default('https://cloomba.com'),
        })
        .prefault({}),
    theme: z
        .object({
            // auto = follow prefers-color-scheme, visitor can toggle; a pinned
            // mode renders one palette only.
            mode: z.enum(['auto', 'light', 'dark']).default('auto'),
            fonts: z
                .object({
                    display: z.string().min(1).default(SYSTEM_FONT_STACK),
                    body: z.string().min(1).default(SYSTEM_FONT_STACK),
                    // Google Fonts family names to load (e.g. ["Fraunces"]) —
                    // referenced from the stacks above.
                    google: z.array(z.string().min(1)).default([]),
                })
                .prefault({}),
            radius: z.string().min(1).default('0.75rem'),
            light: partialTokens,
            dark: partialTokens,
        })
        .prefault({}),
    // Section presence AND order on the home page.
    sections: z
        .array(z.enum(SECTION_NAMES))
        .default(['hero', 'about', 'agenda', 'speakers', 'sponsors', 'tickets', 'venue', 'faq']),
    // Header navigation. When absent, the theme derives links from the
    // enabled sections (plus custom pages with `nav: header`).
    header: z.object({ links: z.array(linkSchema) }).optional(),
    // Footer: 2–3 link columns. When `columns` is absent the theme derives
    // them (Explore / Attend / More); setting it replaces them wholesale.
    footer: z
        .object({
            columns: z.array(z.object({ title: z.string().min(1), links: z.array(linkSchema) })).optional(),
            // Cloomba app links (attendees carry their tickets there). OFF by
            // default: a fork is someone else's conference, and their footer
            // shouldn't advertise our apps unless they ask for it.
            show_app_links: z.boolean().default(false),
            // YOUR policies. Undefined = the links don't render. There is
            // deliberately no default: pointing a conference's footer at
            // Cloomba's privacy policy would misstate who controls the site.
            privacy_href: z.string().min(1).optional(),
            terms_href: z.string().min(1).optional(),
            text: z.string().optional(),
        })
        .prefault({}),
    // UI label overrides, merged over the theme's own English table:
    // `{ ...en, ...strings }` — how a site gets translated. The theme owns the
    // key list (apps/astro-theme/strings.en.json) and gives authors
    // autocomplete over it; the schema only has to accept the shape.
    //
    // Deliberately permissive: z.record(…, z.string()) would make one numeric
    // value in a hand-written JSON file throw out of parseSiteConfig and kill
    // the build. resolveStrings drops bad entries with a warning instead,
    // because a mislabeled site beats a dead one.
    strings: z.record(z.string(), z.unknown()).prefault({}),
    contact_email: z.string().optional(),
    // Call-for-papers / call-for-sponsors banners (speakers + sponsors pages)
    // stop rendering this many days before the event starts — a CFP the week
    // of the conference helps nobody. Evaluated at build time.
    calls_close_days_before: z.number().int().min(0).default(7),
    // Social profile URLs (the event's / organizing org's). Icons are
    // auto-detected from the domain; rendered as an icon row in the footer.
    socials: z.array(z.string().min(1)).default([]),
    // The "built with the Cloomba conference template" band above the footer.
    // OFF by default — a fork is a real conference's website, not an ad for the
    // thing it was built with. Flip to true to show it; the demo does.
    cloomba_promo: z.boolean().default(false),
    // The `/cloomba-for-conferences/*` documentation pages. OFF by default —
    // they document the TEMPLATE, so they belong on the demo, not inside
    // somebody's conference site. See src/pages/cloomba-for-conferences/.
    cloomba_docs: z.boolean().default(false),
    analytics: z
        .object({
            umami: z.object({ src: z.string().min(1), website_id: z.string().min(1) }).optional(),
            // Escape hatch for any other analytics (GA, Meta pixel, …): raw
            // HTML injected verbatim — into <head> in astro-theme, at the start
            // of <body> in tanstack (React owns <head>). It's your site — but note
            // that cookie-based trackers make YOU responsible for a consent
            // banner; the template ships none (umami needs none).
            head_html: z.string().optional(),
        })
        .prefault({}),
})

export type SiteConfig = z.infer<typeof siteConfigSchema>
// The authoring shape — defaults still optional. What site.config.ts exports.
// `strings` stays loose here because the KEYS belong to the theme, not to
// core: the theme's strings.ts pins them with `satisfies StringOverrides`,
// which is where the autocomplete and the typo errors actually happen.
export type SiteConfigInput = z.input<typeof siteConfigSchema>

// Identity helper for site.config.ts — exists purely so forkers get editor
// autocomplete and inline type errors. Validation still happens at build via
// `parseSiteConfig` (defense in depth: the TS types don't run at runtime).
export const defineConfig = (config: SiteConfigInput): SiteConfigInput => config

// Parse + validate raw config (e.g. YAML-loaded). Throws a readable error
// listing every problem; the template fails the build on it.
export const parseSiteConfig = (raw: unknown): SiteConfig => {
    const result = siteConfigSchema.safeParse(raw)
    if (!result.success) {
        const problems = result.error.issues
            .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
            .join('\n')
        throw new Error(`Invalid site config:\n${problems}`)
    }
    return result.data
}

// --- Theme CSS --------------------------------------------------------------

type Mode = 'light' | 'dark'
type NeutralRole = 'surface' | 'surface_alt' | 'text' | 'text_muted'

// How much of the primary's hue each neutral carries (OKLCH chroma). Capped at
// a fifth of the primary's own chroma, so a near-gray brand gets near-gray
// neutrals. Lightness comes from the shipped defaults above, so contrast stays
// where those put it.
const NEUTRAL_CHROMA: Record<Mode, Record<NeutralRole, number>> = {
    light: { surface: 0, surface_alt: 0.012, text: 0.015, text_muted: 0.02 },
    dark: { surface: 0.01, surface_alt: 0.012, text: 0.015, text_muted: 0.02 },
}
const NEUTRAL_ROLES = Object.keys(NEUTRAL_CHROMA.light) as NeutralRole[]

// The tokens an organizer didn't set, derived from the primary they did: the
// neutrals take its hue (green brand → green-gray, not the defaults' blue-gray),
// text on a primary button is white or a dark tint of that hue — whichever
// reads better — and accent follows primary. A primary that isn't hex derives
// nothing; the shipped defaults apply.
const deriveFromPrimary = (primary: string, mode: Mode): Partial<TokenSet> => {
    const hex = normalizeHex(primary)
    if (!hex) return {}
    const brand = hexToOklch(hex)
    const defaults = mode === 'light' ? LIGHT_DEFAULTS : DARK_DEFAULTS
    const derived: Partial<TokenSet> = { accent: primary }
    for (const role of NEUTRAL_ROLES) {
        const chroma = Math.min(NEUTRAL_CHROMA[mode][role], brand.c * 0.2)
        derived[role] = oklchToHex({ l: hexToOklch(defaults[role]).l, c: chroma, h: brand.h })
    }
    const darkTint = oklchToHex({ l: 0.22, c: Math.min(0.05, brand.c), h: brand.h })
    derived.primary_content = contrastRatio('#ffffff', hex) >= contrastRatio(darkTint, hex) ? '#ffffff' : darkTint
    return derived
}

const resolveMode = (set: Partial<TokenSet>, mode: Mode): TokenSet => {
    const own = stripUndefined(set)
    const defaults = mode === 'light' ? LIGHT_DEFAULTS : DARK_DEFAULTS
    return { ...defaults, ...deriveFromPrimary(own.primary ?? defaults.primary, mode), ...own }
}

// Tokens the organizer set always win; the rest derive from the primary.
export const resolveTokens = (theme: SiteConfig['theme']): { light: TokenSet; dark: TokenSet } => ({
    light: resolveMode(theme.light, 'light'),
    dark: resolveMode(theme.dark, 'dark'),
})

const stripUndefined = (set: Partial<TokenSet>): Partial<TokenSet> =>
    Object.fromEntries(Object.entries(set).filter(([, v]) => v !== undefined)) as Partial<TokenSet>

// Runtime custom properties are `--t-*` — deliberately NOT `--color-*`, which
// is Tailwind v4's @theme namespace. The app's global.css maps them:
//   @theme inline { --color-primary: var(--t-primary); … }
// so utilities read the runtime var and mode switching swaps only values.
// Each palette also declares its `color-scheme`: native scrollbars and controls
// follow it, and an embedded iframe (the registration widget) reads it as its
// own prefers-color-scheme — so the visitor's toggle reaches inside the frame.
const tokenBlock = (tokens: TokenSet, mode: Mode): string =>
    [...tokenNames.map((name) => `--t-${name.replace(/_/g, '-')}: ${tokens[name]};`), `color-scheme: ${mode};`].join(
        ' '
    )

// The stylesheet that carries the whole theme. Components use only the
// custom properties (via Tailwind @theme), so mode switching is purely a
// matter of which values apply:
//   auto  → light on :root, dark under prefers-color-scheme (unless the
//           visitor pinned light) and under an explicit data-theme="dark".
//   light/dark → that palette only, no toggling.
export const themeCss = (theme: SiteConfig['theme']): string => {
    const { light, dark } = resolveTokens(theme)
    const base = `--t-font-display: ${theme.fonts.display}; --t-font-body: ${theme.fonts.body}; --t-radius: ${theme.radius};`

    if (theme.mode === 'light') return `:root { ${base} ${tokenBlock(light, 'light')} }`
    if (theme.mode === 'dark') return `:root { ${base} ${tokenBlock(dark, 'dark')} }`
    return [
        `:root { ${base} ${tokenBlock(light, 'light')} }`,
        `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${tokenBlock(dark, 'dark')} } }`,
        `:root[data-theme="dark"] { ${tokenBlock(dark, 'dark')} }`,
    ].join('\n')
}

// --- Registration embed -----------------------------------------------------

// The registration iframe's URL, carrying the site's look so the widget matches
// it: each mode's resolved primary as `accent` / `accent_dark`, and `theme`
// when the site pins a mode. Auto mode sends no `theme` — the widget follows
// the page's `color-scheme` (themeCss), the visitor's toggle included. The
// embed accepts 6-digit hex only, so a primary in any other notation isn't sent.
export const registrationEmbedUrl = (config: SiteConfig, origin: string): string => {
    const { light, dark } = resolveTokens(config.theme)
    const params = new URLSearchParams()
    const accent = normalizeHex(light.primary)
    const accentDark = normalizeHex(dark.primary)
    if (accent) params.set('accent', accent)
    if (accentDark) params.set('accent_dark', accentDark)
    if (config.theme.mode !== 'auto') params.set('theme', config.theme.mode)
    const query = params.toString()
    return `${origin}/embed/e/${encodeURIComponent(config.event.slug)}${query ? `?${query}` : ''}`
}
