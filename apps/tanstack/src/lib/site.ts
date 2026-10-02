// What every page knows about the site — the root route's loader data, built
// by getSite() on the server — and the hooks components read it through.
// Safe in the browser: it holds the public parts of the config and the
// resolved labels, never the key or the API base it is used with.

import { translate, translatePlural, type SiteConfig, type StringTable } from '@cloomba/core'
import { getRouteApi } from '@tanstack/react-router'
import { useMemo } from 'react'

import type { PluralKey, StringKey } from './string-keys'

export interface NavLink {
    label: string
    href: string
}

export interface FooterColumn {
    title: string
    links: NavLink[]
}

// A link with its brand icon resolved on the server (the SVG path only).
export interface SocialIconLink {
    href: string
    title: string
    path: string
}

// The config minus what the browser has no use for: `api.base_url` is the
// key-authed endpoint, and `strings` arrives already merged (Site.strings).
export type PublicConfig = Omit<SiteConfig, 'api' | 'strings'>

export interface Site {
    config: PublicConfig
    strings: StringTable
    // Validated BCP 47 tag for every Intl call.
    locale: string
    themeCss: string
    googleFontsHref: string | null
    headerLinks: NavLink[]
    footerColumns: FooterColumn[]
    socials: SocialIconLink[]
    githubIconPath: string
    // The © year, fixed where the page was rendered so the browser never
    // disagrees with the server's HTML.
    year: number
    // Anonymous, CORS-open reads the live parts poll.
    browserBaseUrl: string
    // Where the registration iframe loads from.
    embedOrigin: string
}

const root = getRouteApi('__root__')

export const useSite = (): Site => root.useLoaderData()

// Labels in the site's language: t('nav.agenda'), tn('stats.days', 2).
export const useT = () => {
    const { strings, locale } = useSite()
    return useMemo(
        () => ({
            locale,
            strings,
            t: (key: StringKey, params?: Record<string, string | number>) => translate(strings, key, params),
            tn: (key: PluralKey, count: number, params?: Record<string, string | number>) =>
                translatePlural(strings, locale, key, count, params),
        }),
        [strings, locale]
    )
}
