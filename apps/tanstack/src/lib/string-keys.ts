// The theme's vocabulary, as types. Kept separate from lib/strings.ts (which
// pulls in the site config) so that ../../strings.ts — the file you actually
// edit — can import these without a circular reference.

import type { CldrForm } from '@cloomba/core'

import en from '../../strings.en.json'

export const EN_STRINGS: Record<string, string> = en

// Every key in strings.en.json.
export type StringKey = keyof typeof en

// A plural FAMILY: the base of `<base>.one` / `.few` / `.many` / `.other`.
// `stats.days`, never `stats.days.one`. Derived from the `.other` members,
// which every family has.
export type PluralKey = StringKey extends infer K ? (K extends `${infer Base}.other` ? Base : never) : never

// English carries only one/other, so the forms Slovak and Ukrainian need are
// not keys in strings.en.json — but they are always legal to override.
export type PluralFormKey = `${PluralKey}.${CldrForm}`

// The authoring shape for strings.ts: every key optional, all autocompleted,
// and a typo underlined before any build runs.
export type StringOverrides = Partial<Record<StringKey | PluralFormKey, string>>
