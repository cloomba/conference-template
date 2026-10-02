// The shapes pages receive from the server functions — the API's objects cut
// down to what a page renders, with every date, time and price ALREADY
// FORMATTED. Picking keeps the page data small and keeps anything the
// template never displays out of the browser.
//
// Why formatted on the server: each browser engine ships its own Intl data,
// and it differs from Node's in invisible ways (Chrome 148 puts plain spaces
// around the dash in "November 3 – 4", Node's ICU 78 thin ones). A string
// formatted twice would fail hydration; formatted once, it can't.

import type { Location } from '@cloomba/client'

import type { SocialIconLink } from './site'

export interface EventSummary {
    title: string
    // "November 3 – 4, 2026"
    dates: string
    // "Bratislava, SK" — empty when the event has no city.
    place: string
    location: Location
    cover_url: string | null
}

// One agenda row: a session with its time already formatted.
export interface SessionLine {
    hash: string
    title: string
    // "09:00 – 10:00", in the event's timezone.
    time: string
    location: string | null
    path: string
}

export interface AgendaPreviewData {
    // "Tuesday, November 3" — the first day's heading.
    dayHeading: string
    dayCount: number
    sessions: SessionLine[]
}

export interface StatsData {
    speakers: number
    // Sessions with a room — breaks without one don't count as talks.
    talks: number
    sponsors: number
    days: number
    confirmedGuests: number
}

export interface Person {
    hash: string
    name: string | null
    headline: string | null
    image_url: string | null
    path: string
}

export interface Host {
    hash: string
    name: string | null
    headline: string | null
    image_url: string | null
    bio: string | null
    link: SocialIconLink | null
}

export interface Sponsor {
    hash: string
    name: string | null
    // Already in display order; tiers in SPONSOR_TIER_ORDER.
    tier: string
    link: string | null
    image_url: string | null
}

export interface SponsorTierGroup {
    tier: string
    sponsors: Sponsor[]
}

// A public tier as the page may show it. The price is a finished label; an
// on-request tier's amount never leaves the server (the API still hands it to
// the organizer's key).
export interface Tier {
    hash: string
    name: string
    description: string | null
    priceLabel: string
    sold_out: boolean
    spots_left: number | null
}

export interface ContentBlock<D> {
    id: string
    data: D
    html: string
}

export interface NewsTeaser {
    id: string
    title: string
    // "August 20, 2026"
    dateLabel: string
    description: string | null
}

// ── Agenda ───────────────────────────────────────────────────────────────

// One agenda entry, ready to render. `location` null = a room-less item
// (break, lunch, the social) that renders as a band, not a link.
export interface AgendaEntry {
    hash: string
    title: string
    time: string
    location: string | null
    // Speaker names, comma-joined; empty when nobody is on stage.
    speakers: string
    path: string
}

// One day as a time-proportional grid: CSS grid rows are 15-minute slots,
// columns are rooms (column 0 is the time gutter). Computed on the server;
// the component only places what it is given.
export interface DayGrid {
    rooms: string[]
    // Hour marks in the gutter: the label and the grid row it sits on.
    marks: { label: string; row: number }[]
    placed: (AgendaEntry & { column: number | null; rowStart: number; rowEnd: number })[]
}

export interface AgendaDay {
    // YYYY-MM-DD in the event timezone — the day's anchor id.
    key: string
    heading: string
    // Chronological, for the single-room list and the small-screen list.
    entries: AgendaEntry[]
    // Present when the day runs more than one room.
    grid: DayGrid | null
}

export interface AgendaPage {
    timezone: string
    eventStartsAt: string
    // Every room across the event, for the CSS-only stage filter.
    rooms: string[]
    days: AgendaDay[]
}

// ── Detail pages ─────────────────────────────────────────────────────────

export interface SessionPage {
    title: string
    // "Tuesday, November 3 · 09:00 – 10:00 · Main Hall"
    when: string
    speakers: Person[]
    descriptionHtml: string | null
    // Finished application/ld+json text (server/jsonld.ts jsonLdText).
    jsonLd: string
}

export interface SpeakerSession {
    hash: string
    title: string
    when: string
    path: string
}

export interface SpeakerPage {
    name: string | null
    headline: string | null
    image_url: string | null
    link: SocialIconLink | null
    bioHtml: string | null
    sessions: SpeakerSession[]
    // Finished application/ld+json text (server/jsonld.ts jsonLdText).
    jsonLd: string
}

export interface MarkdownPage {
    title: string
    description: string | null
    html: string
}

export interface NewsPost extends MarkdownPage {
    dateLabel: string
}
