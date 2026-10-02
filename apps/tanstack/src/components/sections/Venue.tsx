import { SectionHeading } from '@/components/ui/SectionHeading'
import { useT } from '@/lib/site'
import type { EventSummary } from '@/lib/views'

export function Venue({ location }: { location: EventSummary['location'] }) {
    const { t } = useT()
    const hasVenue = Boolean(location.name || location.address || location.city)
    if (!hasVenue) return null
    const mapsHref =
        location.lat != null && location.lng != null
            ? `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
            : location.address
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`
              : null

    return (
        <section className='mx-auto max-w-5xl px-4 py-14'>
            <SectionHeading title={t('venue.title')} />
            <div className='rounded-card border border-text/10 p-6'>
                {location.name && <h3 className='font-medium'>{location.name}</h3>}
                <p className='mt-1 text-text-muted'>
                    {[location.address, location.city, location.country].filter(Boolean).join(', ')}
                </p>
                {mapsHref && (
                    <a
                        href={mapsHref}
                        rel='noopener'
                        className='mt-4 inline-block text-sm text-primary hover:underline'
                    >
                        {t('venue.directions')}
                    </a>
                )}
            </div>
        </section>
    )
}
