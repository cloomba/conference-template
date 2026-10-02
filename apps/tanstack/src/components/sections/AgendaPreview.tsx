import { SectionHeading } from '@/components/ui/SectionHeading'
import { SiteLink } from '@/components/ui/SiteLink'
import { useT } from '@/lib/site'
import type { AgendaPreviewData } from '@/lib/views'

export function AgendaPreview({ agenda }: { agenda: AgendaPreviewData | null }) {
    const { t, tn } = useT()
    if (!agenda) return null

    return (
        <section className='mx-auto max-w-5xl px-4 py-14'>
            <SectionHeading
                title={t('nav.agenda')}
                href='/agenda'
                linkLabel={agenda.dayCount > 1 ? tn('agenda.all_days', agenda.dayCount) : t('agenda.full_agenda')}
            />
            <p className='mb-6 text-sm text-text-muted'>{agenda.dayHeading}</p>
            <ol className='divide-y divide-text/10 overflow-hidden rounded-card border border-text/10'>
                {agenda.sessions.map((session) => (
                    <li key={session.hash}>
                        <SiteLink
                            href={session.path}
                            className='flex items-baseline gap-4 px-4 py-3 hover:bg-surface-alt'
                        >
                            <span className='w-28 shrink-0 font-mono text-sm text-text-muted'>{session.time}</span>
                            <span className='min-w-0 flex-1 truncate font-medium'>{session.title}</span>
                            {session.location && (
                                <span className='hidden shrink-0 text-sm text-text-muted sm:block'>
                                    {session.location}
                                </span>
                            )}
                        </SiteLink>
                    </li>
                ))}
            </ol>
        </section>
    )
}
