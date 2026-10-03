import { SectionHeading } from '@/components/ui/SectionHeading'
import { useT } from '@/lib/site'
import type { Sponsor, SponsorTierGroup } from '@/lib/views'

interface Props {
    tiers: SponsorTierGroup[]
    // The home page renders this as an alt-surface band; the dedicated
    // /sponsors page wants it plain (a full gray page reads broken).
    plain?: boolean
}

// The home band scrolls the logos in one row once there are enough to fill
// it. /sponsors always keeps the tiers: top tiers pay to be seen, and a moving
// logo is harder to see and to click.
const MARQUEE_MIN = 6
// Copies of the row in the track — enough to cover a wide screen while the
// first copy scrolls out.
const MARQUEE_COPIES = 4

function Logo({ sponsor, copy = false }: { sponsor: Sponsor; copy?: boolean }) {
    return (
        <a
            href={sponsor.link ?? undefined}
            rel='noopener'
            tabIndex={copy ? -1 : undefined}
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
    )
}

// Moving content that runs longer than five seconds needs a way to stop it
// (WCAG 2.2.2) — hover pauses it, and so does the pause control, which is a
// checkbox so it works without JavaScript. Only the first copy is in the
// accessibility tree and the tab order, so each sponsor is met once. With
// reduced motion there is no scrolling: the first copy wraps, the rest hide.
function Marquee({ sponsors }: { sponsors: Sponsor[] }) {
    const { t } = useT()
    return (
        <div className='group'>
            <div className='flex gap-(--gap) overflow-hidden [--gap:3rem] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:[mask-image:none]'>
                {Array.from({ length: MARQUEE_COPIES }, (_, index) => (
                    <ul
                        key={index}
                        aria-hidden={index > 0 || undefined}
                        className={`flex shrink-0 items-center justify-around gap-(--gap) motion-safe:animate-marquee group-hover:[animation-play-state:paused] group-has-[:checked]:[animation-play-state:paused] ${
                            index > 0
                                ? 'motion-reduce:hidden'
                                : 'motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-start motion-reduce:gap-y-6'
                        }`}
                    >
                        {sponsors.map((sponsor) => (
                            <li key={sponsor.hash}>
                                <Logo sponsor={sponsor} copy={index > 0} />
                            </li>
                        ))}
                    </ul>
                ))}
            </div>
            <div className='mt-6 flex justify-end motion-reduce:hidden'>
                <label className='flex size-9 cursor-pointer items-center justify-center rounded-full border border-text/15 text-text-muted transition-colors hover:bg-surface hover:text-text has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary'>
                    <input type='checkbox' className='peer sr-only' />
                    <span className='sr-only'>{t('sponsors.pause')}</span>
                    <svg
                        viewBox='0 0 16 16'
                        fill='currentColor'
                        aria-hidden='true'
                        className='size-3.5 peer-checked:hidden'
                    >
                        <rect x='3' y='2' width='3.5' height='12' rx='1' />
                        <rect x='9.5' y='2' width='3.5' height='12' rx='1' />
                    </svg>
                    <svg
                        viewBox='0 0 16 16'
                        fill='currentColor'
                        aria-hidden='true'
                        className='hidden size-3.5 peer-checked:block'
                    >
                        <path d='M4 2.5v11a1 1 0 0 0 1.5.86l9-5.5a1 1 0 0 0 0-1.72l-9-5.5A1 1 0 0 0 4 2.5Z' />
                    </svg>
                </label>
            </div>
        </div>
    )
}

export function Sponsors({ tiers, plain = false }: Props) {
    const { t } = useT()
    if (tiers.length === 0) return null

    const all = tiers.flatMap((group) => group.sponsors)
    if (!plain && all.length >= MARQUEE_MIN) {
        return (
            <section className='bg-surface-alt py-14'>
                <div className='mx-auto max-w-5xl px-4'>
                    <SectionHeading title={t('nav.sponsors')} href='/sponsors' />
                    <Marquee sponsors={all} />
                </div>
            </section>
        )
    }

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
                                    <Logo sponsor={sponsor} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    )
}
