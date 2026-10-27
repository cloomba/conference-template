import { fontSubsetsFor } from '@cloomba/core'
import cyrillicExtUrl from '@fontsource-variable/source-serif-4/files/source-serif-4-cyrillic-ext-wght-normal.woff2?url'
import cyrillicUrl from '@fontsource-variable/source-serif-4/files/source-serif-4-cyrillic-wght-normal.woff2?url'
import greekUrl from '@fontsource-variable/source-serif-4/files/source-serif-4-greek-wght-normal.woff2?url'
import latinExtUrl from '@fontsource-variable/source-serif-4/files/source-serif-4-latin-ext-wght-normal.woff2?url'
import latinUrl from '@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2?url'
import vietnameseUrl from '@fontsource-variable/source-serif-4/files/source-serif-4-vietnamese-wght-normal.woff2?url'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { CloombaPromo } from '@/components/layout/CloombaPromo'
import { DemoBanner } from '@/components/layout/DemoBanner'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { useSite, useT, type Site } from '@/lib/site'
import { getSite } from '@/server/functions'
import appCss from '@/styles/global.css?url'

// Self-hosted display face — Source Serif 4, as on cloomba.com — inlined in
// <head> with `font-display: optional`: the font is either ready AT first paint
// (always, once cached) or the fallback holds for the whole page view — a
// mid-view swap (the "titles jump on navigation" flash) is impossible by
// contract. One variable file per script; a browser fetches a file only for
// characters a page shows. Ranges mirror @fontsource-variable/source-serif-4's
// wght.css.
const DISPLAY_FONT: Record<string, { url: string; range: string }> = {
    latin: {
        url: latinUrl,
        range: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
    },
    'latin-ext': {
        url: latinExtUrl,
        range: 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF',
    },
    cyrillic: { url: cyrillicUrl, range: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116' },
    'cyrillic-ext': {
        url: cyrillicExtUrl,
        range: 'U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F',
    },
    greek: { url: greekUrl, range: 'U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF' },
    vietnamese: {
        url: vietnameseUrl,
        range: 'U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB',
    },
}

const FONT_CSS = Object.values(DISPLAY_FONT)
    .map(
        ({ url, range }) => `@font-face {
  font-family: 'Source Serif 4';
  font-style: normal;
  font-weight: 200 900;
  font-display: optional;
  src: url(${url}) format('woff2-variations');
  unicode-range: ${range};
}`
    )
    .join('\n')

// Preload the files the site's language needs at first paint — and only when
// the configured display stack uses this face at all.
const fontPreloads = (site: Site) =>
    site.config.theme.fonts.display.includes('Source Serif 4')
        ? fontSubsetsFor(site.locale).map((subset) => ({
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              href: DISPLAY_FONT[subset].url,
              crossOrigin: 'anonymous' as const,
          }))
        : []

// Apply the visitor's stored theme choice before first paint (auto mode only).
// The server can't know it, so <html> carries no data-theme in the HTML and
// this sets one — `suppressHydrationWarning` on <html> covers the attribute.
const themeInit = (mode: string) =>
    mode === 'auto'
        ? `try{var s=localStorage.getItem('theme');if(s==='dark'||s==='light')document.documentElement.dataset.theme=s}catch(e){}`
        : ''

export const Route = createRootRoute({
    loader: () => getSite(),
    head: ({ loaderData }) => ({
        meta: [
            { charSet: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            // The fallback title; every page's own head() replaces it.
            ...(loaderData ? [{ title: loaderData.config.site.name }] : []),
        ],
        links: [
            { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
            ...(loaderData ? fontPreloads(loaderData) : []),
            { rel: 'stylesheet', href: appCss },
        ],
    }),
    shellComponent: Shell,
    component: Layout,
})

function Shell({ children }: { children: ReactNode }) {
    const site = Route.useLoaderData()
    const { analytics, theme } = site.config
    return (
        <html lang={site.config.site.language} suppressHydrationWarning>
            <head>
                <HeadContent />
                <style dangerouslySetInnerHTML={{ __html: FONT_CSS }} />
                {site.googleFontsHref && (
                    <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
                )}
                {site.googleFontsHref && <link rel='stylesheet' href={site.googleFontsHref} />}
                {/* The whole theme: runtime tokens from the validated config. */}
                <style dangerouslySetInnerHTML={{ __html: site.themeCss }} />
                {theme.mode === 'auto' && <script dangerouslySetInnerHTML={{ __html: themeInit(theme.mode) }} />}
                {analytics.umami && (
                    <script defer src={analytics.umami.src} data-website-id={analytics.umami.website_id} />
                )}
            </head>
            <body className='min-h-dvh bg-surface text-text font-body'>
                {/* Arbitrary analytics snippets (GA, pixels, …) — verbatim. React
                    owns <head>, so they open <body> instead; scripts in the
                    page's first HTML run either way. */}
                {analytics.head_html && <div hidden dangerouslySetInnerHTML={{ __html: analytics.head_html }} />}
                {children}
                <Scripts />
            </body>
        </html>
    )
}

function Layout() {
    const { config } = useSite()
    const { t } = useT()
    return (
        <>
            <a href='#main' className='skip-link'>
                {t('a11y.skip_to_content')}
            </a>
            {config.site.demo_banner && <DemoBanner text={config.site.demo_banner} />}
            <SiteHeader />
            <main id='main'>
                <Outlet />
            </main>
            {config.cloomba_promo && <CloombaPromo />}
            <SiteFooter />
        </>
    )
}
