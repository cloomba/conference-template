import { contentSchemas } from '@cloomba/core'
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'

// One collection per folder under src/content/. The front-matter shapes —
// and what each folder is for — live in @cloomba/core (packages/core/src/
// content.ts), shared with apps/tanstack.

const pages = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
    schema: contentSchemas.pages,
})

const faq = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
    schema: contentSchemas.faq,
})

const news = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
    schema: contentSchemas.news,
})

const highlights = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/highlights' }),
    schema: contentSchemas.highlights,
})

const features = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/features' }),
    schema: contentSchemas.features,
})

export const collections = { pages, faq, news, highlights, features }
