import { createFileRoute, notFound } from '@tanstack/react-router'

import { PageHeader } from '@/components/PageHeader'
import { Html } from '@/components/ui/Html'
import { JsonLd } from '@/components/ui/JsonLd'
import { SiteLink } from '@/components/ui/SiteLink'
import { pageHead, siteOf } from '@/lib/head'
import { useT } from '@/lib/site'
import { staticMissingAsNull } from '@/lib/static-missing'
import { getSession } from '@/server/functions'

export const Route = createFileRoute('/sessions/$slug')({
    loader: async ({ params }) => {
        const session = await staticMissingAsNull(getSession({ data: params.slug }))
        if (!session) throw notFound()
        return session
    },
    head: ({ matches, loaderData, params }) =>
        pageHead(siteOf(matches), { title: loaderData?.title, path: `/sessions/${params.slug}` }),
    component: Session,
})

function Session() {
    const session = Route.useLoaderData()
    const { t } = useT()
    return (
        <>
            <JsonLd text={session.jsonLd} />
            <PageHeader title={session.title} back={{ href: '/agenda', label: t('nav.agenda') }}>
                <p className='mt-2 text-text-muted'>{session.when}</p>
            </PageHeader>
            <article className='mx-auto max-w-5xl px-4 py-8'>
                {session.speakers.length > 0 && (
                    <ul className='flex flex-wrap gap-3'>
                        {session.speakers.map((speaker) => (
                            <li key={speaker.hash}>
                                <SiteLink
                                    href={speaker.path}
                                    className='flex items-center gap-2 rounded-card border border-text/10 py-1.5 pl-1.5 pr-3 text-sm hover:bg-surface-alt'
                                >
                                    {speaker.image_url && (
                                        <img
                                            draggable={false}
                                            src={speaker.image_url}
                                            alt=''
                                            className='size-7 rounded-full object-cover'
                                        />
                                    )}
                                    <span className='font-medium'>{speaker.name}</span>
                                    {speaker.headline && <span className='text-text-muted'>{speaker.headline}</span>}
                                </SiteLink>
                            </li>
                        ))}
                    </ul>
                )}

                {session.descriptionHtml && (
                    <Html html={session.descriptionHtml} className='prose-content mt-8 max-w-3xl' />
                )}
            </article>
        </>
    )
}
