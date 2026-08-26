// Formatting helpers — all timezone math goes through Intl with the EVENT's
// IANA timezone, so a visitor in any locale sees the conference's wall-clock
// time. Framework-free, dependency-free.

// `site.language` is a free-form string in the config, and EVERY Intl
// constructor throws RangeError on a malformed tag — so a plausible typo
// ('slovak', or 'sk_SK' with an underscore) would otherwise kill the build.
// An unparseable tag must not take the site down: English formatting plus a
// warning is the right failure. getCanonicalLocales is the cheapest validator
// that agrees with what the Intl constructors will accept.
export const normalizeLocale = (tag: string): string => {
    let canonical: string
    try {
        canonical = Intl.getCanonicalLocales(tag)[0] ?? 'en'
    } catch {
        console.warn(`[cloomba] site.language "${tag}" is not a valid BCP 47 tag — falling back to "en".`)
        return 'en'
    }

    // A 4-8 letter language subtag is structurally LEGAL, so 'slovak' and
    // 'ukrainian' — the obvious typos for someone who doesn't know BCP 47 —
    // sail through and then silently format with root data. Say so; the tag
    // still works, so this warns rather than substituting something.
    if (Intl.DateTimeFormat.supportedLocalesOf(canonical).length === 0) {
        console.warn(
            `[cloomba] site.language "${tag}" is a valid tag but has no locale data ` +
                `(did you mean a two-letter code, e.g. "sk" for Slovak?) — dates and money will use the default locale.`
        )
    }
    return canonical
}

// Money is integer cents + ISO 4217 currency on the wire — never floats.
export const formatMoney = (cents: number, currency: string, locale = 'en'): string =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)

export const formatTime = (instant: Date, timeZone: string, locale = 'en'): string =>
    new Intl.DateTimeFormat(locale, { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(instant)

// "10:00 – 10:45" in the event's timezone.
export const formatTimeRange = (start: Date, end: Date, timeZone: string, locale = 'en'): string =>
    `${formatTime(start, timeZone, locale)} – ${formatTime(end, timeZone, locale)}`

// Wall-clock minute-of-day of an instant in the event's timezone — drives the
// agenda time grid (a 09:30 session sits at row 9*60+30 regardless of the
// visitor's zone).
export const minutesOfDay = (instant: Date, timeZone: string): number => {
    const text = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).format(instant)
    const [hours, minutes] = text.split(':').map(Number)
    return hours * 60 + minutes
}

// A wall-clock minute-of-day back to text — the agenda grid's hour gutter,
// which has minute offsets rather than instants. Formatted through Intl (on a
// synthetic UTC instant, so the function stays pure) instead of hand-rolling
// "HH:MM": locales disagree on the separator (fi renders 09.30) and on the
// digits, and the gutter must match the session cards beside it.
export const formatMinutesOfDay = (minutes: number, locale = 'en'): string =>
    formatTime(new Date(Date.UTC(1970, 0, 1, 0, minutes)), 'UTC', locale)

// "Tuesday, October 20" — day headings on the agenda.
export const formatDayHeading = (instant: Date, timeZone: string, locale = 'en'): string =>
    new Intl.DateTimeFormat(locale, { timeZone, weekday: 'long', month: 'long', day: 'numeric' }).format(instant)

// "November 3 – 4, 2026" / "October 31 – November 2, 2026" / one-day collapse.
//
// Intl does the whole job via formatRange: it picks the separator, decides
// which parts to elide on the shared side, and collapses a same-day range to a
// single date — all per locale. Hand-rolling the three branches (as this used
// to) bakes in ENGLISH date grammar: month-first, comma before the year. That
// was invisible while every site was English, and produced "3. novembra–4.,
// 2026" the moment a Slovak site passed its own locale.
export const formatDateSpan = (start: Date, end: Date, timeZone: string, locale = 'en'): string =>
    new Intl.DateTimeFormat(locale, { timeZone, month: 'long', day: 'numeric', year: 'numeric' }).formatRange(
        start,
        end
    )
