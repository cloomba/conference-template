// Build-time data layer. Every page pulls from these memoized loaders, so
// each endpoint is fetched exactly once per build no matter how many pages
// render it. BUILD-TIME ONLY — this module reads the secret key from env and
// must never be imported from an island (see AGENTS.md).

import { createClient } from '@cloomba/client'
import { toAgendaSlots } from '@cloomba/core'

import { config } from './config'
import { apiBaseUrl } from './env'

const apiKey = import.meta.env.CLOOMBA_API_KEY as string | undefined
if (!apiKey) {
    throw new Error(
        'CLOOMBA_API_KEY is not set. Copy .env.example to .env and add a read-only key from https://cloomba.com/me/developers.'
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
