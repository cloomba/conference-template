import { createFileRoute, notFound } from '@tanstack/react-router'

import { PageHeader } from '@/components/PageHeader'
import { Html } from '@/components/ui/Html'
import { pageHead, siteOf } from '@/lib/head'
import { staticMissingAsNull } from '@/lib/static-missing'
import { getPage } from '@/server/functions'

// Custom pages: every markdown file in src/content/pages becomes a root-level
// route (travel.md → /travel). File routes (/agenda, /tickets, …) are matched
// before this dynamic one, so a page can't shadow them.
export const Route = createFileRoute('/$slug')({
    loader: async ({ params }) => {
        const page = await staticMissingAsNull(getPage({ data: params.slug }))
        if (!page) throw notFound()
        return page
    },
    head: ({ matches, loaderData, params }) =>
        pageHead(siteOf(matches), {
            title: loaderData?.title,
            description: loaderData?.description ?? undefined,
            path: `/${params.slug}`,
        }),
    component: CustomPage,
})

function CustomPage() {
    const page = Route.useLoaderData()
    return (
        <>
            <PageHeader title={page.title} />
            <article className='mx-auto max-w-5xl px-4 py-8'>
                <Html html={page.html} className='prose-content max-w-3xl' />
            </article>
        </>
    )
}
