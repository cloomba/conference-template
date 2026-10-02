import { useEffect, useState } from 'react'

import { SectionHeading } from '@/components/ui/SectionHeading'
import { SiteLink } from '@/components/ui/SiteLink'
import { useSite, useT } from '@/lib/site'
import type { Tier } from '@/lib/views'

interface Props {
    tiers: Tier[]
    // The dedicated /tickets page provides its own PageHeader title.
    plain?: boolean
}

// "Only N left" once a capped tier runs low.
const FEW_LEFT = 10

type Availability = Pick<Tier, 'sold_out' | 'spots_left'>

// Live availability: re-read sold-out / spots-left from the anonymous
// CORS-open endpoint once the page is in the browser, so a tier selling out
// after the build (or after the server cached its copy) shows truthfully.
// Until it answers — or if it never does — the page shows what it was
// rendered with.
const useLiveAvailability = (tiers: Tier[]): Map<string, Availability> => {
    const { browserBaseUrl, config } = useSite()
    const [live, setLive] = useState<Map<string, Availability>>(new Map())
    const hasTiers = tiers.length > 0

    useEffect(() => {
        if (!hasTiers) return
        let cancelled = false
        fetch(`${browserBaseUrl}/events/${encodeURIComponent(config.event.slug)}/ticket-types`)
            .then((response) => (response.ok ? response.json() : null))
            .then((body: { items?: (Availability & { hash: string })[] } | null) => {
                if (cancelled || !body?.items) return
                setLive(
                    new Map(
                        body.items.map((item) => [item.hash, { sold_out: item.sold_out, spots_left: item.spots_left }])
                    )
                )
            })
            .catch(() => {
                // Network hiccup — the rendered availability stays.
            })
        return () => {
            cancelled = true
        }
    }, [browserBaseUrl, config.event.slug, hasTiers])

    return live
}

export function Tickets({ tiers, plain = false }: Props) {
    const { t, tn } = useT()
    const live = useLiveAvailability(tiers)
    if (tiers.length === 0) return null

    // Exactly four tiers read best as 2×2 — three-up leaves an orphan row.
    const gridCols = tiers.length === 4 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'

    return (
        <section className={`mx-auto max-w-5xl px-4 ${plain ? 'py-8' : 'py-14'}`}>
            {!plain && <SectionHeading title={t('nav.tickets')} />}
            <ul className={`grid gap-6 ${gridCols}`}>
                {tiers.map((tier) => {
                    const { sold_out, spots_left } = live.get(tier.hash) ?? tier
                    const fewLeft = !sold_out && spots_left !== null && spots_left <= FEW_LEFT
                    return (
                        <li key={tier.hash} className='flex flex-col rounded-card border border-text/10 p-6'>
                            <h3 className='font-medium'>{tier.name}</h3>
                            <p className='mt-2 font-display text-3xl font-semibold'>{tier.priceLabel}</p>
                            {tier.description && <p className='mt-3 text-sm text-text-muted'>{tier.description}</p>}
                            <div className='mt-auto pt-6'>
                                {sold_out ? (
                                    <span className='inline-block rounded-card bg-surface-alt px-4 py-2 text-sm text-text-muted'>
                                        {t('tickets.sold_out')}
                                    </span>
                                ) : (
                                    <SiteLink
                                        href='/tickets#register'
                                        className='inline-block rounded-card bg-primary px-5 py-2.5 font-medium text-primary-content transition-opacity hover:opacity-90'
                                    >
                                        {t('common.register')}
                                    </SiteLink>
                                )}
                                {fewLeft && (
                                    <p className='mt-2 text-xs text-text-muted'>
                                        {tn('tickets.spots_left', spots_left ?? 0)}
                                    </p>
                                )}
                            </div>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
