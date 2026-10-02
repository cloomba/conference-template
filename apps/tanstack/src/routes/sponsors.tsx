import { createFileRoute } from '@tanstack/react-router'

import { CallBanner } from '@/components/CallBanner'
import { PageHeader } from '@/components/PageHeader'
import { Sponsors } from '@/components/sections/Sponsors'
import { headT, pageHead, siteOf } from '@/lib/head'
import { useT } from '@/lib/site'
import { getSponsors } from '@/server/functions'

export const Route = createFileRoute('/sponsors')({
    loader: () => getSponsors(),
    head: ({ matches }) => {
        const site = siteOf(matches)
        const t = headT(site)
        return pageHead(site, {
            title: t('nav.sponsors'),
            description: t('sponsors.meta_description', { site: site?.config.site.name ?? '' }),
            path: '/sponsors',
        })
    },
    component: SponsorsPage,
})

function SponsorsPage() {
    const { tiers, callOpen } = Route.useLoaderData()
    const { t } = useT()
    return (
        <>
            <PageHeader title={t('nav.sponsors')} />
            <Sponsors tiers={tiers} plain />
            {callOpen && (
                <div className='mx-auto max-w-5xl px-4 pb-8'>
                    <CallBanner
                        title={t('sponsors.cta_title')}
                        body={t('sponsors.cta_body')}
                        href='/become-a-sponsor'
                        label={t('common.become_a_sponsor')}
                    />
                </div>
            )}
        </>
    )
}
