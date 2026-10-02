// The template's one build switch: how the site is served. Read by
// vite.config.ts (prerender on/off) and by the server functions (static
// middleware on/off) — the two must always agree, so both ask this module.
//
//   yarn build          → 'server': SSR on a Node server, data fetched live
//   yarn build:static   → 'static': every page prerendered to files, data baked
//                         in as JSON next to them — any static host, at a
//                         domain root
//
// The value is Vite's `--mode`, so it reaches the config (`mode`) and the app
// (`import.meta.env.MODE`) from the same command-line flag.

export type OutputMode = 'server' | 'static'

// The `--mode` value that selects static output.
export const STATIC_MODE = 'static'

export const outputModeOf = (viteMode: string): OutputMode => (viteMode === STATIC_MODE ? 'static' : 'server')
