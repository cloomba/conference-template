import { afterEach, describe, expect, it, vi } from 'vitest'

import { parseSiteConfig } from '../src/config'
import { formatDateSpan, formatMinutesOfDay, normalizeLocale } from '../src/format'
import { resolveStrings, translate, translatePlural } from '../src/strings'

const minimal = { site: { name: 'DemoConf' }, event: { slug: 'demo-conf' } }

// A stand-in for a theme's strings.en.json: one plain key, one with a
// placeholder, and one plural family. Core owns the machinery, not the words,
// so the real table is the theme's business.
const EN = {
    'nav.sponsors': 'Sponsors',
    'nav.speakers': 'Speakers',
    'about.page_title': 'About {site}',
    'stats.days.one': 'Day',
    'stats.days.other': 'Days',
}

const silenceWarnings = () => vi.spyOn(console, 'warn').mockImplementation(() => {})

afterEach(() => vi.restoreAllMocks())

describe('resolveStrings', () => {
    it('returns the English table untouched when there are no overrides', () => {
        expect(resolveStrings(EN)).toEqual(EN)
    })

    it('overrides only the keys given, leaving the rest English', () => {
        const table = resolveStrings(EN, { 'nav.sponsors': 'Sponzori' })
        expect(table['nav.sponsors']).toBe('Sponzori')
        expect(table['nav.speakers']).toBe('Speakers')
    })

    // The governing rule: a wrong label on a working site beats a dead site.
    // Every one of these would be a crash if the string layer failed fast.
    describe('never throws — bad input warns and falls back to English', () => {
        it.each([
            ['an unknown key', { 'nav.sponsrs': 'Sponzori' }],
            ['a non-string value', { 'nav.sponsors': 42 }],
            ['a null value', { 'nav.sponsors': null }],
            ['a nested object', { 'nav.sponsors': { sk: 'Sponzori' } }],
            ['an empty string', { 'nav.sponsors': '' }],
            ['a whitespace-only string', { 'nav.sponsors': '   ' }],
        ])('%s is ignored', (_label, overrides) => {
            const warn = silenceWarnings()
            const table = resolveStrings(EN, overrides as Record<string, unknown>)
            expect(table['nav.sponsors']).toBe('Sponsors')
            expect(warn).toHaveBeenCalledOnce()
        })

        it('reports every bad entry in a single warning', () => {
            const warn = silenceWarnings()
            resolveStrings(EN, { 'nav.sponsrs': 'x', 'nav.speakrs': 'y', 'nav.sponsors': 1 })
            expect(warn).toHaveBeenCalledOnce()
            const message = warn.mock.calls[0][0] as string
            expect(message).toContain('nav.sponsrs')
            expect(message).toContain('nav.speakrs')
            expect(message).toContain('expected a string, got number')
        })

        it('keeps the good overrides from a mixed batch', () => {
            silenceWarnings()
            const table = resolveStrings(EN, { 'nav.sponsors': 'Sponzori', 'nav.bogus': 'x' })
            expect(table['nav.sponsors']).toBe('Sponzori')
        })
    })

    // English has no `.few`, so the key is absent from the table — and it must
    // still be accepted, or no Slovak site could spell its own plurals.
    it('accepts CLDR forms the English table does not have', () => {
        const warn = silenceWarnings()
        const table = resolveStrings(EN, { 'stats.days.few': 'dni', 'stats.days.many': 'dní' })
        expect(warn).not.toHaveBeenCalled()
        expect(table['stats.days.few']).toBe('dni')
    })

    it('still rejects a CLDR form on a key that is not a plural family', () => {
        const warn = silenceWarnings()
        resolveStrings(EN, { 'nav.sponsors.few': 'x' })
        expect(warn).toHaveBeenCalledOnce()
    })
})

describe('parseSiteConfig with strings', () => {
    it('defaults to an empty table', () => {
        expect(parseSiteConfig(minimal).strings).toEqual({})
    })

    // The whole point of the permissive z.unknown() record: one bad value in a
    // hand-written JSON file must not take the build down with it.
    it('does not throw on a malformed strings table', () => {
        expect(() => parseSiteConfig({ ...minimal, strings: { 'nav.about': 42, bogus: null } })).not.toThrow()
    })
})

describe('translate', () => {
    it('substitutes {name} placeholders', () => {
        expect(translate(EN, 'about.page_title', { site: 'DemoConf' })).toBe('About DemoConf')
    })

    it('leaves an unsupplied placeholder visible rather than blanking it', () => {
        expect(translate(EN, 'about.page_title')).toBe('About {site}')
    })

    it('falls back to the key name instead of rendering "undefined"', () => {
        expect(translate(EN, 'nav.missing')).toBe('nav.missing')
    })
})

describe('translatePlural', () => {
    it('picks the English one/other forms', () => {
        expect(translatePlural(EN, 'en', 'stats.days', 1)).toBe('Day')
        expect(translatePlural(EN, 'en', 'stats.days', 3)).toBe('Days')
    })

    it('uses a Slovak few form when the site supplies one', () => {
        silenceWarnings()
        const table = resolveStrings(EN, {
            'stats.days.one': 'deň',
            'stats.days.few': 'dni',
            'stats.days.other': 'dní',
        })
        expect(translatePlural(table, 'sk', 'stats.days', 1)).toBe('deň')
        expect(translatePlural(table, 'sk', 'stats.days', 3)).toBe('dni')
        expect(translatePlural(table, 'sk', 'stats.days', 8)).toBe('dní')
    })

    it('uses .many for Ukrainian, which Slovak never selects', () => {
        silenceWarnings()
        const table = resolveStrings(EN, { 'stats.days.few': 'дні', 'stats.days.many': 'днів' })
        expect(translatePlural(table, 'uk', 'stats.days', 3)).toBe('дні')
        expect(translatePlural(table, 'uk', 'stats.days', 8)).toBe('днів')
    })

    // The English table ships no .few, so a Slovak site that translated
    // nothing else must still render a word for counts 2-4.
    it('falls back to .other when the selected form is missing', () => {
        expect(translatePlural(EN, 'sk', 'stats.days', 3)).toBe('Days')
    })

    it('injects {count} without being asked', () => {
        expect(translatePlural({ 'x.one': '{count} day', 'x.other': 'All {count} days' }, 'en', 'x', 2)).toBe(
            'All 2 days'
        )
    })
})

describe('normalizeLocale', () => {
    it('canonicalizes a valid tag without warning', () => {
        const warn = silenceWarnings()
        expect(normalizeLocale('sk')).toBe('sk')
        expect(normalizeLocale('EN-us')).toBe('en-US')
        expect(warn).not.toHaveBeenCalled()
    })

    // Every Intl constructor throws RangeError on these — which took the whole
    // build with it, since site.language is a free-form string. The underscore
    // form is the realistic one: 'sk_SK' instead of 'sk-SK'.
    it.each(['sk_SK', 'en--us', 'e', '', '###', '12'])('falls back to en for the invalid tag %o', (tag) => {
        const warn = silenceWarnings()
        expect(normalizeLocale(tag)).toBe('en')
        expect(warn).toHaveBeenCalled()
    })

    // 4-8 letter language subtags are structurally legal, so these do NOT
    // throw — they silently format with root data, which deserves a warning
    // but not a substitution.
    it('warns about a structurally valid tag with no locale data', () => {
        const warn = silenceWarnings()
        expect(normalizeLocale('slovak')).toBe('slovak')
        expect(warn).toHaveBeenCalledOnce()
        expect(warn.mock.calls[0][0]).toContain('no locale data')
    })

    it('makes the Intl call sites safe', () => {
        silenceWarnings()
        const locale = normalizeLocale('sk_SK')
        expect(() => new Intl.PluralRules(locale)).not.toThrow()
        expect(() => new Intl.DateTimeFormat(locale)).not.toThrow()
        expect(() => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' })).not.toThrow()
    })
})

describe('formatMinutesOfDay', () => {
    it('renders a zero-padded wall-clock time', () => {
        expect(formatMinutesOfDay(9 * 60 + 30, 'en')).toBe('09:30')
        expect(formatMinutesOfDay(0, 'en')).toMatch(/^(00|24):00$/)
    })

    // The reason this exists: the agenda's hour gutter must agree with the
    // session cards beside it, and fi separates with a dot.
    it('follows the locale separator, unlike a hand-rolled HH:MM', () => {
        expect(formatMinutesOfDay(9 * 60 + 30, 'fi')).toBe('09.30')
    })
})

describe('formatDateSpan', () => {
    const TZ = 'Europe/Bratislava'
    const nov3 = new Date('2026-11-03T08:00:00Z')
    const nov4 = new Date('2026-11-04T17:00:00Z')

    // Intl separates a range with THIN SPACE (U+2009) around EN DASH (U+2013),
    // not the plain spaces the hand-rolled version used. Spelled out here so a
    // future failure is legible instead of two identical-looking strings.
    const SEP = ' – '

    it('collapses a same-day range to one date', () => {
        expect(formatDateSpan(nov3, new Date('2026-11-03T17:00:00Z'), TZ, 'en')).toBe('November 3, 2026')
    })

    it('spans months', () => {
        const span = formatDateSpan(new Date('2026-10-31T08:00:00Z'), new Date('2026-11-02T17:00:00Z'), TZ, 'en')
        expect(span).toBe(`October 31${SEP}November 2, 2026`)
    })

    // The regression this replaced: hand-rolled branches baked in English date
    // grammar (month-first, comma before year) and produced "3. novembra–4.,
    // 2026" for Slovak. Assert the month and year land on the correct side.
    it('follows the locale’s own range grammar, not English word order', () => {
        expect(formatDateSpan(nov3, nov4, TZ, 'sk')).toBe(`3.${SEP}4. 11. 2026`)
        expect(formatDateSpan(nov3, nov4, TZ, 'de')).toBe('3.–4. November 2026')
        expect(formatDateSpan(nov3, nov4, TZ, 'en')).toBe(`November 3${SEP}4, 2026`)
    })

    it('renders in the EVENT timezone, not the runner’s', () => {
        // 23:30 UTC on Nov 3 is already Nov 4 in Bratislava.
        expect(formatDateSpan(new Date('2026-11-03T23:30:00Z'), new Date('2026-11-03T23:45:00Z'), TZ, 'en')).toBe(
            'November 4, 2026'
        )
    })
})
