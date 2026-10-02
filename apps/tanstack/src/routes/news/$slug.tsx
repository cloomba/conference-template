import { createFileRoute, notFound } from '@tanstack/react-router'

import { PageHeader } from '@/components/PageHeader'
import { Html } from '@/components/ui/Html'
import { pageHead, siteOf } from '@/lib/head'
import { useT } from '@/lib/site'
import { staticMissingAsNull } from '@/lib/static-missing'
import { getNewsPost } from '@/server/functions'

export const Route = createFileRoute('/news/$slug')({
    loader: async ({ params }) => {
        const post = await staticMissingAsNull(getNewsPost({ data: params.slug }))
        if (!post) throw notFound()
        return post
    },
    head: ({ matches, loaderData, params }) =>
        pageHead(siteOf(matches), {
            title: loaderData?.title,
            description: loaderData?.description ?? undefined,
            path: `/news/${params.slug}`,
        }),
    component: NewsPost,
})

function NewsPost() {
    const post = Route.useLoaderData()
    const { t } = useT()
    return (
        <>
            <PageHeader title={post.title} subtitle={post.dateLabel} back={{ href: '/news', label: t('nav.news') }} />
            <article className='mx-auto max-w-5xl px-4 py-8'>
                <Html html={post.html} className='prose-content max-w-3xl' />
            </article>
        </>
    )
}
