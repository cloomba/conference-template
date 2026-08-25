// iCalendar export of the agenda — one VEVENT per session, times in UTC.
// Deliberately minimal RFC 5545: CRLF line endings, 75-octet line folding,
// text escaping. `generatedAt` is a parameter so builds are deterministic.

import type { AgendaSlot } from './agenda'

const CRLF = '\r\n'

// Escape per RFC 5545 §3.3.11: backslash, semicolon, comma, newline.
const escapeText = (value: string): string =>
    value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

// 20261020T090000Z
const utcStamp = (instant: Date): string =>
    instant
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, 'Z')

// Fold lines longer than 75 octets with CRLF + space continuations. Folding by
// UTF-16 code unit can split a multi-byte char in theory; every consumer
// unfolds before parsing, so this stays simple.
const fold = (line: string): string => {
    if (line.length <= 75) return line
    const parts: string[] = []
    let rest = line
    while (rest.length > 75) {
        parts.push(rest.slice(0, 75))
        rest = ' ' + rest.slice(75)
    }
    parts.push(rest)
    return parts.join(CRLF)
}

export interface AgendaIcsOptions {
    // Conference name — becomes the calendar name and the UID namespace.
    title: string
    // Stable identifier (the event slug) — UIDs are `<session-hash>@<domain>`.
    uidDomain: string
    sessions: (AgendaSlot & { description?: string | null })[]
    // DTSTAMP for every VEVENT — pass the build time.
    generatedAt: Date
    // Absolute link back to the site, attached as URL when present.
    url?: string
}

export const buildAgendaIcs = (options: AgendaIcsOptions): string => {
    const lines: string[] = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Cloomba//Conference Template//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        fold(`X-WR-CALNAME:${escapeText(options.title)}`),
    ]
    for (const session of options.sessions) {
        lines.push(
            'BEGIN:VEVENT',
            fold(`UID:${session.hash}@${options.uidDomain}`),
            `DTSTAMP:${utcStamp(options.generatedAt)}`,
            `DTSTART:${utcStamp(session.starts_at)}`,
            `DTEND:${utcStamp(session.ends_at)}`,
            fold(`SUMMARY:${escapeText(session.title)}`)
        )
        if (session.location) lines.push(fold(`LOCATION:${escapeText(session.location)}`))
        if (session.description) lines.push(fold(`DESCRIPTION:${escapeText(session.description)}`))
        if (options.url) lines.push(fold(`URL:${options.url}`))
        lines.push('END:VEVENT')
    }
    lines.push('END:VCALENDAR')
    return lines.join(CRLF) + CRLF
}
