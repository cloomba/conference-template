import { defineConfig } from 'tsup'

export default defineConfig({
    // One output file per module (index.js re-exports from agenda.js,
    // config.js, …) plus `"sideEffects": false` in package.json: a browser
    // bundle that imports only the agenda or format helpers leaves config.js,
    // content.js and zod out entirely. A single bundled file would carry every
    // top-level schema — and zod with it — into any island that imports core.
    entry: ['src/*.ts'],
    format: ['esm'],
    splitting: true,
    dts: true,
    clean: true,
    // Bundle zod v4 INTO the dist: Astro apps always carry zod v3 for content
    // collections, and a hoisted v3 resolving into our schema breaks at
    // runtime (`.prefault is not a function`). Inlining removes the conflict
    // for every consumer.
    noExternal: ['zod'],
})
