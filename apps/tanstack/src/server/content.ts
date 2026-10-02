// The site's own markdown under src/content/ — one folder per collection,
// front matter validated against @cloomba/core's contentSchemas (the same
// shapes apps/astro-theme checks). SERVER-ONLY.
//
// Vite resolves the glob at build time and bundles every file's text, so a
// server deployment reads no files at runtime and a static build bakes the
// rendered HTML into its JSON. A front-matter mistake fails the build (or the
// request, in dev) with the file name and the problem.

import { contentSchemas, type ContentCollection } from '@cloomba/core'
import { parse as parseYaml } from 'yaml'

import { renderContent } from './markdown'

const FILES = import.meta.glob('../content/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
    string,
    string
>

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export type ContentData<C extends ContentCollection> = ReturnType<(typeof contentSchemas)[C]['parse']>

export interface ContentEntry<C extends ContentCollection> {
    // The file name without `.md` — `travel.md` is `travel`, its page /travel.
    id: string
    data: ContentData<C>
    html: string
}

// Parsed once per collection: the files are fixed at build time, so a server
// deployment renders its markdown on the first request, not on every one.
const parsed = new Map<ContentCollection, ContentEntry<ContentCollection>[]>()

export const getCollection = <C extends ContentCollection>(collection: C): ContentEntry<C>[] => {
    let entries = parsed.get(collection)
    if (!entries) {
        entries = parseCollection(collection)
        parsed.set(collection, entries)
    }
    return entries as ContentEntry<C>[]
}

const parseCollection = <C extends ContentCollection>(collection: C): ContentEntry<C>[] => {
    const prefix = `../content/${collection}/`
    return Object.entries(FILES)
        .filter(([path]) => path.startsWith(prefix))
        .map(([path, source]) => {
            const id = path.slice(prefix.length).replace(/\.md$/, '')
            const match = FRONT_MATTER.exec(source)
            const raw: unknown = match ? (parseYaml(match[1]) ?? {}) : {}
            const result = contentSchemas[collection].safeParse(raw)
            if (!result.success) {
                const problems = result.error.issues.map(
                    (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`
                )
                throw new Error(`src/content/${collection}/${id}.md — ${problems.join('; ')}`)
            }
            const body = match ? source.slice(match[0].length) : source
            return { id, data: result.data as ContentData<C>, html: renderContent(body) }
        })
}

// Collections that carry an `order` field, sorted by it.
export const getOrdered = <C extends 'pages' | 'faq' | 'highlights' | 'features'>(collection: C) =>
    [...getCollection(collection)].sort((a, b) => a.data.order - b.data.order)

// News, newest first.
export const getNews = () => [...getCollection('news')].sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
