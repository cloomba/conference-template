import { createFileRoute } from '@tanstack/react-router'

import { PageHeader } from '@/components/PageHeader'
import { SiteLink } from '@/components/ui/SiteLink'
import { headT, pageHead, siteOf } from '@/lib/head'
import { useT } from '@/lib/site'
import { getNewsList } from '@/server/functions'

export const Route = createFileRoute('/news/')({
    loader: () => getNewsList(),
    head: ({ matches }) => {
        const site = siteOf(matches)
        return pageHead(site, { title: headT(site)('nav.news'), path: '/news' })
    },
    component: NewsList,
})

function NewsList() {
    const posts = Route.useLoaderData()
    const { t } = useT()
    return (
        <>
            <PageHeader title={t('nav.news')} />
            <div className='mx-auto max-w-5xl px-4 py-8'>
                <ul className='space-y-8'>
                    {posts.map((post) => (
                        <li key={post.id}>
                            <SiteLink href={`/news/${post.id}`} className='group block'>
                                <time className='text-sm text-text-muted'>{post.dateLabel}</time>
                                <h2 className='mt-1 font-display text-xl font-semibold group-hover:text-primary'>
                                    {post.title}
                                </h2>
                                {post.description && <p className='mt-1 text-text-muted'>{post.description}</p>}
                            </SiteLink>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}
