import { createFileRoute } from '@tanstack/react-router'

import { sitemapXml } from '@/server/files'

export const Route = createFileRoute('/sitemap.xml')({
    server: {
        handlers: {
            GET: async () =>
                new Response(await sitemapXml(), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }),
        },
    },
})
