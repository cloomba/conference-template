// @cloomba/client — a thin typed client for the Cloomba public API.
//
// All shapes come from src/schema.d.ts, GENERATED from the live OpenAPI spec
// (`yarn generate`) — this file only adds transport: URL building, the bearer
// header, query serialization, and typed errors. Framework-free by contract;
// `fetch` is injectable so the same client runs in Node builds, CI, edge
// runtimes, and tests.

import type { components, operations } from './schema'

export type Event = components['schemas']['Event']
export type EventDetail = components['schemas']['EventDetail']
export type EventList = components['schemas']['EventList']
export type Attendee = components['schemas']['Attendee']
export type AttendeeList = components['schemas']['AttendeeList']
export type Featured = components['schemas']['Featured']
export type FeaturedList = components['schemas']['FeaturedList']
export type FeaturedFile = components['schemas']['FeaturedFile']
export type Session = components['schemas']['Session']
export type SessionList = components['schemas']['SessionList']
export type SessionSpeaker = components['schemas']['SessionSpeaker']
export type MediaItem = components['schemas']['MediaItem']
export type MediaList = components['schemas']['MediaList']
export type TicketType = components['schemas']['TicketType']
export type TicketTypeList = components['schemas']['TicketTypeList']
export type CheckInResult = components['schemas']['CheckInResult']
export type Location = components['schemas']['Location']
export type ApiErrorBody = components['schemas']['Error']

export type EventStatus = components['schemas']['EventStatus']
export type EventVisibility = components['schemas']['EventVisibility']
export type EventFormat = components['schemas']['EventFormat']
export type FeaturedKind = components['schemas']['FeaturedKind']
export type SponsorTier = components['schemas']['SponsorTier']
export type MediaKind = components['schemas']['MediaKind']

// Query params, straight from the generated operations — adding a filter to
// the API makes it appear here on the next `yarn generate`.
type Query<Op extends keyof operations> = NonNullable<operations[Op]['parameters']['query']>

export const DEFAULT_BASE_URL = 'https://api.cloomba.com/public/v1'

// Every non-2xx response. `code` is the stable contract — branch on it, never
// on `message` (see the API docs). Responses without a JSON body (proxies,
// network middleboxes) surface as code `http_error`.
export class CloombaApiError extends Error {
    readonly status: number
    readonly code: string
    readonly details?: unknown

    constructor(status: number, body: Partial<ApiErrorBody> | undefined) {
        super(body?.message ?? `Cloomba API request failed with HTTP ${status}`)
        this.name = 'CloombaApiError'
        this.status = status
        this.code = body?.code ?? 'http_error'
        this.details = body?.details
    }
}

export interface CloombaClientOptions {
    /** A read (or read_write) key from cloomba.com/me/developers. */
    apiKey: string
    /** Override for tests / staging. Default: the production public API. */
    baseUrl?: string
    /** Injectable fetch — defaults to the runtime global. */
    fetch?: typeof globalThis.fetch
}

const buildUrl = (baseUrl: string, path: string, query?: Record<string, unknown>): string => {
    const url = new URL(baseUrl + path)
    for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
    }
    return url.toString()
}

export const createClient = (options: CloombaClientOptions) => {
    const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
    const doFetch = options.fetch ?? globalThis.fetch

    const request = async <T>(path: string, query?: Record<string, unknown>, init?: RequestInit): Promise<T> => {
        const response = await doFetch(buildUrl(baseUrl, path, query), {
            ...init,
            headers: {
                Authorization: `Bearer ${options.apiKey}`,
                ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
                ...init?.headers,
            },
        })
        if (!response.ok) {
            let body: Partial<ApiErrorBody> | undefined
            try {
                body = (await response.json()) as Partial<ApiErrorBody>
            } catch {
                body = undefined
            }
            throw new CloombaApiError(response.status, body)
        }
        return (await response.json()) as T
    }

    const slugPath = (slug: string, rest = '') => `/events/${encodeURIComponent(slug)}${rest}`

    return {
        /** Your events, newest start date first. */
        listEvents: (query?: Query<'listEvents'>) => request<EventList>('/events', query),
        /** One event with guest counts, capacity, and registration questions. */
        getEvent: (slug: string) => request<EventDetail>(slugPath(slug)),
        /** The registration list with consented contact data and answers. */
        listAttendees: (slug: string, query?: Query<'listAttendees'>) =>
            request<AttendeeList>(slugPath(slug, '/attendees'), query),
        /** Look up one registration by its token. */
        getAttendee: (slug: string, qrToken: string) =>
            request<Attendee>(slugPath(slug, `/attendees/${encodeURIComponent(qrToken)}`)),
        /** Speakers, sponsors, hosts — optionally narrowed by kind. */
        listFeatured: (slug: string, query?: Query<'listFeatured'>) =>
            request<FeaturedList>(slugPath(slug, '/featured'), query),
        /** The agenda in running order, speakers nested on each session. */
        listSessions: (slug: string) => request<SessionList>(slugPath(slug, '/sessions')),
        /** Wall photos and videos — optionally narrowed by kind. */
        listMedia: (slug: string, query?: Query<'listMedia'>) => request<MediaList>(slugPath(slug, '/media'), query),
        /** Ticket tiers with prices and seats left. */
        listTicketTypes: (slug: string) => request<TicketTypeList>(slugPath(slug, '/ticket-types')),
        /** Check a guest in (requires Pro + a read_write key). */
        checkIn: (slug: string, qrToken: string) =>
            request<CheckInResult>(slugPath(slug, '/check-in'), undefined, {
                method: 'POST',
                body: JSON.stringify({ qr_token: qrToken }),
            }),
    }
}

export type CloombaClient = ReturnType<typeof createClient>
