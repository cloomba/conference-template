// Key-authed reads. SERVER-ONLY — called from server-function handlers.
//
// Every read is cached for TTL_MS. A static build fetches each endpoint once
// (the build is shorter than the TTL); a server deployment fetches each
// endpoint at most once a minute per instance, however busy the site gets —
// the public API allows 60 requests a minute per key, and a page needs up to
// four of them.

import { createClient } from '@cloomba/client'
import { toAgendaSlots } from '@cloomba/core'

import { config } from './config'
import { apiBaseUrl, apiKey, usingDemoKey } from './env'

const TTL_MS = 60_000

// Not an error — this is the intended first-run path. It says so once so that
// nobody ships a real conference on the shared key by accident.
if (usingDemoKey) {
    console.warn(
        '[cloomba] Running with the shared demo key against the demo event. ' +
            'Set CLOOMBA_API_KEY in .env (free, at https://cloomba.com/me/developers) and point `event.slug` at your own event.'
    )
}

const api = createClient({ apiKey, baseUrl: apiBaseUrl })

const cached = <T>(load: () => Promise<T>): (() => Promise<T>) => {
    let value: Promise<T> | undefined
    let loadedAt = 0
    return () => {
        if (!value || Date.now() - loadedAt > TTL_MS) {
            const pending = load()
            value = pending
            loadedAt = Date.now()
            // A failed read is not cached — the next request retries.
            pending.catch(() => {
                if (value === pending) value = undefined
            })
        }
        return value
    }
}

export const loadEvent = cached(() => api.getEvent(config.event.slug))
export const loadFeatured = cached(() => api.listFeatured(config.event.slug))
export const loadTicketTypes = cached(() => api.listTicketTypes(config.event.slug))
export const loadSessions = cached(async () => {
    const { items } = await api.listSessions(config.event.slug)
    return toAgendaSlots(items)
})

// Convenience slices over the featured list.
export const loadSpeakers = async () => (await loadFeatured()).items.filter((f) => f.kind === 'speaker')
export const loadSponsors = async () => (await loadFeatured()).items.filter((f) => f.kind === 'sponsor')
export const loadHosts = async () => (await loadFeatured()).items.filter((f) => f.kind === 'host')

// Whether call-for-papers / call-for-sponsors banners still make sense —
// they retire `calls_close_days_before` days before the event.
export const callsOpen = async (): Promise<boolean> => {
    const event = await loadEvent()
    const cutoff = new Date(event.starts_at).getTime() - config.calls_close_days_before * 86_400_000
    return Date.now() < cutoff
}
