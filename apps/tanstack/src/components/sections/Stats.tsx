import { useT } from '@/lib/site'
import type { StatsData } from '@/lib/views'

// Quick numbers, straight from the event data.
export function Stats({ stats }: { stats: StatsData }) {
    const { t, tn } = useT()
    const items = [
        { value: stats.speakers, label: t('stats.speakers') },
        { value: stats.talks, label: t('stats.sessions') },
        { value: stats.sponsors, label: t('stats.sponsors') },
        // Plural via Intl.PluralRules, not a ternary — Slovak needs a `few` form
        // for 2-4 days that an English one/other split can't express.
        { value: stats.days, label: tn('stats.days', stats.days) },
        ...(stats.confirmedGuests > 0 ? [{ value: stats.confirmedGuests, label: t('stats.registered') }] : []),
    ]

    return (
        <section className='mx-auto max-w-5xl px-4 py-10'>
            <dl className='grid grid-cols-2 gap-6 rounded-card border border-text/10 p-8 text-center sm:grid-cols-4'>
                {items.slice(0, 4).map((stat) => (
                    <div key={stat.label}>
                        <dd className='font-display text-4xl font-bold text-primary'>{stat.value}</dd>
                        <dt className='mt-1 text-sm uppercase tracking-widest text-text-muted'>{stat.label}</dt>
                    </div>
                ))}
            </dl>
        </section>
    )
}
