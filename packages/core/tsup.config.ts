import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    // Bundle zod v4 INTO the dist: Astro apps always carry zod v3 for content
    // collections, and a hoisted v3 resolving into our schema breaks at
    // runtime (`.prefault is not a function`). Inlining removes the conflict
    // for every consumer.
    noExternal: ['zod'],
})
