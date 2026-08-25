// Effective service origins: the site config carries the production defaults
// (committed, forker-facing); env vars override them for local development
// against a dev API + dev web app. Build-time only.

import { config } from './config'

export const apiBaseUrl = (import.meta.env.CLOOMBA_API_URL as string | undefined) ?? config.api.base_url

// What the browser-side bits (islands, inline scripts) poll — anonymous reads.
export const browserBaseUrl =
    (import.meta.env.CLOOMBA_BROWSER_API_URL as string | undefined) ?? config.api.browser_base_url

// Where the registration iframe loads from.
export const embedOrigin = (import.meta.env.CLOOMBA_EMBED_ORIGIN as string | undefined) ?? config.api.embed_origin
