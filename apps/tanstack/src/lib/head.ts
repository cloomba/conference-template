// Per-page <head>: title, description, canonical, Open Graph, Twitter — the
// same tags on every page, built from the root route's site data. Every route
// calls this from its head():
//
//     head: ({ matches, loaderData }) => pageHead(siteOf(matches), { title: …, path: '/agenda' })

import { translate } from '@cloomba/core'

import type { Site } from './site'
import type { StringKey } from './string-keys'

export interface PageMeta {
    // The page's own title; omit on the home page (the site name alone).
    title?: string
    description?: string | null
    // The page's own share image (the event cover on the home page).
    ogImage?: string | null
    // The page's path — canonical/og:url are built from it.
    path: string
}

// The root match's loader data, from inside any route's head().
export const siteOf = (matches: readonly { loaderData?: unknown }[]): Site | undefined =>
    matches[0]?.loaderData as Site | undefined

// t() for a head(), where hooks can't run: the same labels useT() gives
// components, read from the root match's data.
export const headT =
    (site: Site | undefined) =>
    (key: StringKey, params?: Record<string, string | number>): string =>
        site ? translate(site.strings, key, params) : ''

// Pages are served as /<path>/index.html, so the canonical form ends in a
// slash — the URL a static host settles on (Cloudflare 308s /agenda → /agenda/).
export const withTrailingSlash = (path: string): string => (path.endsWith('/') ? path : `${path}/`)

export const pageHead = (site: Site | undefined, page: PageMeta) => {
    if (!site) return {}
    const { config } = site
    const title = page.title
        ? translate(site.strings, 'meta.page_title', { title: page.title, site: config.site.name })
        : config.site.name
    const description = page.description === undefined ? config.site.description : page.description
    const canonical = config.site.url ? new URL(withTrailingSlash(page.path), config.site.url).toString() : undefined

    // Social preview: the page's own image wins, else the site default.
    // Crawlers require ABSOLUTE URLs — a relative path resolves against the
    // site URL, and without one we omit the tag rather than emit a broken one.
    const ogImage = (() => {
        const source = page.ogImage ?? config.site.og_image
        if (!source) return undefined
        try {
            return new URL(source, config.site.url).toString()
        } catch {
            return source.startsWith('http') ? source : undefined
        }
    })()

    return {
        meta: [
            { title },
            ...(description ? [{ name: 'description', content: description }] : []),
            ...(config.site.noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
            { property: 'og:title', content: title },
            ...(description ? [{ property: 'og:description', content: description }] : []),
            ...(canonical ? [{ property: 'og:url', content: canonical }] : []),
            ...(ogImage ? [{ property: 'og:image', content: ogImage }] : []),
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: ogImage ? 'summary_large_image' : 'summary' },
            { name: 'twitter:title', content: title },
            ...(description ? [{ name: 'twitter:description', content: description }] : []),
            ...(ogImage ? [{ name: 'twitter:image', content: ogImage }] : []),
        ],
        links: canonical ? [{ rel: 'canonical', href: canonical }] : [],
    }
}
