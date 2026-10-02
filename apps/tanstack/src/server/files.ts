// The site's non-page files — /agenda.ics, /robots.txt, /sitemap.xml.
// SERVER-ONLY. Served by the file routes in src/routes; a static build
// prerenders each into a file of the same name.

import { buildAgendaIcs } from '@cloomba/core'

import { withTrailingSlash } from '@/lib/head'
import { pagePaths } from '@/lib/page-paths'

import { config } from './config'
import { getNews, getOrdered } from './content'
import { loadSessions, loadSpeakers } from './data'

// The full agenda as iCal — linked from the agenda page and the footer.
export const agendaIcs = async (): Promise<string> =>
    buildAgendaIcs({
        title: config.site.name,
        uidDomain: config.site.url ? new URL(config.site.url).hostname : config.event.slug,
        sessions: await loadSessions(),
        generatedAt: new Date(),
        url: config.site.url,
    })

// Allows everything (unless site.noindex) and points crawlers at the sitemap
// when the absolute site URL is known.
export const robotsTxt = (): string => {
    const lines = ['User-agent: *', config.site.noindex ? 'Disallow: /' : 'Allow: /']
    if (config.site.url && !config.site.noindex) {
        lines.push(`Sitemap: ${new URL('/sitemap.xml', config.site.url).toString()}`)
    }
    return lines.join('\n') + '\n'
}

const escapeXml = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Every page the site serves (src/lib/page-paths.ts), as absolute canonical
// URLs — trailing slash, like <link rel='canonical'>. Without `site.url`
// there is nothing absolute to list, so the sitemap is empty — robots.txt
// doesn't point at it then.
export const sitemapXml = async (): Promise<string> => {
    const base = config.site.url
    const [sessions, speakers] = await Promise.all([loadSessions(), loadSpeakers()])
    const paths = pagePaths({
        pages: getOrdered('pages').map((page) => page.id),
        news: getNews().map((post) => post.id),
        sessions,
        speakers,
    })
    const urls = base ? paths.map((path) => new URL(withTrailingSlash(path), base).toString()).sort() : []
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>\n`).join('') +
        '</urlset>\n'
    )
}
