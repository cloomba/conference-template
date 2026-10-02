// API objects → the page shapes in src/lib/views.ts, formatted in the site's
// language. SERVER-ONLY. Every server function returns these, never a raw API
// object — see src/lib/views.ts for why the formatting happens here.

import type { EventDetail, Featured, TicketType } from '@cloomba/client'
import {
    formatDateSpan,
    formatDayHeading,
    formatMinutesOfDay,
    formatMoney,
    formatTimeRange,
    groupByDay,
    groupByLocation,
    minutesOfDay,
    sortSponsors,
    SPONSOR_TIER_ORDER,
    type AgendaSlot,
} from '@cloomba/core'

import { sessionPath, speakerPath } from '@/lib/slugs'
import type {
    AgendaEntry,
    AgendaPage,
    AgendaPreviewData,
    DayGrid,
    EventSummary,
    Host,
    NewsTeaser,
    Person,
    SessionLine,
    SponsorTierGroup,
    Tier,
} from '@/lib/views'

import type { ContentEntry } from './content'
import { socialLink } from './socials'
import { locale, t } from './strings'

export const toEventSummary = (event: EventDetail): EventSummary => ({
    title: event.title,
    dates: formatDateSpan(
        new Date(event.starts_at),
        new Date(event.ends_at ?? event.starts_at),
        event.timezone,
        locale
    ),
    place: [event.location.city, event.location.country].filter(Boolean).join(', '),
    location: event.location,
    cover_url: event.cover_url,
})

export const toSessionLine = (slot: AgendaSlot, timezone: string): SessionLine => ({
    hash: slot.hash,
    title: slot.title,
    time: formatTimeRange(slot.starts_at, slot.ends_at, timezone, locale),
    location: slot.location,
    path: sessionPath(slot),
})

// The home page's agenda teaser: the first day, up to six sessions.
export const toAgendaPreview = (slots: AgendaSlot[], timezone: string): AgendaPreviewData | null => {
    const days = groupByDay(slots, timezone)
    const firstDay = days[0]
    if (!firstDay?.slots.length) return null
    return {
        dayHeading: formatDayHeading(firstDay.slots[0].starts_at, timezone, locale),
        dayCount: days.length,
        sessions: firstDay.slots.slice(0, 6).map((slot) => toSessionLine(slot, timezone)),
    }
}

export const countDays = (slots: AgendaSlot[], timezone: string): number => groupByDay(slots, timezone).length

export const toPerson = (entry: Pick<Featured, 'hash' | 'name' | 'headline' | 'image_url'>): Person => ({
    hash: entry.hash,
    name: entry.name,
    headline: entry.headline,
    image_url: entry.image_url,
    path: speakerPath(entry),
})

export const toHost = (entry: Featured): Host => ({
    hash: entry.hash,
    name: entry.name,
    headline: entry.headline,
    image_url: entry.image_url,
    bio: entry.bio,
    link: entry.link ? socialLink(entry.link) : null,
})

// Sponsors grouped by tier, tiers in their fixed order, empty tiers dropped.
export const toSponsorTiers = (entries: Featured[]): SponsorTierGroup[] => {
    const sorted = sortSponsors(entries)
    return SPONSOR_TIER_ORDER.map((tier) => ({
        tier,
        sponsors: sorted
            .filter((entry) => entry.tier === tier)
            .map((entry) => ({
                hash: entry.hash,
                name: entry.name,
                tier,
                link: entry.link,
                image_url: entry.image_url,
            })),
    })).filter((group) => group.sponsors.length > 0)
}

// The big price line. An on-request tier's price is not published. A
// pay-what-you-want tier's price is its minimum; at 0 it's simply free.
const priceLabel = (tier: TicketType): string => {
    if (tier.price_kind === 'request') return t('tickets.price_on_request')
    if (tier.price_cents === 0) return t('tickets.free')
    const amount = formatMoney(tier.price_cents, tier.currency, locale)
    return tier.price_kind === 'variable' ? t('tickets.price_from', { price: amount }) : amount
}

// Public tiers only; the amount leaves the server as a label, never a number.
export const toPublicTiers = (items: TicketType[]): Tier[] =>
    items
        .filter((tier) => tier.visibility === 'public')
        .map((tier) => ({
            hash: tier.hash,
            name: tier.name,
            description: tier.description,
            priceLabel: priceLabel(tier),
            sold_out: tier.sold_out,
            spots_left: tier.spots_left,
        }))

// A post's date is a calendar day (midnight UTC from the front matter), so it
// is formatted in UTC — in any other zone it could land a day early.
const newsDate = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' })

export const toNewsTeaser = (post: ContentEntry<'news'>): NewsTeaser => ({
    id: post.id,
    title: post.data.title,
    dateLabel: newsDate.format(post.data.date),
    description: post.data.description ?? null,
})

// ── Agenda ───────────────────────────────────────────────────────────────

type SlotWithSpeakers = AgendaSlot & { speakers: { name: string | null }[] }

const speakerNames = (speakers: { name: string | null }[]): string =>
    speakers
        .map((speaker) => speaker.name)
        .filter(Boolean)
        .join(', ')

const toAgendaEntry = (slot: SlotWithSpeakers, timezone: string): AgendaEntry => ({
    hash: slot.hash,
    title: slot.title,
    time: formatTimeRange(slot.starts_at, slot.ends_at, timezone, locale),
    location: slot.location,
    speakers: speakerNames(slot.speakers),
    path: sessionPath(slot),
})

const roomsOf = (slots: AgendaSlot[]): string[] =>
    groupByLocation(slots.filter((slot) => slot.location !== null)).map((room) => room.location as string)

const SLOT_MIN = 15

// One conference day as a time-proportional grid: rows are 15-minute slots,
// columns are rooms, sessions span their real duration — so parallel talks
// align vertically by actual time, and room-less items (breaks, lunch, the
// social) render as full-width bands INSIDE every track's flow.
const toDayGrid = (slots: SlotWithSpeakers[], timezone: string): DayGrid => {
    const rooms = roomsOf(slots)
    const columnOf = new Map(rooms.map((name, index) => [name, index]))

    // Wall-clock minutes in the event timezone; a session ending at midnight
    // reads as 24:00, not 0:00.
    const startMin = (slot: AgendaSlot) => minutesOfDay(slot.starts_at, timezone)
    const endMin = (slot: AgendaSlot) => {
        const end = minutesOfDay(slot.ends_at, timezone)
        return end <= startMin(slot) ? 24 * 60 : end
    }

    // Start the grid AT the first session (snapped to a slot) — snapping to the
    // whole hour left empty lead rows above the first card. Header row is row 1.
    const dayStart = Math.floor(Math.min(...slots.map(startMin)) / SLOT_MIN) * SLOT_MIN
    const dayEnd = Math.ceil(Math.max(...slots.map(endMin)) / SLOT_MIN) * SLOT_MIN
    const rowOf = (minutes: number) => 2 + Math.round((minutes - dayStart) / SLOT_MIN)

    // A mark at the (possibly half-hour) day start, then every full hour.
    // Through Intl, not a hand-rolled HH:MM — the gutter has to agree with the
    // session cards beside it, and locales disagree on the separator (fi: 09.30).
    const marks: number[] = [dayStart]
    for (let minutes = Math.floor(dayStart / 60) * 60 + 60; minutes < dayEnd; minutes += 60) {
        if (minutes > dayStart) marks.push(minutes)
    }

    return {
        rooms,
        marks: marks.map((minutes) => ({ label: formatMinutesOfDay(minutes, locale), row: rowOf(minutes) })),
        placed: slots.map((slot) => ({
            ...toAgendaEntry(slot, timezone),
            column: slot.location === null ? null : (columnOf.get(slot.location) ?? null),
            rowStart: rowOf(Math.floor(startMin(slot) / SLOT_MIN) * SLOT_MIN),
            rowEnd: Math.max(rowOf(Math.ceil(endMin(slot) / SLOT_MIN) * SLOT_MIN), rowOf(startMin(slot)) + 1),
        })),
    }
}

export const toAgendaPage = (event: EventDetail, slots: SlotWithSpeakers[]): AgendaPage => ({
    timezone: event.timezone,
    eventStartsAt: event.starts_at,
    rooms: roomsOf(slots),
    days: groupByDay(slots, event.timezone).map((day) => ({
        key: day.day,
        heading: formatDayHeading(day.slots[0].starts_at, event.timezone, locale),
        entries: day.slots.map((slot) => toAgendaEntry(slot, event.timezone)),
        grid: roomsOf(day.slots).length > 1 ? toDayGrid(day.slots, event.timezone) : null,
    })),
})

// "Tuesday, November 3 · 09:00 – 10:00 · Main Hall"
export const sessionWhen = (slot: AgendaSlot, timezone: string): string =>
    [
        formatDayHeading(slot.starts_at, timezone, locale),
        formatTimeRange(slot.starts_at, slot.ends_at, timezone, locale),
        slot.location,
    ]
        .filter(Boolean)
        .join(' · ')
