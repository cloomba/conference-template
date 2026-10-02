// Every page the site serves — the one list behind /sitemap.xml and the
// static build's prerender list (vite.config.ts), so the two can't drift
// apart. Pure: each caller gathers the sources its own way (the server from
// the bundled content, the config from the files on disk).

import { sessionPath, speakerPath } from './slugs'

export interface PagePathSources {
    // File names (without .md) under src/content/pages and src/content/news.
    pages: string[]
    news: string[]
    sessions: { title: string; hash: string }[]
    speakers: { name: string | null; hash: string }[]
}

export const pagePaths = ({ pages, news, sessions, speakers }: PagePathSources): string[] => [
    '/',
    '/about',
    '/agenda',
    '/news',
    '/speakers',
    '/sponsors',
    '/tickets',
    ...pages.map((id) => `/${id}`),
    ...news.map((id) => `/news/${id}`),
    ...sessions.map(sessionPath),
    ...speakers.map(speakerPath),
]
