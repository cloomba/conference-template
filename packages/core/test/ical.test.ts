import { describe, expect, it } from 'vitest'

import { buildAgendaIcs } from '../src/ical'

const generatedAt = new Date('2026-08-25T12:00:00Z')

describe('buildAgendaIcs', () => {
    it('emits a valid skeleton with UTC times and CRLF endings', () => {
        const ics = buildAgendaIcs({
            title: 'DemoConf',
            uidDomain: 'demo-conf.example.com',
            generatedAt,
            sessions: [
                {
                    hash: 'abc123',
                    title: 'Opening keynote',
                    starts_at: new Date('2026-10-20T09:00:00Z'),
                    ends_at: new Date('2026-10-20T10:00:00Z'),
                    location: 'Main',
                    position: 0,
                },
            ],
        })
        expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
        expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
        expect(ics).toContain('UID:abc123@demo-conf.example.com')
        expect(ics).toContain('DTSTART:20261020T090000Z')
        expect(ics).toContain('DTSTAMP:20260825T120000Z')
        expect(ics).toContain('LOCATION:Main')
        // No bare LF anywhere.
        expect(ics.replace(/\r\n/g, '')).not.toContain('\n')
    })

    it('escapes commas, semicolons, and newlines in text fields', () => {
        const ics = buildAgendaIcs({
            title: 'A, B; C',
            uidDomain: 'x',
            generatedAt,
            sessions: [
                {
                    hash: 'h',
                    title: 'Q&A: pricing, plans; more',
                    description: 'line one\nline two',
                    starts_at: new Date('2026-10-20T09:00:00Z'),
                    ends_at: new Date('2026-10-20T09:30:00Z'),
                    location: null,
                    position: 0,
                },
            ],
        })
        expect(ics).toContain('X-WR-CALNAME:A\\, B\\; C')
        expect(ics).toContain('SUMMARY:Q&A: pricing\\, plans\\; more')
        expect(ics).toContain('DESCRIPTION:line one\\nline two')
    })

    it('folds lines longer than 75 octets with a leading space', () => {
        const ics = buildAgendaIcs({
            title: 'X',
            uidDomain: 'x',
            generatedAt,
            sessions: [
                {
                    hash: 'h',
                    title: 'T'.repeat(200),
                    starts_at: new Date('2026-10-20T09:00:00Z'),
                    ends_at: new Date('2026-10-20T09:30:00Z'),
                    location: null,
                    position: 0,
                },
            ],
        })
        const folded = ics.split('\r\n').filter((l) => l.startsWith(' '))
        expect(folded.length).toBeGreaterThan(0)
        expect(ics.split('\r\n').every((l) => l.length <= 75)).toBe(true)
    })
})
