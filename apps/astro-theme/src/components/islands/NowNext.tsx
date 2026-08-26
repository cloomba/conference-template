// The one live element on the agenda: a "Now / Next" strip that appears once
// the event has started and advances through the day. Polls the ANONYMOUS
// CORS-open sessions endpoint — no API key exists in the browser, ever
// (AGENTS.md). Between polls, @cloomba/react recomputes exactly at session
// boundaries, so the strip flips on time even if a poll is minutes away.

import { toAgendaSlots, type AgendaSlot } from '@cloomba/core'
import { useNowNext } from '@cloomba/react'
import { useEffect, useState } from 'react'

const POLL_MS = 5 * 60 * 1000

interface Props {
    browserBase: string
    slug: string
    timezone: string
    eventStartsAt: string
    locale: string
    // Resolved templates, not keys: t() lives on the server side of the island
    // boundary. `until` and `at` carry a {time} placeholder.
    strings: { now: string; until: string; next: string; at: string }
}

const timeOf = (date: Date, timezone: string, locale: string) =>
    new Intl.DateTimeFormat(locale, { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(
        date
    )

const fill = (template: string, time: string) => template.replace('{time}', time)

export default function NowNext({ browserBase, slug, timezone, eventStartsAt, locale, strings }: Props) {
    const [slots, setSlots] = useState<AgendaSlot[]>([])

    useEffect(() => {
        let cancelled = false
        const pull = async () => {
            try {
                const response = await fetch(`${browserBase}/events/${encodeURIComponent(slug)}/sessions`)
                if (!response.ok) return
                const body = (await response.json()) as { items: Parameters<typeof toAgendaSlots>[0] }
                if (!cancelled) setSlots(toAgendaSlots(body.items))
            } catch {
                // Network hiccup — the static agenda is still on the page.
            }
        }
        void pull()
        const timer = setInterval(pull, POLL_MS)
        return () => {
            cancelled = true
            clearInterval(timer)
        }
    }, [browserBase, slug])

    const { current, next } = useNowNext(slots)

    // Quiet before the event starts and after the agenda is exhausted.
    if (new Date() < new Date(eventStartsAt)) return null
    if (current.length === 0 && !next) return null

    return (
        <div className='mt-6 rounded-card border border-primary/30 bg-surface-alt p-4'>
            {current.map((session) => (
                <p key={session.hash} className='text-sm'>
                    <span className='font-semibold text-primary'>{strings.now}</span>{' '}
                    {session.location && <span className='text-text-muted'>{session.location}: </span>}
                    <span className='font-medium'>{session.title}</span>{' '}
                    <span className='text-text-muted'>
                        {fill(strings.until, timeOf(session.ends_at, timezone, locale))}
                    </span>
                </p>
            ))}
            {next && (
                <p className='mt-1 text-sm'>
                    <span className='font-semibold text-text-muted'>{strings.next}</span> <span>{next.title}</span>{' '}
                    <span className='text-text-muted'>
                        {fill(strings.at, timeOf(next.starts_at, timezone, locale))}
                    </span>
                </p>
            )}
        </div>
    )
}
