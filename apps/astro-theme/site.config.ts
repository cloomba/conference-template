// Your site, in one file — the COMPLETE option reference. Every property the
// template understands is listed here; the ones this demo doesn't use are
// commented out with their defaults, so configuring is uncommenting. A typo
// fails the build with a readable message, and your editor autocompletes
// everything through defineConfig.

import { defineConfig } from '@cloomba/core'

export default defineConfig({
    site: {
        // Conference name — site title, header brand, © line.
        name: 'Fauna Forum',
        // Optional logo shown before the name in header/footer — a path under
        // public/ or an absolute URL.
        logo: '/logo.svg',
        // Absolute URL of the deployed site — canonical/OG tags and the iCal
        // link. Omit for previews (relative-only).
        url: 'https://demo.cloomba.com',
        // Meta description + footer blurb.
        description: 'The gathering of every species — two days of talks, workshops, and the Evening Howl.',
        // BCP 47 tag for <html lang> and date/number formatting.
        language: 'en',
        // Social-share preview (og:image) for pages without their own — the
        // event cover wins on the home page. Raster only (no SVG); ships as a
        // rasterized hero scene:
        // og_image: '/og-default.jpg',
        // Keep the site out of search indexes (staging/preview deploys only).
        // noindex: true,
        // When set, a banner with this text renders on every page.
        // demo_banner: 'Preview — content not final.',
    },
    event: {
        // The Cloomba event this site renders. One event per site — a
        // satellite event is a second config/deployment.
        slug: 'fauna-forum',
    },
    // Service endpoints — the committed values should be PRODUCTION; use .env
    // (CLOOMBA_API_URL / CLOOMBA_BROWSER_API_URL / CLOOMBA_EMBED_ORIGIN) to
    // override locally. Shown here with their defaults:
    // api: {
    //     base_url: 'https://api.cloomba.com/public/v1',      // build-time reads (key from .env)
    //     browser_base_url: 'https://api.cloomba.com/v1',     // anonymous reads the live bits poll
    //     embed_origin: 'https://cloomba.com',                // the registration iframe
    // },
    theme: {
        // auto = follow the visitor's system, with a header toggle that
        // persists. 'light' / 'dark' pin one palette, no toggle.
        mode: 'auto',
        fonts: {
            // The display font ships self-hosted (see src/styles/global.css).
            display: "'Fraunces Variable', Georgia, serif",
            // Body defaults to the system stack:
            // body: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            // Google Fonts families to load instead of self-hosting
            // (adds a fonts.googleapis.com request):
            // google: ['Fraunces'],
        },
        // Corner radius for cards, buttons, images.
        // radius: '0.75rem',
        // Color tokens per mode — set any subset, the rest keep defaults.
        // Full set: primary, primary_content, accent, surface, surface_alt,
        // text, text_muted.
        light: {
            primary: '#1f7a4d',
            // primary_content: '#ffffff',
            // accent: '#1f7a4d',
            // surface: '#ffffff',
            // surface_alt: '#f5f6f8',
            // text: '#17191c',
            // text_muted: '#5b626b',
        },
        dark: {
            primary: '#5fd39a',
            // primary_content: '#0c1526',
            // accent: '#5fd39a',
            // surface: '#101215',
            // surface_alt: '#1a1d21',
            // text: '#e8eaed',
            // text_muted: '#9aa2ac',
        },
    },
    // Home-page sections: order here = order on the page; remove a line to
    // drop the section. All available names are listed.
    sections: [
        'hero', //       cover/fallback image, title, dates, CTAs
        'stats', //      speakers/sessions/sponsors/days, computed from the event
        'about', //      teaser split (first description paragraph) → /about
        'features', //   3-up cards from src/content/features/
        'agenda', //     first-day preview → /agenda
        'speakers', //   grid → /speakers
        'highlights', // alternating image/text splits from src/content/highlights/
        'sponsors', //   tier-grouped logos → /sponsors
        'team', //       featured entries with kind 'host'
        'tickets', //    tier cards with live availability → /tickets
        'venue', //      location + directions
        'faq', //        accordion from src/content/faq/
        'news', //       latest posts from src/content/news/
        'cta', //        closing register/sponsor band
    ],
    // Header links — omit to derive them from the enabled sections (plus
    // custom pages with `nav: header` frontmatter):
    // header: {
    //     links: [{ label: 'Agenda', href: '/agenda' }],
    // },
    footer: {
        // Link columns — omit `columns` to derive Explore / Attend / More
        // automatically (sections + custom pages + apps + legal):
        // columns: [{ title: 'Explore', links: [{ label: 'Agenda', href: '/agenda' }] }],
        // Cloomba iOS/Android links in the More column (attendee tickets live
        // in the apps):
        // show_app_links: true,
        // Legal links — default to Cloomba's own:
        // privacy_href: 'https://cloomba.com/legal/privacy',
        // terms_href: 'https://cloomba.com/legal/terms',
        // Extra line under the © notice:
        text: 'Fauna Forum is a fictional conference — the live demo of the Cloomba conference template.',
    },
    // Shown in the footer and used for mailto CTAs.
    contact_email: 'team@fauna-forum.example',
    // Social profile URLs — icons auto-detected from the domain, rendered in
    // the footer.
    socials: ['https://github.com/cloomba/conference-template', 'https://cloomba.com'],
    // Analytics — self-hosted Umami; omit for none. `head_html` injects any
    // other tracker verbatim (GA, Meta pixel, …) — cookie-based trackers make
    // you responsible for a consent banner; the template ships none.
    analytics: {
        umami: { src: 'https://umami.cloomba.com/script.js', website_id: 'e302d401-376c-492d-bd50-96263c67c9a5' },
        // head_html: `<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>`,
    },
    // The "built with Cloomba" band above the footer. Set false to hide —
    // nothing to delete.
    cloomba_promo: true,
})
