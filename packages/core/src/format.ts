// Formatting helpers — all timezone math goes through Intl with the EVENT's
// IANA timezone, so a visitor in any locale sees the conference's wall-clock
// time. Framework-free, dependency-free.

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

// "Tuesday, October 20" — day headings on the agenda.
export const formatDayHeading = (instant: Date, timeZone: string, locale = 'en'): string =>
    new Intl.DateTimeFormat(locale, { timeZone, weekday: 'long', month: 'long', day: 'numeric' }).format(instant)

// "October 20–22, 2026" / "October 31 – November 2, 2026" / one-day fallback.
export const formatDateSpan = (start: Date, end: Date, timeZone: string, locale = 'en'): string => {
    const md = new Intl.DateTimeFormat(locale, { timeZone, month: 'long', day: 'numeric' })
    const mdy = new Intl.DateTimeFormat(locale, { timeZone, month: 'long', day: 'numeric', year: 'numeric' })
    const sameDay =
        new Intl.DateTimeFormat('en-CA', { timeZone, dateStyle: 'short' }).format(start) ===
        new Intl.DateTimeFormat('en-CA', { timeZone, dateStyle: 'short' }).format(end)
    if (sameDay) return mdy.format(start)
    const sameMonth =
        new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit' }).format(start) ===
        new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit' }).format(end)
    if (sameMonth) {
        const day = new Intl.DateTimeFormat(locale, { timeZone, day: 'numeric' })
        const year = new Intl.DateTimeFormat(locale, { timeZone, year: 'numeric' })
        return `${md.format(start)}–${day.format(end)}, ${year.format(end)}`
    }
    return `${md.format(start)} – ${mdy.format(end)}`
}
