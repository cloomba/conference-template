import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Custom pages — each file becomes a route at /<file-name> (travel.md →
// /travel). `nav: header` / `nav: footer` adds a link there automatically.
const pages = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        nav: z.enum(['header', 'footer']).optional(),
        order: z.number().default(0),
    }),
})

// FAQ — one question per file, the body is the answer (markdown).
const faq = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
    schema: z.object({
        question: z.string(),
        order: z.number().default(0),
    }),
})

// News / announcements — listed newest first at /news.
const news = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        description: z.string().optional(),
    }),
})

// Home-page highlight splits — alternating [image][text] / [text][image]
// blocks; body = the text, image from public/ (or any URL).
const highlights = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/highlights' }),
    schema: z.object({
        title: z.string(),
        image: z.string(),
        image_alt: z.string().default(''),
        cta_label: z.string().optional(),
        cta_href: z.string().optional(),
        order: z.number().default(0),
    }),
})

// Home-page feature cards — the three-up [card][card][card] row.
const features = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/features' }),
    schema: z.object({
        title: z.string(),
        // An emoji or short glyph shown above the title.
        icon: z.string().optional(),
        order: z.number().default(0),
    }),
})

export const collections = { pages, faq, news, highlights, features }
