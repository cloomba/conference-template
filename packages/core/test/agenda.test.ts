import { describe, expect, it } from 'vitest'

import {
    computeNowNext,
    groupByDay,
    groupByLocation,
    sortSponsors,
    toAgendaSlots,
    type AgendaSlot,
} from '../src/agenda'

const slot = (
    hash: string,
    starts: string,
    ends: string,
    location: string | null = null,
    position = 0
): AgendaSlot => ({
    hash,
    title: hash,
    starts_at: new Date(starts),
    ends_at: new Date(ends),
    location,
    position,
})

// A two-room morning: keynote 09:00–10:00 (Main), then parallel talks
// 10:00–10:45 in both rooms, then a gap, then a closing 12:00–13:00.
const agenda = [
    slot('keynote', '2026-10-20T09:00:00Z', '2026-10-20T10:00:00Z', 'Main'),
    slot('talk-a', '2026-10-20T10:00:00Z', '2026-10-20T10:45:00Z', 'Main', 0),
    slot('talk-b', '2026-10-20T10:00:00Z', '2026-10-20T10:45:00Z', 'Side', 1),
    slot('closing', '2026-10-20T12:00:00Z', '2026-10-20T13:00:00Z', 'Main'),
]

describe('computeNowNext (mirrors the server semantics from specs/15)', () => {
    it('before the first session: nothing current, first is next', () => {
        const r = computeNowNext(agenda, new Date('2026-10-20T08:00:00Z'))
        expect(r.current).toEqual([])
        expect(r.next?.hash).toBe('keynote')
        expect(r.nextBoundaryAt?.toISOString()).toBe('2026-10-20T09:00:00.000Z')
    })

    it('a session start is inclusive, its end exclusive', () => {
        const atStart = computeNowNext(agenda, new Date('2026-10-20T09:00:00Z'))
        expect(atStart.current.map((s) => s.hash)).toEqual(['keynote'])
        const atEnd = computeNowNext(agenda, new Date('2026-10-20T10:00:00Z'))
        expect(atEnd.current.map((s) => s.hash)).toEqual(['talk-a', 'talk-b'])
    })

    it('parallel sessions: one current entry per room, ordered (starts_at, position)', () => {
        const r = computeNowNext(agenda, new Date('2026-10-20T10:15:00Z'))
        expect(r.current.map((s) => s.hash)).toEqual(['talk-a', 'talk-b'])
        expect(r.next?.hash).toBe('closing')
        // The next display change is the parallel block ending.
        expect(r.nextBoundaryAt?.toISOString()).toBe('2026-10-20T10:45:00.000Z')
    })

    it('gap between sessions: nothing current, upcoming is next', () => {
        const r = computeNowNext(agenda, new Date('2026-10-20T11:00:00Z'))
        expect(r.current).toEqual([])
        expect(r.next?.hash).toBe('closing')
        expect(r.nextBoundaryAt?.toISOString()).toBe('2026-10-20T12:00:00.000Z')
    })

    it('after the last session: agenda exhausted', () => {
        const r = computeNowNext(agenda, new Date('2026-10-20T14:00:00Z'))
        expect(r.current).toEqual([])
        expect(r.next).toBeNull()
        expect(r.nextBoundaryAt).toBeNull()
    })

    it('does not rely on caller ordering', () => {
        const shuffled = [agenda[3], agenda[1], agenda[0], agenda[2]]
        const r = computeNowNext(shuffled, new Date('2026-10-20T10:15:00Z'))
        expect(r.current.map((s) => s.hash)).toEqual(['talk-a', 'talk-b'])
    })
})

describe('toAgendaSlots', () => {
    it('parses wire ISO strings and keeps extra fields', () => {
        const [s] = toAgendaSlots([
            {
                hash: 'x',
                title: 'X',
                starts_at: '2026-10-20T09:00:00Z',
                ends_at: '2026-10-20T10:00:00Z',
                location: null,
                position: 0,
                speakers: ['kept'],
            },
        ])
        expect(s.starts_at).toBeInstanceOf(Date)
        expect(s.speakers).toEqual(['kept'])
    })
})

describe('groupByDay', () => {
    it('groups by wall-clock day in the EVENT timezone, not UTC', () => {
        // 23:30 UTC on Oct 20 is already Oct 21 in Bratislava (UTC+2).
        const late = slot('late', '2026-10-20T23:30:00Z', '2026-10-21T00:30:00Z')
        const days = groupByDay([...agenda, late], 'Europe/Bratislava')
        expect(days.map((d) => d.day)).toEqual(['2026-10-20', '2026-10-21'])
        expect(days[1].slots.map((s) => s.hash)).toEqual(['late'])
    })
})

describe('groupByLocation', () => {
    it('orders rooms by first appearance in the sorted agenda', () => {
        const rooms = groupByLocation(agenda)
        expect(rooms.map((r) => r.location)).toEqual(['Main', 'Side'])
    })
})

describe('sortSponsors', () => {
    it('sorts by tier weight then organizer position', () => {
        const sorted = sortSponsors([
            { tier: 'community', position: 0, name: 'c' },
            { tier: 'gold', position: 1, name: 'g2' },
            { tier: 'platinum', position: 0, name: 'p' },
            { tier: 'gold', position: 0, name: 'g1' },
        ])
        expect(sorted.map((s) => s.name)).toEqual(['p', 'g1', 'g2', 'c'])
    })
})

describe('minutesOfDay', () => {
    it('reports wall-clock minutes in the event timezone, not UTC', async () => {
        const { minutesOfDay } = await import('../src/format')
        // 07:30 UTC is 09:30 in Bratislava (UTC+2, October DST still active on the 20th).
        expect(minutesOfDay(new Date('2026-10-20T07:30:00Z'), 'Europe/Bratislava')).toBe(9 * 60 + 30)
        expect(minutesOfDay(new Date('2026-10-20T22:30:00Z'), 'Europe/Bratislava')).toBe(30)
    })
})
