import { createFileRoute } from '@tanstack/react-router'

import { DayGrid } from '@/components/agenda/DayGrid'
import { NowNext } from '@/components/agenda/NowNext'
import { PageHeader } from '@/components/PageHeader'
import { SiteLink } from '@/components/ui/SiteLink'
import { headT, pageHead, siteOf } from '@/lib/head'
import { useSite, useT } from '@/lib/site'
import { getAgenda } from '@/server/functions'

export const Route = createFileRoute('/agenda')({
    loader: () => getAgenda(),
    head: ({ matches }) => {
        const site = siteOf(matches)
        const t = headT(site)
        return pageHead(site, {
            title: t('nav.agenda'),
            description: t('agenda.meta_description', { site: site?.config.site.name ?? '' }),
            path: '/agenda',
        })
    },
    component: Agenda,
})

const roomId = (index: number) => `room-${index}`

// Room filter — CSS-only. Rooms are known when the page renders, so we
// GENERATE the exact per-room rules: picking a chip hides other rooms'
// cards/headers, collapses the time grid to one column, and highlights the
// chip. No JS.
const filterCss = (rooms: string[]): string =>
    rooms.length > 1
        ? rooms
              .map((name, index) => {
                  const escaped = name.replace(/'/g, "\\'")
                  const scope = `.agenda-root:has(#${roomId(index)}:checked)`
                  return [
                      `${scope} [data-room]:not([data-room='${escaped}']) { display: none; }`,
                      `${scope} .day-grid { grid-template-columns: 3.25rem minmax(0, 1fr) !important; }`,
                      `${scope} .day-grid [data-room='${escaped}'] { grid-column: 2 / -1 !important; }`,
                      `${scope} label[for='${roomId(index)}'] { background: var(--t-primary); color: var(--t-primary-content); border-color: transparent; }`,
                  ].join('\n')
              })
              .join('\n') +
          `\n.agenda-root:has(#room-all:checked) label[for='room-all'] { background: var(--t-primary); color: var(--t-primary-content); border-color: transparent; }`
        : ''

function Agenda() {
    const agenda = Route.useLoaderData()
    const { browserBaseUrl, config } = useSite()
    const { t, locale, strings } = useT()
    const css = filterCss(agenda.rooms)

    // Sanctioned width-rule exception (AGENTS.md): the DAYS AREA widens for 4+
    // room events — a data grid needs the room; the PageHeader stays at 5xl so
    // the title never moves. Both classes are literals for Tailwind's scanner.
    const daysWidth = agenda.rooms.length >= 4 ? 'max-w-7xl' : 'max-w-5xl'

    return (
        <div className='agenda-root'>
            {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
            <PageHeader title={t('nav.agenda')}>
                <p className='mt-2 text-sm text-text-muted'>
                    {t('agenda.times_local')}{' '}
                    <a href='/agenda.ics' className='text-primary hover:underline'>
                        {t('agenda.add_to_calendar_inline')}
                    </a>
                </p>

                {agenda.rooms.length > 1 && (
                    <fieldset className='mt-6 flex flex-wrap gap-2'>
                        <legend className='sr-only'>{t('a11y.filter_by_stage')}</legend>
                        <label
                            htmlFor='room-all'
                            className='cursor-pointer rounded-card border border-text/15 px-4 py-1.5 text-sm transition-colors hover:bg-surface-alt'
                        >
                            <input type='radio' name='room-filter' id='room-all' className='sr-only' defaultChecked />
                            {t('agenda.all_stages')}
                        </label>
                        {agenda.rooms.map((name, index) => (
                            <label
                                key={name}
                                htmlFor={roomId(index)}
                                className='cursor-pointer rounded-card border border-text/15 px-4 py-1.5 text-sm transition-colors hover:bg-surface-alt'
                            >
                                <input type='radio' name='room-filter' id={roomId(index)} className='sr-only' />
                                {name}
                            </label>
                        ))}
                    </fieldset>
                )}
                {agenda.days.length > 1 && (
                    <nav className='mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm' aria-label={t('a11y.jump_to_day')}>
                        {agenda.days.map((day) => (
                            <a key={day.key} href={`#${day.key}`} className='text-primary hover:underline'>
                                {day.heading}
                            </a>
                        ))}
                    </nav>
                )}
            </PageHeader>

            <div className={`mx-auto px-4 pb-16 ${daysWidth}`}>
                <NowNext
                    browserBase={browserBaseUrl}
                    slug={config.event.slug}
                    timezone={agenda.timezone}
                    eventStartsAt={agenda.eventStartsAt}
                    locale={locale}
                    strings={{
                        now: strings['nownext.now'],
                        until: strings['nownext.until'],
                        next: strings['nownext.next'],
                        at: strings['nownext.at'],
                    }}
                />

                {agenda.days.map((day) => (
                    <section key={day.key} className='mt-12' id={day.key}>
                        <h2 className='mb-6 font-display text-xl font-semibold'>{day.heading}</h2>
                        {day.grid ? (
                            <DayGrid grid={day.grid} entries={day.entries} />
                        ) : (
                            <ol className='divide-y divide-text/10 overflow-hidden rounded-card border border-text/10'>
                                {day.entries.map((entry) => (
                                    <li key={entry.hash}>
                                        <SiteLink href={entry.path} className='block px-4 py-3 hover:bg-surface-alt'>
                                            <span className='font-mono text-xs text-text-muted'>
                                                {entry.time}
                                                {entry.location && ` · ${entry.location}`}
                                            </span>
                                            <span className='mt-1 block font-medium'>{entry.title}</span>
                                            {entry.speakers && (
                                                <span className='mt-0.5 block text-sm text-text-muted'>
                                                    {entry.speakers}
                                                </span>
                                            )}
                                        </SiteLink>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>
                ))}
            </div>
        </div>
    )
}
