import { describe, expect, it } from 'vitest'

import { contentSchemas } from '../src/content'

describe('contentSchemas', () => {
    it('fills order and image_alt defaults', () => {
        expect(contentSchemas.pages.parse({ title: 'Travel' })).toEqual({ title: 'Travel', order: 0 })
        expect(contentSchemas.highlights.parse({ title: 'Workshops', image: '/w.jpg' })).toMatchObject({
            image_alt: '',
            order: 0,
        })
    })

    it('coerces a news date written as a string', () => {
        const news = contentSchemas.news.parse({ title: 'Welcome', date: '2026-09-01' })
        expect(news.date).toBeInstanceOf(Date)
        expect(news.date.toISOString()).toBe('2026-09-01T00:00:00.000Z')
    })

    it('rejects a page nav outside header / footer', () => {
        expect(contentSchemas.pages.safeParse({ title: 'Travel', nav: 'sidebar' }).success).toBe(false)
    })

    it('requires the question on an FAQ entry', () => {
        expect(contentSchemas.faq.safeParse({ order: 1 }).success).toBe(false)
    })

    it('keeps figure values as written, a bare number included, and needs at least one', () => {
        const figures = contentSchemas.figures.parse({
            title: 'Last year',
            items: [
                { value: '1,200+', label: 'Attendees' },
                { value: 48, label: 'Talks' },
            ],
        })
        expect(figures.items.map((item) => item.value)).toEqual(['1,200+', '48'])
        expect(figures.order).toBe(0)
        expect(contentSchemas.figures.safeParse({ title: 'Last year', items: [] }).success).toBe(false)
    })
})
