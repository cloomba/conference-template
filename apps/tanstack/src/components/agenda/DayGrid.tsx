import { SiteLink } from '@/components/ui/SiteLink'
import type { AgendaDay, DayGrid as DayGridData } from '@/lib/views'

// One conference day as a time-proportional grid (placement computed on the
// server, src/server/views.ts): rows are 15-minute slots, columns are rooms,
// sessions span their real duration — so parallel talks align vertically by
// actual time, and room-less items render as full-width bands INSIDE every
// track's flow. On small screens this collapses to a chronological list with
// room labels.

export function DayGrid({ grid, entries }: { grid: DayGridData; entries: AgendaDay['entries'] }) {
    // Two room columns fit from `md`; three or more need `lg`. (Both class pairs
    // stay as full literals below so Tailwind's scanner compiles them.)
    const twoRooms = grid.rooms.length <= 2
    const gridAt = twoRooms ? 'md:grid' : 'lg:grid'
    const listHideAt = twoRooms ? 'md:hidden' : 'lg:hidden'

    return (
        <>
            {/* Desktop: the time grid. */}
            <div
                className={`day-grid hidden gap-x-3 gap-y-1 ${gridAt}`}
                style={{
                    gridTemplateColumns: `3.25rem repeat(${grid.rooms.length}, minmax(0, 1fr))`,
                    gridAutoRows: 'minmax(1.3rem, auto)',
                }}
            >
                {grid.rooms.map((name, index) => (
                    <h3
                        key={name}
                        className='pb-2 text-sm font-medium uppercase tracking-widest text-text-muted'
                        style={{ gridColumn: index + 2, gridRow: 1 }}
                        data-room={name}
                    >
                        {name}
                    </h3>
                ))}
                {grid.marks.map((mark) => (
                    <div
                        key={mark.row}
                        className='border-t border-text/10 pr-2 pt-0.5 text-right font-mono text-xs text-text-muted'
                        style={{ gridColumn: 1, gridRow: mark.row }}
                    >
                        {mark.label}
                    </div>
                ))}
                {grid.placed.map((entry) =>
                    entry.column === null ? (
                        <div
                            key={entry.hash}
                            className='flex items-center justify-center gap-3 rounded-card bg-surface-alt px-3 text-sm text-text-muted'
                            style={{ gridColumn: '2 / -1', gridRow: `${entry.rowStart} / ${entry.rowEnd}` }}
                        >
                            <span className='font-medium'>{entry.title}</span>
                            <span className='font-mono text-xs'>{entry.time}</span>
                        </div>
                    ) : (
                        <SiteLink
                            key={entry.hash}
                            href={entry.path}
                            className='flex flex-col overflow-hidden rounded-card border border-text/10 bg-surface p-2.5 transition-colors hover:border-primary/50'
                            style={{ gridColumn: entry.column + 2, gridRow: `${entry.rowStart} / ${entry.rowEnd}` }}
                            data-room={entry.location ?? undefined}
                        >
                            <span className='font-mono text-xs text-text-muted'>{entry.time}</span>
                            <span className='mt-0.5 text-sm font-medium leading-snug'>{entry.title}</span>
                            {entry.speakers && (
                                <span className='mt-0.5 truncate text-xs text-text-muted'>{entry.speakers}</span>
                            )}
                        </SiteLink>
                    )
                )}
            </div>

            {/* Mobile: chronological flow with room labels; bands stay inline. */}
            <ol className={`divide-y divide-text/10 overflow-hidden rounded-card border border-text/10 ${listHideAt}`}>
                {entries.map((entry) =>
                    entry.location === null ? (
                        <li key={entry.hash} className='bg-surface-alt px-4 py-2.5 text-sm text-text-muted'>
                            <span className='font-mono text-xs'>{entry.time}</span>
                            <span className='ml-3 font-medium'>{entry.title}</span>
                        </li>
                    ) : (
                        <li key={entry.hash} data-room={entry.location}>
                            <SiteLink href={entry.path} className='block px-4 py-3 hover:bg-surface-alt'>
                                <span className='font-mono text-xs text-text-muted'>
                                    {entry.time} · {entry.location}
                                </span>
                                <span className='mt-1 block font-medium'>{entry.title}</span>
                                {entry.speakers && (
                                    <span className='mt-0.5 block text-sm text-text-muted'>{entry.speakers}</span>
                                )}
                            </SiteLink>
                        </li>
                    )
                )}
            </ol>
        </>
    )
}
