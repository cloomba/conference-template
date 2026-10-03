import { SiteLink } from '@/components/ui/SiteLink'
import { useSite, useT } from '@/lib/site'
import type { EventSummary } from '@/lib/views'

// The hero image always shows at full opacity, so the text never sits on it —
// its contrast would depend on an image the template does not control.
//   wide   — the site's own `hero_image`: title first, the image below it at
//            full width (16:9). With no hero image and no cover, the bundled
//            scene takes its place.
//   square — no `hero_image`: the event's cover from Cloomba beside the title
//            (above it on phones). Square is Cloomba's cover shape.
// Both frames have a fixed aspect: the API sends no image dimensions, and a
// fixed frame is what keeps the page from shifting as the image loads.
export function Hero({ event }: { event: EventSummary }) {
    const { t } = useT()
    const { config } = useSite()
    const square = config.site.hero_image ? null : event.cover_url
    const wide = config.site.hero_image ?? '/placeholders/hero.svg'

    return (
        <section className='relative overflow-hidden'>
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-text)_1px,transparent_1.5px)] opacity-15 [background-size:22px_22px] [mask-image:radial-gradient(ellipse_80%_70%_at_0%_0%,black,transparent)]'
            ></div>
            <div className='relative mx-auto max-w-5xl px-4 pb-16 pt-12 sm:pb-20 sm:pt-16'>
                <div className={square ? 'grid items-center gap-10 md:grid-cols-2' : 'grid gap-10'}>
                    {square && (
                        <div className='overflow-hidden rounded-card md:order-last'>
                            <img
                                draggable={false}
                                src={square}
                                alt=''
                                className='motion-safe:animate-settle aspect-square w-full object-cover'
                                loading='eager'
                            />
                        </div>
                    )}
                    <div>
                        <p className='motion-safe:animate-rise mb-3 text-sm font-semibold uppercase tracking-widest text-text'>
                            {event.dates}
                            {event.place && ` · ${event.place}`}
                        </p>
                        <h1 className='motion-safe:animate-rise max-w-3xl font-display text-4xl font-bold tracking-tight [--rise-delay:80ms] sm:text-5xl lg:text-6xl'>
                            {event.title}
                        </h1>
                        <div className='motion-safe:animate-rise mt-8 flex flex-wrap gap-3 [--rise-delay:160ms]'>
                            <SiteLink
                                href='/tickets'
                                className='rounded-card bg-primary px-6 py-3 font-medium text-primary-content transition hover:opacity-90 hover:shadow-md hover:shadow-primary/25 motion-safe:hover:-translate-y-0.5'
                            >
                                {t('common.register')}
                            </SiteLink>
                            <SiteLink
                                href='/agenda'
                                className='rounded-card border border-text/15 px-6 py-3 font-medium transition bg-surface hover:bg-surface-alt motion-safe:hover:-translate-y-0.5'
                            >
                                {t('hero.view_agenda')}
                            </SiteLink>
                        </div>
                    </div>
                    {!square && (
                        <div className='overflow-hidden rounded-card'>
                            <img
                                draggable={false}
                                src={wide}
                                alt=''
                                className='motion-safe:animate-settle aspect-video w-full object-cover'
                                loading='eager'
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
