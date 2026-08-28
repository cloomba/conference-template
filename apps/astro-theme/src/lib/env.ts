// Effective service origins: the site config carries the production defaults
// (committed, forker-facing); env vars override them for local development
// against a dev API + dev web app. Build-time only.

import { config } from './config'

// The shared demo key, so that `git clone && yarn install && yarn dev` renders a
// real conference with no account, no signup, and no .env file. It reads the
// demo event (`fauna-forum`) and nothing else.
//
// It is safe to publish because of its SCOPE, not because of obscurity:
// `read_public` reaches public event content only — the attendee endpoints, and
// therefore every name, email, phone number and door token, are a 403 for this
// key. That is the whole reason the scope exists.
//
// Swap in your own the moment you point site.config.ts at your own event
// (cloomba.com/me/developers, free): this one's rate limit is shared with
// everyone who ever cloned the repository, and its data isn't yours.
export const DEMO_API_KEY = 'cloomba_sk_xDE49sjn-5TZ4nWttp8VEyHAf9R2DOpB'

export const apiKey = (import.meta.env.CLOOMBA_API_KEY as string | undefined) || DEMO_API_KEY

// True when the build is running on the shared key rather than the site's own.
export const usingDemoKey = !import.meta.env.CLOOMBA_API_KEY

export const apiBaseUrl = (import.meta.env.CLOOMBA_API_URL as string | undefined) ?? config.api.base_url

// What the browser-side bits (islands, inline scripts) poll — anonymous reads.
export const browserBaseUrl =
    (import.meta.env.CLOOMBA_BROWSER_API_URL as string | undefined) ?? config.api.browser_base_url

// Where the registration iframe loads from.
export const embedOrigin = (import.meta.env.CLOOMBA_EMBED_ORIGIN as string | undefined) ?? config.api.embed_origin
