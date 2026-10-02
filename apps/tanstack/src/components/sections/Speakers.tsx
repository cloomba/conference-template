import { SectionHeading } from '@/components/ui/SectionHeading'
import { SiteLink } from '@/components/ui/SiteLink'
import { useT } from '@/lib/site'
import type { Person } from '@/lib/views'

export function Speakers({ speakers }: { speakers: Person[] }) {
    const { t } = useT()
    const preview = speakers.slice(0, 12)
    if (preview.length === 0) return null

    return (
        <section className='mx-auto max-w-5xl px-4 py-14'>
            <SectionHeading
                title={t('nav.speakers')}
                href={speakers.length > preview.length ? '/speakers' : undefined}
                linkLabel={t('speakers.all_count', { count: speakers.length })}
            />
            <ul className='grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4'>
                {preview.map((speaker) => (
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
                            <h3 className='font-medium group-hover:text-primary'>{speaker.name}</h3>
                            {speaker.headline && <p className='mt-0.5 text-sm text-text-muted'>{speaker.headline}</p>}
                        </SiteLink>
                    </li>
                ))}
            </ul>
        </section>
    )
}
