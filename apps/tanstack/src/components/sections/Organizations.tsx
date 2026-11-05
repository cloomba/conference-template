import { Logo } from '@/components/sections/Sponsors'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useT } from '@/lib/site'
import type { Organization } from '@/lib/views'

// The event's organizers or its partners: a row of logos, like the sponsors
// without their tiers. No page of their own, and nothing at all when empty.
export function Organizations({ kind, items }: { kind: 'organizer' | 'partner'; items: Organization[] }) {
    const { t } = useT()
    if (items.length === 0) return null
    return (
        <section className='mx-auto max-w-5xl px-4 py-14'>
            <SectionHeading title={t(kind === 'organizer' ? 'credits.organizers' : 'credits.partners')} />
            <ul className='flex flex-wrap items-center gap-x-10 gap-y-6'>
                {items.map((item) => (
                    <li key={item.hash}>
                        <Logo entry={item} />
                    </li>
                ))}
            </ul>
        </section>
    )
}
