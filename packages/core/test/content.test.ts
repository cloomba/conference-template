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
})
