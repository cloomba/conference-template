import { SectionHeading } from '@/components/ui/SectionHeading'
import { useT } from '@/lib/site'
import type { SponsorTierGroup } from '@/lib/views'

interface Props {
    tiers: SponsorTierGroup[]
    // The home page renders this as an alt-surface band; the dedicated
    // /sponsors page wants it plain (a full gray page reads broken).
    plain?: boolean
}

export function Sponsors({ tiers, plain = false }: Props) {
    const { t } = useT()
    if (tiers.length === 0) return null

    return (
        <section className={plain ? 'py-8' : 'bg-surface-alt py-14'}>
            <div className='mx-auto max-w-5xl px-4'>
                {/* On the dedicated page the PageHeader owns the title. */}
                {!plain && <SectionHeading title={t('nav.sponsors')} />}
                {tiers.map(({ tier, sponsors }) => (
                    <div key={tier} className='mb-10 last:mb-0'>
                        <h3 className='mb-4 text-sm font-medium uppercase tracking-widest text-text-muted'>{tier}</h3>
                        <ul className='flex flex-wrap items-center gap-x-10 gap-y-6'>
                            {sponsors.map((sponsor) => (
                                <li key={sponsor.hash}>
                                    <a
                                        href={sponsor.link ?? undefined}
                                        rel='noopener'
                                        className='flex items-center gap-3 opacity-80 transition-opacity hover:opacity-100'
                                    >
                                        {sponsor.image_url ? (
                                            <img
                                                draggable={false}
                                                src={sponsor.image_url}
                                                alt={sponsor.name ?? ''}
                                                className='max-h-12 w-auto max-w-40 object-contain'
                                                loading='lazy'
                                            />
                                        ) : (
                                            <span className='font-display text-lg font-semibold'>{sponsor.name}</span>
                                        )}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    )
}
