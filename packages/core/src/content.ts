// Front-matter shapes for the markdown a site keeps in src/content/ — one
// schema per folder. Both apps validate against these (astro-theme through
// its content collections, tanstack through its own loader), so a page that
// builds in one builds in the other. The markdown itself is each app's own.

import { z } from 'zod'

export const contentSchemas = {
    // Custom pages — each file becomes a route at /<file-name> (travel.md →
    // /travel). `nav: header` / `nav: footer` adds a link there automatically.
    pages: z.object({
        title: z.string(),
        description: z.string().optional(),
        nav: z.enum(['header', 'footer']).optional(),
        order: z.number().default(0),
    }),
    // FAQ — one question per file, the body is the answer (markdown).
    faq: z.object({
        question: z.string(),
        order: z.number().default(0),
    }),
    // News / announcements — listed newest first at /news.
    news: z.object({
        title: z.string(),
        date: z.coerce.date(),
        description: z.string().optional(),
    }),
    // Home-page highlight splits — alternating [image][text] / [text][image]
    // blocks; body = the text, image from public/ (or any URL).
    highlights: z.object({
        title: z.string(),
        image: z.string(),
        image_alt: z.string().default(''),
        cta_label: z.string().optional(),
        cta_href: z.string().optional(),
        order: z.number().default(0),
    }),
    // Home-page feature cards — the three-up [card][card][card] row.
    features: z.object({
        title: z.string(),
        // An emoji or short glyph shown above the title.
        icon: z.string().optional(),
        order: z.number().default(0),
    }),
}

export type ContentCollection = keyof typeof contentSchemas
