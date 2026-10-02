// Markdown → HTML. SERVER-ONLY: pages receive finished HTML, so neither
// marked nor its extensions ever ship to the browser.
//
// Two renderers on purpose:
// - renderMarkdown — API-sourced text (event description, session/speaker
//   bios): the organizer's own words, rendered plainly.
// - renderContent — the site's own markdown under src/content/: curly quotes
//   and dashes (smartypants) and an id on every heading, so a section can be
//   linked to (/travel#getting-there).

import { Marked, marked, type Tokens } from 'marked'
import { markedSmartypants } from 'marked-smartypants'

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

const stripTags = (html: string): string =>
    html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity)

// Same text with the markup taken back out — for meta descriptions and JSON-LD,
// which want a plain sentence rather than HTML. Rendering first (instead of
// pattern-stripping the markdown) keeps links and emphasis from leaving syntax
// behind.
export const plainText = (source: string | null | undefined, limit = 500): string | undefined => {
    if (!source) return undefined
    const text = stripTags(renderMarkdown(source)).replace(/\s+/g, ' ').trim()
    if (!text) return undefined
    return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text
}

// GitHub-style heading ids: lower-case, punctuation dropped, each space a
// hyphen ("Visas & paperwork" → "visas--paperwork"), and a -1, -2 … suffix
// when a heading text repeats within one document.
const headingIds = () => {
    const seen = new Map<string, number>()
    return (text: string): string => {
        const base = text
            .toLowerCase()
            .trim()
            .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '')
            .replace(/ /g, '-')
        const count = seen.get(base)
        seen.set(base, (count ?? -1) + 1)
        return count === undefined ? base : `${base}-${count + 1}`
    }
}

export const renderContent = (source: string): string => {
    const idFor = headingIds()
    const content = new Marked(markedSmartypants(), {
        renderer: {
            heading({ tokens, depth }: Tokens.Heading) {
                const inner = this.parser.parseInline(tokens)
                return `<h${depth} id="${idFor(stripTags(inner))}">${inner}</h${depth}>\n`
            },
        },
    })
    return content.parse(source, { async: false }) as string
}
