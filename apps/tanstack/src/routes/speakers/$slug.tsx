import { createFileRoute, notFound } from '@tanstack/react-router'

import { PageHeader } from '@/components/PageHeader'
import { Html } from '@/components/ui/Html'
import { JsonLd } from '@/components/ui/JsonLd'
import { SiteLink } from '@/components/ui/SiteLink'
import { SocialLink } from '@/components/ui/SocialLink'
import { headT, pageHead, siteOf } from '@/lib/head'
import { useT } from '@/lib/site'
import { staticMissingAsNull } from '@/lib/static-missing'
import { getSpeaker } from '@/server/functions'

export const Route = createFileRoute('/speakers/$slug')({
    loader: async ({ params }) => {
        const speaker = await staticMissingAsNull(getSpeaker({ data: params.slug }))
        if (!speaker) throw notFound()
        return speaker
    },
    head: ({ matches, loaderData, params }) => {
        const site = siteOf(matches)
        return pageHead(site, {
            title: loaderData?.name ?? headT(site)('speakers.unnamed'),
            path: `/speakers/${params.slug}`,
        })
    },
    component: Speaker,
})

function Speaker() {
    const speaker = Route.useLoaderData()
    const { t } = useT()
    const name = speaker.name ?? t('speakers.unnamed')

    return (
        <>
            <JsonLd text={speaker.jsonLd} />
            <PageHeader
                title={name}
                subtitle={speaker.headline ?? undefined}
                back={{ href: '/speakers', label: t('nav.speakers') }}
                aside={
                    speaker.image_url ? (
                        <img
                            draggable={false}
                            src={speaker.image_url}
                            alt={speaker.name ?? ''}
                            className='size-20 shrink-0 rounded-card object-cover sm:size-28'
                        />
                    ) : (
                        <div className='flex size-20 shrink-0 items-center justify-center rounded-card bg-surface-alt font-display text-3xl text-text-muted sm:size-28'>
                            {(speaker.name ?? '?').slice(0, 1)}
                        </div>
                    )
                }
            >
                {speaker.link && (
                    <div className='mt-3'>
                        <SocialLink link={speaker.link} />
                    </div>
                )}
            </PageHeader>
            <article className='mx-auto max-w-5xl px-4 py-8'>
                {speaker.bioHtml && <Html html={speaker.bioHtml} className='prose-content max-w-3xl' />}

                {speaker.sessions.length > 0 && (
                    <section className='mt-10'>
                        <h2 className='mb-4 font-display text-xl font-semibold'>{t('speakers.sessions_heading')}</h2>
                        <ol className='max-w-3xl divide-y divide-text/10 overflow-hidden rounded-card border border-text/10'>
                            {speaker.sessions.map((session) => (
                                <li key={session.hash}>
                                    <SiteLink href={session.path} className='block px-4 py-3 hover:bg-surface-alt'>
                                        <span className='font-mono text-xs text-text-muted'>{session.when}</span>
                                        <span className='mt-1 block font-medium'>{session.title}</span>
                                    </SiteLink>
                                </li>
                            ))}
                        </ol>
                    </section>
                )}
            </article>
        </>
    )
}
