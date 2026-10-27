import { existsSync } from 'node:fs'
import { baseLanguage, contentSchemas, normalizeLocale } from '@cloomba/core'
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'

import { config } from './lib/config'

// One collection per folder under src/content/. The front-matter shapes —
// and what each folder is for — live in @cloomba/core (packages/core/src/
// content.ts), shared with apps/tanstack.
//
// A site built once per language (site.alternates) keeps one content folder
// per language — src/content/uk/, src/content/sk/ — with the same file names in
// each, and every build reads its own. A one-language site keeps its
// collections straight under src/content/. Paths are project-relative, as
// Astro resolves `base`.
const localized = `./src/content/${baseLanguage(normalizeLocale(config.site.language))}`
const root = existsSync(localized) ? localized : './src/content'

const pages = defineCollection({
    loader: glob({ pattern: '**/*.md', base: `${root}/pages` }),
    schema: contentSchemas.pages,
})

const faq = defineCollection({
    loader: glob({ pattern: '**/*.md', base: `${root}/faq` }),
    schema: contentSchemas.faq,
})

const news = defineCollection({
    loader: glob({ pattern: '**/*.md', base: `${root}/news` }),
    schema: contentSchemas.news,
})

const highlights = defineCollection({
    loader: glob({ pattern: '**/*.md', base: `${root}/highlights` }),
    schema: contentSchemas.highlights,
})

const features = defineCollection({
    loader: glob({ pattern: '**/*.md', base: `${root}/features` }),
    schema: contentSchemas.features,
})

const figures = defineCollection({
    loader: glob({ pattern: '**/*.md', base: `${root}/figures` }),
    schema: contentSchemas.figures,
})

export const collections = { pages, faq, news, highlights, features, figures }
