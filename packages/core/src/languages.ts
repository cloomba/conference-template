// One site, one build per language (`site.alternates`): the same repo deployed
// once per language, each on its own hostname, so no language ever needs a
// path prefix. Framework-free and zod-free — the header's language switch runs
// this in the browser.

// The languages Cloomba itself speaks. A description section headed by one of
// these codes is a language section (locale-sections.ts), and the
// registration embed accepts exactly these in `?locale=`. Mirrors `LOCALES` in
// Cloomba's web app.
export const CLOOMBA_LOCALES = ['en', 'cs', 'de', 'el', 'es', 'fr', 'it', 'nl', 'pl', 'pt', 'sk', 'uk'] as const

// The language subtag of a BCP 47 tag: `uk-UA` → `uk`. Pass a tag that went
// through normalizeLocale — this only splits it.
export const baseLanguage = (locale: string): string => locale.split('-')[0].toLowerCase()

export interface LanguageAlternate {
    // BCP 47 tag of that build's `site.language`.
    language: string
    // What the switch shows for it ("UA", "Slovenčina", …).
    label: string
    // Absolute URL of that build's root.
    url: string
}

export interface LanguageLink {
    language: string
    label: string
    // The same page on that build.
    href: string
    // This build — the switch shows it as the current language, not a link.
    current: boolean
    // The first build listed — the one hreflang `x-default` names.
    isDefault: boolean
}

// Every build of the site as a link to `path` on that build: what the header's
// switch and the hreflang tags render. `path` is root-relative (static output
// sits at a domain root), so it replaces any path in an alternate's URL.
export const languageLinks = (
    alternates: readonly LanguageAlternate[],
    locale: string,
    path: string
): LanguageLink[] => {
    const here = baseLanguage(locale)
    return alternates.map((alternate, index) => ({
        language: alternate.language,
        label: alternate.label,
        href: new URL(path, alternate.url).toString(),
        current: baseLanguage(alternate.language) === here,
        isDefault: index === 0,
    }))
}
