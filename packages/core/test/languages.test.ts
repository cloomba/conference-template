import { describe, expect, it } from 'vitest'

import { baseLanguage, languageLinks } from '../src/languages'

const builds = [
    { language: 'uk', label: 'UA', url: 'https://usbf.example.com' },
    { language: 'sk', label: 'SK', url: 'https://usbf-sk.example.com/' },
]

describe('baseLanguage', () => {
    it('keeps only the language subtag', () => {
        expect(baseLanguage('uk-UA')).toBe('uk')
        expect(baseLanguage('sk')).toBe('sk')
    })
})

describe('languageLinks', () => {
    it('links the same path on every build and marks this one', () => {
        expect(languageLinks(builds, 'sk', '/agenda/')).toEqual([
            { language: 'uk', label: 'UA', href: 'https://usbf.example.com/agenda/', current: false, isDefault: true },
            {
                language: 'sk',
                label: 'SK',
                href: 'https://usbf-sk.example.com/agenda/',
                current: true,
                isDefault: false,
            },
        ])
    })

    it('matches this build by base language', () => {
        expect(languageLinks(builds, 'uk-UA', '/').map((link) => link.current)).toEqual([true, false])
    })

    it('is empty for a one-language site', () => {
        expect(languageLinks([], 'en', '/')).toEqual([])
    })
})
