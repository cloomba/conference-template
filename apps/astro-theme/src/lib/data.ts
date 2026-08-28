// Build-time data layer. Every page pulls from these memoized loaders, so
// each endpoint is fetched exactly once per build no matter how many pages
// render it. BUILD-TIME ONLY — this module reads the secret key from env and
// must never be imported from an island (see AGENTS.md).
//
// With no key configured the build falls back to the shared demo key (env.ts),
// so a fresh clone renders without any setup at all.

import { createClient } from '@cloomba/client'
import { toAgendaSlots } from '@cloomba/core'

import { config } from './config'
import { apiBaseUrl, apiKey, usingDemoKey } from './env'

if (!apiKey) {
    throw new Error(
        'CLOOMBA_API_KEY is not set. Copy .env.example to .env and add a read-only key from https://cloomba.com/me/developers.'
    )
}

// Not an error — this is the intended first-run path. It says so once so that
// nobody ships a real conference on the shared key by accident.
if (usingDemoKey) {
    console.warn(
        '[cloomba] Building with the shared demo key against the demo event. ' +
            'Set CLOOMBA_API_KEY in .env (free, at https://cloomba.com/me/developers) and point `event.slug` at your own event.'
    )
}

const api = createClient({ apiKey, baseUrl: apiBaseUrl })

const memo = <T>(load: () => Promise<T>): (() => Promise<T>) => {
    let cached: Promise<T> | undefined
    return () => (cached ??= load())
}

export const loadEvent = memo(() => api.getEvent(config.event.slug))
export const loadFeatured = memo(() => api.listFeatured(config.event.slug))
export const loadTicketTypes = memo(() => api.listTicketTypes(config.event.slug))
export const loadSessions = memo(async () => {
    const { items } = await api.listSessions(config.event.slug)
    return toAgendaSlots(items)
})

// Convenience slices over the featured list.
export const loadSpeakers = async () => (await loadFeatured()).items.filter((f) => f.kind === 'speaker')
export const loadSponsors = async () => (await loadFeatured()).items.filter((f) => f.kind === 'sponsor')

// Whether call-for-papers / call-for-sponsors banners still make sense —
// they retire `calls_close_days_before` days before the event. Build-time.
export const callsOpen = async (): Promise<boolean> => {
    const event = await loadEvent()
    const cutoff = new Date(event.starts_at).getTime() - config.calls_close_days_before * 86_400_000
    return Date.now() < cutoff
}
