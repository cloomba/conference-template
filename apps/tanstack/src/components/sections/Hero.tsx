import { SiteLink } from '@/components/ui/SiteLink'
import { useT } from '@/lib/site'
import type { EventSummary } from '@/lib/views'

export function Hero({ event }: { event: EventSummary }) {
    const { t } = useT()
    // The event's cover from Cloomba wins; without one, the bundled scene keeps
    // the hero from being a wall of blank surface.
    const cover = event.cover_url ?? '/placeholders/hero.svg'

    return (
        <section className='relative overflow-hidden'>
            <img
                draggable={false}
                src={cover}
                alt=''
                className='absolute inset-0 size-full object-cover'
                loading='eager'
            />
            {/* The scrim is thinnest at the TOP, which is where the hero text starts —
                keep it opaque enough that the title and dates stay legible over a dark
                cover, without flattening the artwork. */}
            <div className='absolute inset-0 bg-linear-to-t from-surface via-surface/70 to-surface/50'></div>
            <div className='relative mx-auto max-w-5xl px-4 pb-20 pt-24 sm:pb-28 sm:pt-32'>
                {/* text-text, not text-primary: this line sits over the cover, so its
                    contrast depends on an image the template does not control. Primary
                    is reserved for the button below, where it earns the attention. */}
                <p className='mb-3 text-sm font-semibold uppercase tracking-widest text-text'>
                    {event.dates}
                    {event.place && ` · ${event.place}`}
                </p>
                <h1 className='max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-6xl'>{event.title}</h1>
                <div className='mt-8 flex flex-wrap gap-3'>
                    <SiteLink
                        href='/tickets'
                        className='rounded-card bg-primary px-6 py-3 font-medium text-primary-content transition-opacity hover:opacity-90'
                    >
                        {t('common.register')}
                    </SiteLink>
                    <SiteLink
                        href='/agenda'
                        className='rounded-card border border-text/15 px-6 py-3 font-medium transition-colors bg-surface hover:bg-surface-alt'
                    >
                        {t('hero.view_agenda')}
                    </SiteLink>
                </div>
            </div>
        </section>
    )
}
