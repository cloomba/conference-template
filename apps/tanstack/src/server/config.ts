// The parsed, validated site config, with defaults filled. SERVER-ONLY: it
// reads process.env (site.config.ts) and is imported from server-function
// handlers alone. The browser receives the parts it renders as loader data.

import { parseSiteConfig } from '@cloomba/core'

import rawConfig from '../../site.config'

export const config = parseSiteConfig(rawConfig)
