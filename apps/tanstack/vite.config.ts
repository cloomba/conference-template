import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'

import { outputModeOf } from './src/lib/output-mode.ts'

// A static build prerenders EVERY page, listed up front. Following links from
// / alone misses pages nothing links to — a break's session page, a custom
// page outside the nav — so the build lists the same pages the sitemap serves
// (src/lib/page-paths.ts): sessions and speakers from the API, pages and news
// from src/content. Static mode only; dev and server builds never fetch here.
const staticPages = async (mode: string) => {
    // .env → process.env first: the API key is read when data.ts loads.
    for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), ''))) process.env[key] ??= value
    const { loadSessions, loadSpeakers } = await import('./src/server/data.ts')
    const { pagePaths } = await import('./src/lib/page-paths.ts')
    const ids = (folder: string) =>
        readdirSync(new URL(`./src/content/${folder}`, import.meta.url))
            .filter((file) => file.endsWith('.md'))
            .map((file) => file.slice(0, -'.md'.length))
    const [sessions, speakers] = await Promise.all([loadSessions(), loadSpeakers()])
    return pagePaths({ pages: ids('pages'), news: ids('news'), sessions, speakers }).map((path) => ({ path }))
}

// The static 404 page, as plain HTML. A host serves 404.html at whatever
// unknown URL was asked for, and React can't hydrate /404's markup at another
// URL (error #418). Without the app's scripts the page still works: links are
// ordinary links and the mobile menu is a native popover. The theme toggle is
// the one control that needs JS, so it is hidden there. Runs after the
// prerender (both are post-order buildApp hooks; this plugin comes later).
const plainNotFoundPage = (): Plugin => ({
    name: 'conference:plain-404',
    enforce: 'post',
    buildApp: {
        order: 'post',
        async handler() {
            const file = fileURLToPath(new URL('./.output/public/404.html', import.meta.url))
            const html = readFileSync(file, 'utf-8')
                .replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, '')
                // TanStack's own scripts: the module entry, and the inline ones
                // that carry its `tsr` marker. The theme script and analytics stay.
                .replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g, (tag, attrs: string, body: string) =>
                    /type="module"|tsr/i.test(attrs + body) ? '' : tag
                )
                .replace('</head>', '<style>#theme-toggle{display:none}</style></head>')
            writeFileSync(file, html)
        },
    },
})

export default defineConfig(async ({ mode }) => {
    const isStatic = outputModeOf(mode) === 'static'
    return {
        resolve: {
            alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
        },
        plugins: [
            // A static build deploys only the prerendered files, so its own
            // server — the one the prerender renders through — is always a
            // plain Node server. Left to auto-detect, Nitro switches to the
            // host's preset (cloudflare-pages on Cloudflare's builder), whose
            // preview server can't start there. Server builds keep detection.
            nitro(isStatic ? { preset: 'node-server' } : undefined),
            tailwindcss(),
            tanstackStart({
                // Links found on the listed pages are followed too. Besides the
                // pages, three things are listed: /404 (written to /404.html,
                // the file static hosts serve for unknown paths), robots.txt and
                // the sitemap.
                prerender: { enabled: isStatic, crawlLinks: true, failOnError: true },
                pages: isStatic
                    ? [
                          ...(await staticPages(mode)),
                          { path: '/404', prerender: { outputPath: '/404.html' } },
                          { path: '/robots.txt' },
                          { path: '/sitemap.xml' },
                      ]
                    : [],
            }),
            viteReact(),
            ...(isStatic ? [plainNotFoundPage()] : []),
        ],
    }
})
