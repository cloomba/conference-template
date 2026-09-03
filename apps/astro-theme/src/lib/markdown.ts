// Markdown → HTML for API-sourced text (event description, session/speaker
// bios). Content collections render their own markdown; this is only for
// strings that arrive over the wire from the organizer's own event.

import { marked } from 'marked'

export const renderMarkdown = (source: string | null | undefined): string =>
    source ? (marked.parse(source, { async: false }) as string) : ''

const ENTITIES: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
}

// Same text with the markup taken back out — for meta descriptions and JSON-LD,
// which want a plain sentence rather than HTML. Rendering first (instead of
// pattern-stripping the markdown) keeps links and emphasis from leaving syntax
// behind.
export const plainText = (source: string | null | undefined, limit = 500): string | undefined => {
    if (!source) return undefined
    const text = renderMarkdown(source)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&[a-z#0-9]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity)
        .replace(/\s+/g, ' ')
        .trim()
    if (!text) return undefined
    return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text
}
