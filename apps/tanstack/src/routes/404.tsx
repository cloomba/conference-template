import { createFileRoute } from '@tanstack/react-router'

import { NotFound } from '@/components/NotFound'
import { headT, pageHead, siteOf } from '@/lib/head'

// A real route for the not-found page, so the static build can prerender it
// to /404.html — the file static hosts serve for unknown paths. On a server
// deployment unknown paths get the router's notFound (status 404) instead.
export const Route = createFileRoute('/404')({
    head: ({ matches }) => {
        const site = siteOf(matches)
        return pageHead(site, { title: headT(site)('error.not_found_title'), path: '/404' })
    },
    component: NotFound,
})
