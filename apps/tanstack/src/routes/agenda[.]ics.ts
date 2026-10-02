import { createFileRoute } from '@tanstack/react-router'

import { agendaIcs } from '@/server/files'

export const Route = createFileRoute('/agenda.ics')({
    server: {
        handlers: {
            GET: async () =>
                new Response(await agendaIcs(), { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } }),
        },
    },
})
