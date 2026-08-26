// Social-platform detection: a URL's hostname picks its brand icon
// (simple-icons paths, inlined at build time — nothing ships to the client
// but the <path>). Unknown domains fall back to a globe outline.

import { siBluesky, siFacebook, siGithub, siInstagram, siMastodon, siTelegram, siX, siYoutube } from 'simple-icons'

import { t } from './strings'

export interface SocialIconDef {
    title: string
    // SVG path in a 0 0 24 24 viewBox.
    path: string
}

const BRANDS: [RegExp, { title: string; path: string }][] = [
    [/(^|\.)github\.com$/, siGithub],
    [
        /(^|\.)linkedin\.com$/,
        {
            title: 'LinkedIn',
            path: 'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z',
        },
    ],
    [/(^|\.)(x|twitter)\.com$/, siX],
    [/(^|\.)facebook\.com$/, siFacebook],
    [/(^|\.)instagram\.com$/, siInstagram],
    [/(^|\.)(youtube\.com|youtu\.be)$/, siYoutube],
    [/(^|\.)(mastodon\.[a-z]+|fosstodon\.org|hachyderm\.io|mstdn\.[a-z]+)$/, siMastodon],
    [/(^|\.)(bsky\.app|bsky\.social)$/, siBluesky],
    [/(^|\.)(t\.me|telegram\.org)$/, siTelegram],
]

// Globe outline for plain websites (drawn for a 24px box, stroke-style path
// converted to fill-rule-friendly strokes via the component). The brand titles
// above stay as they are — those are proper nouns, not UI copy.
export const GLOBE: SocialIconDef = {
    title: t('a11y.website'),
    path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.93 9h-3.47a15.6 15.6 0 0 0-1.21-5.5A8.02 8.02 0 0 1 19.93 11ZM12 4.06c.87 1.03 1.94 3.03 2.3 6.94H9.7c.36-3.91 1.43-5.91 2.3-6.94ZM8.75 5.5A15.6 15.6 0 0 0 7.54 11H4.07a8.02 8.02 0 0 1 4.68-5.5ZM4.07 13h3.47c.14 2.11.56 3.99 1.21 5.5A8.02 8.02 0 0 1 4.07 13ZM12 19.94c-.87-1.03-1.94-3.03-2.3-6.94h4.6c-.36 3.91-1.43 5.91-2.3 6.94Zm3.25-1.44c.65-1.51 1.07-3.39 1.21-5.5h3.47a8.02 8.02 0 0 1-4.68 5.5Z',
}

export const socialIconFor = (href: string): SocialIconDef => {
    try {
        const hostname = new URL(href).hostname.toLowerCase()
        const match = BRANDS.find(([pattern]) => pattern.test(hostname))
        if (match) return { title: match[1].title, path: match[1].path }
    } catch {
        // Malformed URL — globe.
    }
    return GLOBE
}
