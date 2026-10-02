import frauncesLatinExtUrl from '@fontsource-variable/fraunces/files/fraunces-latin-ext-wght-normal.woff2?url'
import frauncesLatinUrl from '@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2?url'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { CloombaPromo } from '@/components/layout/CloombaPromo'
import { DemoBanner } from '@/components/layout/DemoBanner'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { useSite, useT } from '@/lib/site'
import { getSite } from '@/server/functions'
import appCss from '@/styles/global.css?url'

// Self-hosted display font, inlined in <head> with a preload and
// `font-display: optional`: the font is either ready AT first paint (always,
// once cached) or the fallback holds for the whole page view — a mid-view
// swap (the "titles jump on navigation" flash) is impossible by contract.
// Ranges/sources mirror @fontsource-variable/fraunces.
const FONT_CSS = `
@font-face {
  font-family: 'Fraunces Variable';
  font-style: normal;
  font-weight: 100 900;
  font-display: optional;
  src: url(${frauncesLatinUrl}) format('woff2-variations');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face {
  font-family: 'Fraunces Variable';
  font-style: normal;
  font-weight: 100 900;
  font-display: optional;
  src: url(${frauncesLatinExtUrl}) format('woff2-variations');
  unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;
}`

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
            { rel: 'preload', as: 'font', type: 'font/woff2', href: frauncesLatinUrl, crossOrigin: 'anonymous' },
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
