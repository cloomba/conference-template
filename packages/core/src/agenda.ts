// Agenda logic: the now/next computation (mirrored 1:1 from the Cloomba
// server so every surface advances identically) plus grouping helpers for
// rendering a day × room schedule. Pure functions, framework-free.

// The minimal slice of a wire session this module needs — @cloomba/client's
// `Session` is a structural superset.
export interface WireSession {
    hash: string
    title: string
    starts_at: string
    ends_at: string
    location: string | null
    position: number
}

export interface AgendaSlot {
    hash: string
    title: string
    starts_at: Date
    ends_at: Date
    location: string | null
    position: number
}

export interface NowNext {
    // Every session live at `now` (starts_at <= now < ends_at), ordered
    // (starts_at, position). One entry per parallel room — usually 0 or 1.
    current: AgendaSlot[]
    // The earliest session starting strictly after `now`, or null once the
    // agenda is exhausted.
    next: AgendaSlot | null
    // The earliest starts_at/ends_at strictly after `now` — the instant the
    // display next changes. Drives island poll scheduling.
    nextBoundaryAt: Date | null
}

export const toAgendaSlots = <T extends WireSession>(sessions: T[]): (T & AgendaSlot)[] =>
    sessions.map((s) => ({ ...s, starts_at: new Date(s.starts_at), ends_at: new Date(s.ends_at) }))

const compareSlots = (a: AgendaSlot, b: AgendaSlot): number =>
    a.starts_at.getTime() - b.starts_at.getTime() || a.position - b.position

export const computeNowNext = (sessions: AgendaSlot[], now: Date): NowNext => {
    // Defensive: callers must not rely on their own ordering.
    const sorted = [...sessions].sort(compareSlots)
    const t = now.getTime()

    const current = sorted.filter((s) => s.starts_at.getTime() <= t && t < s.ends_at.getTime())
    const next = sorted.find((s) => s.starts_at.getTime() > t) ?? null

    let nextBoundaryAt: Date | null = null
    for (const s of sorted) {
        for (const boundary of [s.starts_at, s.ends_at]) {
            const ms = boundary.getTime()
            if (ms > t && (nextBoundaryAt === null || ms < nextBoundaryAt.getTime())) {
                nextBoundaryAt = boundary
            }
        }
    }

    return { current, next, nextBoundaryAt }
}

// Calendar day (YYYY-MM-DD) of an instant in the EVENT's timezone — agenda
// pages group by wall-clock day, never by UTC day.
export const isoDayKey = (instant: Date, timeZone: string): string =>
    // en-CA formats as YYYY-MM-DD.
    new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant)

export interface AgendaDay<T extends AgendaSlot> {
    // YYYY-MM-DD in the event timezone.
    day: string
    slots: T[]
}

export const groupByDay = <T extends AgendaSlot>(slots: T[], timeZone: string): AgendaDay<T>[] => {
    const sorted = [...slots].sort(compareSlots)
    const days = new Map<string, T[]>()
    for (const slot of sorted) {
        const key = isoDayKey(slot.starts_at, timeZone)
        const bucket = days.get(key)
        if (bucket) bucket.push(slot)
        else days.set(key, [slot])
    }
    // Map preserves insertion order; slots were sorted, so days come out
    // chronologically.
    return [...days.entries()].map(([day, daySlots]) => ({ day, slots: daySlots }))
}

export interface AgendaRoom<T extends AgendaSlot> {
    // The free-text room/track, or null for single-track sessions.
    location: string | null
    slots: T[]
}

// Rooms in order of first appearance in the (chronologically sorted) agenda —
// the main stage opens the day, so it lands in the first column.
export const groupByLocation = <T extends AgendaSlot>(slots: T[]): AgendaRoom<T>[] => {
    const sorted = [...slots].sort(compareSlots)
    const rooms = new Map<string | null, T[]>()
    for (const slot of sorted) {
        const bucket = rooms.get(slot.location)
        if (bucket) bucket.push(slot)
        else rooms.set(slot.location, [slot])
    }
    return [...rooms.entries()].map(([location, roomSlots]) => ({ location, slots: roomSlots }))
}

// Sponsor tiers, highest first — matches the API's `SponsorTier` enum.
export const SPONSOR_TIER_ORDER = ['platinum', 'gold', 'silver', 'bronze', 'community'] as const
export type SponsorTierName = (typeof SPONSOR_TIER_ORDER)[number]

// Stable sort: tier weight, then the organizer's display order.
export const sortSponsors = <T extends { tier: string; position: number }>(sponsors: T[]): T[] =>
    [...sponsors].sort(
        (a, b) =>
            SPONSOR_TIER_ORDER.indexOf(a.tier as SponsorTierName) -
                SPONSOR_TIER_ORDER.indexOf(b.tier as SponsorTierName) || a.position - b.position
    )
