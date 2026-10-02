import { createFileRoute } from '@tanstack/react-router'

import { CallBanner } from '@/components/CallBanner'
import { PageHeader } from '@/components/PageHeader'
import { SiteLink } from '@/components/ui/SiteLink'
import { headT, pageHead, siteOf } from '@/lib/head'
import { useT } from '@/lib/site'
import { getSpeakers } from '@/server/functions'

export const Route = createFileRoute('/speakers/')({
    loader: () => getSpeakers(),
    head: ({ matches }) => {
        const site = siteOf(matches)
        const t = headT(site)
        return pageHead(site, {
            title: t('nav.speakers'),
            description: t('speakers.meta_description', { site: site?.config.site.name ?? '' }),
            path: '/speakers',
        })
    },
    component: SpeakerList,
})

function SpeakerList() {
    const { speakers, cfpOpen } = Route.useLoaderData()
    const { t } = useT()
    return (
        <>
            <PageHeader title={t('nav.speakers')} />
            <div className='mx-auto max-w-5xl px-4 py-8'>
                <ul className='grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4'>
                    {speakers.map((speaker) => (
                        <li key={speaker.hash}>
                            <SiteLink href={speaker.path} className='group block'>
                                {speaker.image_url ? (
                                    <img
                                        draggable={false}
                                        src={speaker.image_url}
                                        alt={speaker.name ?? ''}
                                        className='mb-3 aspect-square w-full rounded-card object-cover'
                                        loading='lazy'
                                    />
                                ) : (
                                    <div className='mb-3 flex aspect-square w-full items-center justify-center rounded-card bg-surface-alt font-display text-3xl text-text-muted'>
                                        {(speaker.name ?? '?').slice(0, 1)}
                                    </div>
                                )}
                                <h2 className='font-medium group-hover:text-primary'>{speaker.name}</h2>
                                {speaker.headline && (
                                    <p className='mt-0.5 text-sm text-text-muted'>{speaker.headline}</p>
                                )}
                            </SiteLink>
                        </li>
                    ))}
                </ul>
                {cfpOpen && (
                    <CallBanner
                        title={t('speakers.cfp_title')}
                        body={t('speakers.cfp_body')}
                        href='/call-for-papers'
                        label={t('speakers.cfp_label')}
                    />
                )}
            </div>
        </>
    )
}
