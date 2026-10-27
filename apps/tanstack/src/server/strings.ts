// This site's resolved UI labels: the theme's English table (strings.en.json),
// the shipped translation for the site's language (strings.uk.json,
// strings.sk.json) over it, and your overrides (strings.ts, via
// site.config.ts) over both. SERVER-ONLY — the resolved table reaches the
// browser as part of the root route's data, where src/lib/site.ts hands
// components the same t() / tn().
//
// To change wording or translate, edit apps/tanstack/strings.ts. Anything
// neither table has stays English.

import { baseLanguage, normalizeLocale, resolveStrings, translate, translatePlural } from '@cloomba/core'

import { EN_STRINGS, SHIPPED_STRINGS, type PluralKey, type StringKey } from '@/lib/string-keys'

import { config } from './config'

// The validated BCP 47 tag for every Intl call. Read this rather than
// config.site.language directly: the config value is free-form, and a
// malformed tag makes every Intl constructor throw.
export const locale = normalizeLocale(config.site.language)

export const strings = resolveStrings(EN_STRINGS, {
    ...SHIPPED_STRINGS[baseLanguage(locale)],
    ...config.strings,
})

export const t = (key: StringKey, params?: Record<string, string | number>): string => translate(strings, key, params)

export const tn = (key: PluralKey, count: number, params?: Record<string, string | number>): string =>
    translatePlural(strings, locale, key, count, params)
