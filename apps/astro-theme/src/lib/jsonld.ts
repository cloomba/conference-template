// schema.org Event nodes, shared by the home page and every session page.
//
// Two rules drive the shape here, both learned from Search Console:
//
// 1. `location` is REQUIRED on every Event — including the `superEvent` node
//    nested inside a session. A node without one is dropped from event rich
//    results ("Missing field 'location'").
// 2. A Place with only a `name` does not count. Google needs `address`, so a
//    room/track name renders as a Place carrying the VENUE's address rather
//    than as a bare name ("Missing field 'address' (in 'location')").
//
// Everything else the crawler asks for (description, image, offers, organizer,
// eventStatus, endDate, performer) is filled from the same event payload, so a
// session page carries the conference's context instead of a bare stub.

import type { EventDetail, Featured, Location, TicketType } from '@cloomba/client'

import { config } from './config'

export const absoluteUrl = (path: string): string =>
    config.site.url ? new URL(path, config.site.url).toString() : path

const attendanceMode = (format: EventDetail['format']): string =>
    format === 'online'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : format === 'hybrid'
          ? 'https://schema.org/MixedEventAttendanceMode'
          : 'https://schema.org/OfflineEventAttendanceMode'

const eventStatus = (status: EventDetail['status']): string =>
    status === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled'

// `room` is the session's free-text room/track/stage. It qualifies the venue
// name; the address always comes from the event itself.
const placeNode = (venue: Location, room?: string | null) => {
    const hasParts = Boolean(venue.address || venue.city || venue.country)
    if (!hasParts && !venue.name) return undefined
    return {
        '@type': 'Place',
        name: [room, venue.name].filter(Boolean).join(' · ') || undefined,
        // A PostalAddress when the venue has any structured part, otherwise the
        // venue name as free text — schema.org allows both, and a text address
        // still validates where an absent one does not.
        address: hasParts
            ? {
                  '@type': 'PostalAddress',
                  streetAddress: venue.address ?? undefined,
                  addressLocality: venue.city ?? undefined,
                  addressCountry: venue.country ?? undefined,
              }
            : venue.name,
        ...(venue.lat != null && venue.lng != null
            ? { geo: { '@type': 'GeoCoordinates', latitude: venue.lat, longitude: venue.lng } }
            : {}),
    }
}

// Place, VirtualLocation, or both (hybrid) — the shape Google documents.
export const locationNode = (event: EventDetail, room?: string | null) => {
    const place = event.format === 'online' ? undefined : placeNode(event.location, room)
    const virtual =
        event.format !== 'in_person' && event.online_url
            ? { '@type': 'VirtualLocation', url: event.online_url }
            : undefined
    const nodes = [place, virtual].filter(Boolean)
    if (nodes.length === 0) return undefined
    return nodes.length === 1 ? nodes[0] : nodes
}

const performerNodes = (speakers: Pick<Featured, 'name'>[]) => {
    const named = speakers.filter((speaker) => speaker.name)
    // Omitted rather than empty: a break or a lunch slot genuinely has nobody
    // on stage, and `performer: []` reads as malformed.
    if (named.length === 0) return undefined
    return named.map((speaker) => ({ '@type': 'Person', name: speaker.name }))
}

// The event cover, falling back to the site's share image so that a fork with
// no cover uploaded still ships an image with its rich result.
const imageUrl = (event: EventDetail): string | undefined =>
    event.cover_url ?? (config.site.og_image ? absoluteUrl(config.site.og_image) : undefined)

export const organizerNode = () => ({
    '@type': 'Organization',
    name: config.site.name,
    url: config.site.url ?? 'https://cloomba.com',
})

export const offerNodes = (ticketTypes: TicketType[]) =>
    ticketTypes
        .filter((tier) => tier.visibility === 'public')
        .map((tier) => ({
            '@type': 'Offer',
            name: tier.name,
            price: (tier.price_cents / 100).toFixed(2),
            priceCurrency: tier.currency,
            availability: tier.sold_out ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
            url: absoluteUrl('/tickets'),
        }))

interface ConferenceInput {
    event: EventDetail
    speakers: Pick<Featured, 'name'>[]
    ticketTypes: TicketType[]
    description?: string
}

// The conference itself. Rendered standalone on the home page and reused as
// the `superEvent` of every session, so both carry the same complete node.
export const conferenceEventNode = ({ event, speakers, ticketTypes, description }: ConferenceInput) => {
    const offers = offerNodes(ticketTypes)
    return {
        '@type': 'Event',
        name: event.title,
        url: config.site.url ? absoluteUrl('/') : undefined,
        description: config.site.description ?? description ?? undefined,
        startDate: event.starts_at,
        endDate: event.ends_at ?? undefined,
        eventAttendanceMode: attendanceMode(event.format),
        eventStatus: eventStatus(event.status),
        image: imageUrl(event),
        location: locationNode(event),
        performer: performerNodes(speakers),
        organizer: organizerNode(),
        offers: offers.length > 0 ? offers : undefined,
    }
}

interface SessionInput {
    event: EventDetail
    session: {
        title: string
        description?: string | null
        location: string | null
        starts_at: Date
        ends_at: Date
        speakers: Pick<Featured, 'name'>[]
    }
    path: string
    speakers: Pick<Featured, 'name'>[]
    ticketTypes: TicketType[]
    description?: string
}

// One talk, nested under the conference.
export const sessionEventNode = ({ event, session, path, speakers, ticketTypes, description }: SessionInput) => {
    const offers = offerNodes(ticketTypes)
    return {
        '@type': 'Event',
        name: session.title,
        url: config.site.url ? absoluteUrl(path) : undefined,
        description: description ?? config.site.description ?? undefined,
        startDate: session.starts_at.toISOString(),
        endDate: session.ends_at.toISOString(),
        eventAttendanceMode: attendanceMode(event.format),
        eventStatus: eventStatus(event.status),
        image: imageUrl(event),
        location: locationNode(event, session.location),
        performer: performerNodes(session.speakers),
        organizer: organizerNode(),
        offers: offers.length > 0 ? offers : undefined,
        superEvent: conferenceEventNode({ event, speakers, ticketTypes }),
    }
}
