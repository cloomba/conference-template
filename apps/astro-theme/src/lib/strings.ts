// This site's resolved UI labels: the theme's English table (strings.en.json),
// the shipped translation for the site's language (strings.uk.json,
// strings.sk.json) over it, and your overrides (strings.ts) over both.
// Resolved once, at build time — the module is imported, not re-evaluated per
// page.
//
// To change wording or translate, edit apps/astro-theme/strings.ts. Anything
// neither table has stays English.

import { normalizeLocale, resolveStrings, translate, translatePlural } from '@cloomba/core'

import { config } from './config'
import { EN_STRINGS, SHIPPED_STRINGS, type PluralKey, type StringKey } from './string-keys'

// The validated BCP 47 tag for every Intl call. Read this rather than
// config.site.language directly: the config value is free-form, and a
// malformed tag makes every Intl constructor throw.
export const locale = normalizeLocale(config.site.language)

const table = resolveStrings(EN_STRINGS, {
    ...SHIPPED_STRINGS[locale.split('-')[0]],
    ...config.strings,
})

export const t = (key: StringKey, params?: Record<string, string | number>): string => translate(table, key, params)

// Plural families (`stats.days`, `tickets.spots_left`, …) — `{count}` is
// injected automatically.
export const tn = (key: PluralKey, count: number, params?: Record<string, string | number>): string =>
    translatePlural(table, locale, key, count, params)

// The raw templates an island or an inline <script> needs, since neither can
// call t() across the boundary.
export const strings = table
