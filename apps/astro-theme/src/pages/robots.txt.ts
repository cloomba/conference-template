// robots.txt, config-aware: allows everything (unless site.noindex) and
// points crawlers at the sitemap when the absolute site URL is known.

import type { APIRoute } from 'astro'

import { config } from '@/lib/config'

export const GET: APIRoute = () => {
    const lines = ['User-agent: *', config.site.noindex ? 'Disallow: /' : 'Allow: /']
    if (config.site.url && !config.site.noindex) {
        lines.push(`Sitemap: ${new URL('/sitemap-index.xml', config.site.url).toString()}`)
    }
    return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
