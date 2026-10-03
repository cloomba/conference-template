import { createFileRoute } from '@tanstack/react-router'

import { PageHeader } from '@/components/PageHeader'
import { Tickets } from '@/components/sections/Tickets'
import { headT, pageHead, siteOf } from '@/lib/head'
import { useSite, useT } from '@/lib/site'
import { getTickets } from '@/server/functions'

export const Route = createFileRoute('/tickets')({
    loader: () => getTickets(),
    head: ({ matches }) => {
        const site = siteOf(matches)
        const t = headT(site)
        return pageHead(site, {
            title: t('nav.tickets'),
            description: t('tickets.meta_description', { site: site?.config.site.name ?? '' }),
            path: '/tickets',
        })
    },
    component: TicketsPage,
})

// Registration runs INSIDE the Cloomba embed — the attendee signs in and pays
// on Cloomba; this site never touches auth, payments, or personal data. The
// markup is Cloomba's OFFICIAL snippet contract: an `iframe.cloomba-embed`
// plus `/embed/embed.js`, which auto-sizes the frame to the content height it
// posts (`cloomba:embed-height`) and relays the visible viewport so in-frame
// pop-ups position correctly. Don't hand-roll listeners.
function TicketsPage() {
    const { tiers, embedSrc, embedScript } = Route.useLoaderData()
    const { config } = useSite()
    const { t } = useT()
    return (
        <>
            <PageHeader title={t('nav.tickets')} />
            <Tickets tiers={tiers} plain />
            <section className='mx-auto max-w-5xl px-4 pb-16' id='register'>
                <h2 className='mb-6 font-display text-2xl font-semibold tracking-tight'>
                    {t('tickets.register_heading')}
                </h2>
                <div className='w-full overflow-hidden rounded-card border border-text/10'>
                    <iframe
                        className='cloomba-embed'
                        src={embedSrc}
                        style={{ width: '100%', height: '800px', border: 'none' }}
                        loading='lazy'
                        title={t('tickets.embed_title', { site: config.site.name })}
                    ></iframe>
                </div>
                <script src={embedScript} async></script>
            </section>
        </>
    )
}
