import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { parseSiteConfig } from '@cloomba/core'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

import rawConfig from './site.config'

// Validate early: a broken site.config.ts should kill `astro dev`/`build`
// with the schema's readable error, not surface as undefined deep in a page.
const site = parseSiteConfig(rawConfig)

export default defineConfig({
    output: 'static',
    // Absolute URLs (canonical, og:url, sitemap, iCal URL) — unset in config
    // means relative-only, which is fine for previews.
    site: site.site.url,
    // The sitemap needs the absolute site URL; skipped on preview builds.
    integrations: [react(), ...(site.site.url ? [sitemap()] : [])],
    vite: { plugins: [tailwindcss()] },
})
