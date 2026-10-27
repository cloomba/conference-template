import { describe, expect, it } from 'vitest'

import { extractLocaleOrAll, extractLocaleOrFirst, splitLocaleSections } from '../src/locale-sections'

const preamble = 'Fauna Forum\nTwo days of talks, workshops, and the Evening Howl'

const sectioned = [preamble, '', '# uk', 'Один водопій — усі види.', '', '# sk', 'Jedno napájadlo, všetky druhy.'].join(
    '\n'
)

describe('splitLocaleSections', () => {
    it('splits a preamble and one section per language', () => {
        expect(splitLocaleSections(sectioned)).toEqual({
            preamble,
            sections: [
                { locale: 'uk', body: 'Один водопій — усі види.' },
                { locale: 'sk', body: 'Jedno napájadlo, všetky druhy.' },
            ],
        })
    })

    it('leaves ordinary text alone: one section, unknown codes, deeper headings, fenced examples', () => {
        expect(splitLocaleSections('Intro\n# uk\nТекст')).toBeNull()
        expect(splitLocaleSections('# AI\nx\n# ML\ny')).toBeNull()
        expect(splitLocaleSections('## uk\nx\n## sk\ny')).toBeNull()
        expect(splitLocaleSections('```\n# uk\nx\n# sk\ny\n```')).toBeNull()
    })
})

describe('extractLocaleOrAll', () => {
    it("shows the preamble plus the site's language", () => {
        expect(extractLocaleOrAll(sectioned, 'sk')).toBe(`${preamble}\n\nJedno napájadlo, všetky druhy.`)
    })

    it('shows the whole body when neither the language nor English is there', () => {
        expect(extractLocaleOrAll(sectioned, 'de')).toBe(sectioned)
    })

    it('returns an unsectioned body as it is', () => {
        expect(extractLocaleOrAll('Just text', 'uk')).toBe('Just text')
    })
})

describe('extractLocaleOrFirst', () => {
    it('never returns more than one language', () => {
        expect(extractLocaleOrFirst(sectioned, 'de')).toBe(`${preamble}\n\nОдин водопій — усі види.`)
    })
})
