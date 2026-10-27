// Organizer-written multi-language descriptions. A Cloomba event description
// may carry a shared preamble followed by one section per language, each
// delimited by a `#` heading whose entire text is a language code:
//
//     # Postgres evening
//
//     Doors 18:00 · Bratislava · free
//
//     # en
//     Join us for an evening of Postgres talks.
//     # sk
//     Príďte na večer prednášok o Postgrese.
//
// Everything before the first language heading is the PREAMBLE and is shown in
// every language. The API returns the description raw; each client picks its
// own section. A port of Cloomba web's `src/lib/localeSections.ts` — the same
// grammar, so a description reads the same on cloomba.com and on the site.

import { CLOOMBA_LOCALES } from './languages'

const LOCALE_HEADING = /^#[ \t]+([A-Za-z]{2})[ \t]*$/

// A fenced code block opener/closer. Lines inside a fence are never headings,
// so a body that documents this grammar in a ``` block doesn't section itself.
// An unclosed fence swallows the rest of the body — the safe direction, toward
// "not sectioned → raw body".
const FENCE = /^[ \t]{0,3}(```|~~~)/

const isLocaleCode = (code: string): boolean => (CLOOMBA_LOCALES as readonly string[]).includes(code.toLowerCase())

export interface LocaleSection {
    locale: string
    body: string
}

export interface LocaleDocument {
    preamble: string
    sections: LocaleSection[]
}

// Split a body into a shared preamble plus language sections, or `null` when
// it isn't a sectioned document. Two rules keep the grammar from eating
// ordinary descriptions:
//
//   1. `#` level only, with a supported language code as the entire heading.
//      `## Agenda`, `# ENG`, `# en extra` and `# AI` never delimit.
//   2. At least two sections. A lone `# en` is not a translated document.
//
// Both fail toward `null` — toward showing the author's text as-is.
export const splitLocaleSections = (raw: string): LocaleDocument | null => {
    const preamble: string[] = []
    const sections: LocaleSection[] = []
    let locale = ''
    let body: string[] = []
    const flush = () => sections.push({ locale, body: body.join('\n').trim() })

    let inFence = false

    for (const line of raw.split('\n')) {
        const text = line.trimEnd()
        if (FENCE.test(text)) inFence = !inFence
        const match = inFence ? null : LOCALE_HEADING.exec(text)
        // A heading whose code isn't a supported language is ordinary content.
        const code = match && isLocaleCode(match[1]) ? match[1].toLowerCase() : null
        if (code) {
            if (locale) flush()
            locale = code
            body = []
        } else if (locale) {
            body.push(line)
        } else {
            preamble.push(line)
        }
    }
    if (locale) flush()

    if (sections.length < 2) return null
    return { preamble: preamble.join('\n').trim(), sections }
}

// Re-join the shared preamble with one language's body.
const withPreamble = (preamble: string, body: string): string =>
    preamble && body ? `${preamble}\n\n${body}` : preamble || body

// Reading surfaces (the About page and its home teaser): the preamble plus the
// site's language, else English, else the WHOLE body with its headings — a
// reader is better served by every language than by one picked silently.
export const extractLocaleOrAll = (raw: string, language: string): string => {
    const doc = splitLocaleSections(raw)
    if (!doc) return raw
    const want = language.toLowerCase()
    const hit = doc.sections.find((s) => s.locale === want) ?? doc.sections.find((s) => s.locale === 'en')
    return hit ? withPreamble(doc.preamble, hit.body) : raw
}

// Plain-text surfaces nobody can re-parse (meta description, JSON-LD): never
// more than one language — the site's, else English, else the first section.
export const extractLocaleOrFirst = (raw: string, language: string): string => {
    const doc = splitLocaleSections(raw)
    if (!doc) return raw
    const want = language.toLowerCase()
    const hit =
        doc.sections.find((s) => s.locale === want) ?? doc.sections.find((s) => s.locale === 'en') ?? doc.sections[0]
    return withPreamble(doc.preamble, hit.body)
}
