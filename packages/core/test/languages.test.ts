import { describe, expect, it } from 'vitest'

import { baseLanguage, fontSubsetsFor, languageLinks } from '../src/languages'

const builds = [
    { language: 'uk', label: 'UA', url: 'https://uk.example.com' },
    { language: 'sk', label: 'SK', url: 'https://sk.example.com/' },
]

describe('baseLanguage', () => {
    it('keeps only the language subtag', () => {
        expect(baseLanguage('uk-UA')).toBe('uk')
        expect(baseLanguage('sk')).toBe('sk')
    })
})

describe('fontSubsetsFor', () => {
    it("picks the language's script, Latin always alongside", () => {
        expect(fontSubsetsFor('en')).toEqual(['latin'])
        expect(fontSubsetsFor('sk')).toEqual(['latin', 'latin-ext'])
        expect(fontSubsetsFor('uk-UA')).toEqual(['cyrillic', 'latin'])
        expect(fontSubsetsFor('el')).toEqual(['greek', 'latin'])
    })
})

describe('languageLinks', () => {
    it('links the same path on every build and marks this one', () => {
        expect(languageLinks(builds, 'sk', '/agenda/')).toEqual([
            { language: 'uk', label: 'UA', href: 'https://uk.example.com/agenda/', current: false, isDefault: true },
            { language: 'sk', label: 'SK', href: 'https://sk.example.com/agenda/', current: true, isDefault: false },
        ])
    })

    it('matches this build by base language', () => {
        expect(languageLinks(builds, 'uk-UA', '/').map((link) => link.current)).toEqual([true, false])
    })

    it('is empty for a one-language site', () => {
        expect(languageLinks([], 'en', '/')).toEqual([])
    })
})
