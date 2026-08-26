// The merge and lookup machinery for a theme's UI strings. The VOCABULARY
// itself lives with the theme (apps/astro-theme/strings.en.json), not here —
// core owns behaviour, the theme owns its words, so a different theme brings a
// different table without touching this file.
//
// A site overrides what it wants and the rest stays English:
//
//     final = { ...en, ...site.config.strings }
//
// One event, one config, one deployment — so this is a build-time merge, not a
// locale routing layer. Keys are flat and dotted, which keeps the merge a plain
// spread; a nested table would need a deep merge.
//
// GOVERNING RULE: nothing here throws. A wrong label on a working site beats a
// dead site, so every bad input degrades to the English word plus a warning.
// (The REST of the site config still fails fast — a missing event.slug or a
// malformed theme yields a broken site, not a mislabeled one.)

export type StringTable = Record<string, string>

// The CLDR plural categories. English only ever uses `one` and `other`, but
// Slovak and Czech need `few`, Ukrainian and Polish need `many` — forms that
// will never appear in an English table. They are legal overrides by
// construction, or no Slovak site could spell its own plurals.
export const CLDR_FORMS = ['zero', 'one', 'two', 'few', 'many', 'other'] as const
export type CldrForm = (typeof CLDR_FORMS)[number]

// Derive the plural FAMILY names from the `.other` members every family must
// have: `stats.days.other` → the family `stats.days`, which is never itself a
// key. Exported as types in the theme so authors get autocomplete.
const pluralFamilies = (en: StringTable): Set<string> =>
    new Set(
        Object.keys(en)
            .filter((key) => key.endsWith('.other'))
            .map((key) => key.slice(0, -'.other'.length))
    )

const isKnownKey = (en: StringTable, families: Set<string>, key: string): boolean => {
    if (key in en) return true
    const dot = key.lastIndexOf('.')
    if (dot < 0) return false
    return (CLDR_FORMS as readonly string[]).includes(key.slice(dot + 1)) && families.has(key.slice(0, dot))
}

// Merge overrides over the English table, dropping anything unusable. Bad
// entries are reported together — one warning, not one per key — in the same
// style as parseSiteConfig's multi-issue error.
export const resolveStrings = (en: StringTable, overrides: Record<string, unknown> = {}): StringTable => {
    const families = pluralFamilies(en)
    const good: StringTable = {}
    const ignored: string[] = []

    for (const [key, value] of Object.entries(overrides)) {
        if (!isKnownKey(en, families, key)) ignored.push(`${key} — not a known string key`)
        else if (typeof value !== 'string') ignored.push(`${key} — expected a string, got ${typeof value}`)
        // An accidentally empty value renders an invisible label with no clue
        // why. Blanking one deliberately is better served by `sections`.
        else if (value.trim() === '') ignored.push(`${key} — empty`)
        else good[key] = value
    }

    if (ignored.length > 0) {
        console.warn(
            '[cloomba] Ignored string overrides (the English text is used instead):\n' +
                ignored.map((line) => `  ${line}`).join('\n')
        )
    }

    return { ...en, ...good }
}

// --- Lookup ------------------------------------------------------------------

// `{name}` placeholders. An unsupplied placeholder is left visible rather than
// blanked, so a missing param shows up in the page instead of vanishing.
const fill = (template: string, params?: Record<string, string | number>): string =>
    params ? template.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match)) : template

// Returning undefined would render the literal text "undefined" on a page, so
// the chain bottoms out at the key name: ugly, but legible and greppable.
export const translate = (table: StringTable, key: string, params?: Record<string, string | number>): string =>
    fill(table[key] ?? key, params)

// Falls back through the selected form → other → one → the key itself, so a
// table missing the selected form still renders a word. `{count}` is injected
// without the caller asking.
export const translatePlural = (
    table: StringTable,
    locale: string,
    key: string,
    count: number,
    params?: Record<string, string | number>
): string => {
    const rule = new Intl.PluralRules(locale).select(count)
    const template = [`${key}.${rule}`, `${key}.other`, `${key}.one`]
        .map((candidate) => table[candidate])
        .find((value) => value !== undefined)
    return fill(template ?? key, { count, ...params })
}
