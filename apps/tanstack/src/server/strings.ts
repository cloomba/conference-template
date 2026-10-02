// This site's resolved UI labels: the theme's English table (strings.en.json)
// with your overrides (strings.ts, via site.config.ts) merged over it.
// SERVER-ONLY — the resolved table reaches the browser as part of the root
// route's data, where src/lib/site.ts hands components the same t() / tn().
//
// To change wording or translate, edit apps/tanstack/strings.ts. Anything
// you leave out stays English.

import { normalizeLocale, resolveStrings, translate, translatePlural } from '@cloomba/core'

import { EN_STRINGS, type PluralKey, type StringKey } from '@/lib/string-keys'

import { config } from './config'

export const strings = resolveStrings(EN_STRINGS, config.strings)

// The validated BCP 47 tag for every Intl call. Read this rather than
// config.site.language directly: the config value is free-form, and a
// malformed tag makes every Intl constructor throw.
export const locale = normalizeLocale(config.site.language)

export const t = (key: StringKey, params?: Record<string, string | number>): string => translate(strings, key, params)

export const tn = (key: PluralKey, count: number, params?: Record<string, string | number>): string =>
    translatePlural(strings, locale, key, count, params)
