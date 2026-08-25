// The parsed, validated site config — imported everywhere. astro.config.ts
// already validated it once so a bad config kills the build early; this
// module re-parses to hand pages the RESOLVED shape (defaults filled).

import { parseSiteConfig } from '@cloomba/core'

import rawConfig from '../../site.config'

export const config = parseSiteConfig(rawConfig)
