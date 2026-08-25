// Build-time iCal export of the full agenda — linked from the agenda page.

import { buildAgendaIcs } from '@cloomba/core'
import type { APIRoute } from 'astro'

import { config } from '@/lib/config'
import { loadSessions } from '@/lib/data'

export const GET: APIRoute = async () => {
    const sessions = await loadSessions()
    const ics = buildAgendaIcs({
        title: config.site.name,
        uidDomain: config.site.url ? new URL(config.site.url).hostname : config.event.slug,
        sessions,
        generatedAt: new Date(),
        url: config.site.url,
    })
    return new Response(ics, {
        headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
    })
}
