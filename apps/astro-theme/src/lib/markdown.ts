// Markdown → HTML for API-sourced text (event description, session/speaker
// bios). Content collections render their own markdown; this is only for
// strings that arrive over the wire from the organizer's own event.

import { marked } from 'marked'

export const renderMarkdown = (source: string | null | undefined): string =>
    source ? (marked.parse(source, { async: false }) as string) : ''
