// Your site's wording — the ONE file to edit when you translate, or when you
// just want to say something differently. Everything you set here is merged
// over the shipped English, so you change what you care about and the rest
// stays as it was:
//
//     final = { ...en, ...these }
//
// The complete key list is strings.en.json, right next to this file — 81 keys,
// the whole vocabulary of the template. Your editor autocompletes every one of
// them and underlines a typo, thanks to the `satisfies` at the bottom.
//
// Nothing here can break the build. A key that doesn't exist, isn't a string,
// or is empty is skipped with a warning and the English is used instead.

import type { StringOverrides } from './src/lib/string-keys'

export default {
    // --- Navigation and buttons ---------------------------------------------
    // 'nav.about': 'O konferencii',
    // 'nav.agenda': 'Program',
    // 'nav.speakers': 'Rečníci',
    // 'nav.sponsors': 'Sponzori',
    // 'nav.tickets': 'Vstupenky',
    // 'common.register': 'Registrovať sa',
    // 'agenda.all_stages': 'Všetky pódiá',
    // 'tickets.sold_out': 'Vypredané',
    // --- Counted phrases ----------------------------------------------------
    // These are plural FAMILIES, not single strings. English gets by with
    // `.one` and `.other`; Slovak and Czech also need `.few` (2-4), Ukrainian
    // and Polish also need `.many`. The right form is picked for the actual
    // number, and any form you leave out falls back to `.other`.
    //
    // 'stats.days.one': 'deň',
    // 'stats.days.few': 'dni',
    // 'stats.days.other': 'dní',
    //
    // `{count}` is filled in for you:
    // 'tickets.spots_left.one': 'Zostáva {count} miesto',
    // 'tickets.spots_left.few': 'Zostávajú {count} miesta',
    // 'tickets.spots_left.other': 'Zostáva {count} miest',
    // --- Your own wording, in any language ----------------------------------
    // The demo's phrasing lives here too, so you can change it without
    // touching a single component:
    // 'about.heading': 'One watering hole, every species',
    // 'cta.heading': 'Be there when the whole kingdom gathers',
    // 'sponsors.cta_title': 'Your logo belongs up there',
} satisfies StringOverrides
