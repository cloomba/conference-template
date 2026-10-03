import { SiteLink } from '@/components/ui/SiteLink'
import { useT } from '@/lib/site'
import type { EventSummary } from '@/lib/views'

export function Cta({ event }: { event: EventSummary }) {
    const { t } = useT()
    return (
        <section className='mx-auto max-w-5xl px-4 py-14'>
            <div className='rounded-card bg-primary px-8 py-12 text-center text-primary-content'>
                <h2 className='font-display text-3xl font-bold tracking-tight'>{t('cta.heading')}</h2>
                <p className='mt-2 opacity-90'>
                    {event.title} · {event.dates}
                    {event.place && ` · ${event.place}`}
                </p>
                <div className='mt-8 flex flex-wrap justify-center gap-3'>
                    <SiteLink
                        href='/tickets'
                        className='rounded-card bg-surface px-6 py-3 font-medium text-text transition hover:opacity-90 hover:shadow-md motion-safe:hover:-translate-y-0.5'
                    >
                        {t('common.register')}
                    </SiteLink>
                    <SiteLink
                        href='/become-a-sponsor'
                        className='rounded-card border border-primary-content/40 px-6 py-3 font-medium transition hover:bg-primary-content/10 motion-safe:hover:-translate-y-0.5'
                    >
                        {t('common.become_a_sponsor')}
                    </SiteLink>
                </div>
            </div>
        </section>
    )
}
