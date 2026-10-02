import { createFileRoute } from '@tanstack/react-router'

import { PageHeader } from '@/components/PageHeader'
import { Team } from '@/components/sections/Team'
import { Html } from '@/components/ui/Html'
import { headT, pageHead, siteOf } from '@/lib/head'
import { useSite, useT } from '@/lib/site'
import { getAbout } from '@/server/functions'

export const Route = createFileRoute('/about')({
    loader: () => getAbout(),
    head: ({ matches }) => {
        const site = siteOf(matches)
        return pageHead(site, { title: headT(site)('nav.about'), path: '/about' })
    },
    component: About,
})

function About() {
    const { descriptionHtml, hosts } = Route.useLoaderData()
    const { config } = useSite()
    const { t } = useT()
    return (
        <>
            <PageHeader title={t('about.page_title', { site: config.site.name })} />
            <article className='mx-auto max-w-5xl px-4 py-8'>
                {descriptionHtml && <Html html={descriptionHtml} className='prose-content max-w-3xl' />}
            </article>
            <Team hosts={hosts} />
        </>
    )
}
