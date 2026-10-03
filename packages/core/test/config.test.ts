import { describe, expect, it } from 'vitest'

import { contrastRatio, hexToOklch, normalizeHex, oklchToHex } from '../src/color'
import {
    DARK_DEFAULTS,
    LIGHT_DEFAULTS,
    parseSiteConfig,
    registrationEmbedUrl,
    resolveTokens,
    themeCss,
} from '../src/config'

const minimal = { site: { name: 'DemoConf' }, event: { slug: 'demo-conf' } }

describe('parseSiteConfig', () => {
    it('fills every default from a minimal config', () => {
        const config = parseSiteConfig(minimal)
        expect(config.site.language).toBe('en')
        expect(config.site.noindex).toBe(false)
        expect(config.theme.mode).toBe('auto')
        expect(config.theme.radius).toBe('0.75rem')
        expect(config.sections).toContain('agenda')
        expect(config.api.base_url).toBe('https://api.cloomba.com/public/v1')
        expect(config.api.browser_base_url).toBe('https://api.cloomba.com/v1')
    })

    it('rejects a missing event slug with a readable message', () => {
        expect(() => parseSiteConfig({ site: { name: 'X' }, event: {} })).toThrow(/event\.slug/)
    })

    it('rejects an unknown section name', () => {
        expect(() => parseSiteConfig({ ...minimal, sections: ['hero', 'merch'] })).toThrow(/sections/)
    })
})

describe('color', () => {
    it('normalizes #rgb and rejects what it cannot read', () => {
        expect(normalizeHex('#ABC')).toBe('#aabbcc')
        expect(normalizeHex(' #1F7A4D ')).toBe('#1f7a4d')
        expect(normalizeHex('rebeccapurple')).toBeNull()
        expect(normalizeHex('oklch(0.5 0.1 150)')).toBeNull()
    })

    it('round-trips hex through OKLCH', () => {
        for (const hex of ['#1f7a4d', '#5fd39a', '#2f5fe0', '#101215', '#ffffff', '#000000']) {
            expect(oklchToHex(hexToOklch(hex))).toBe(hex)
        }
    })

    it('computes WCAG contrast', () => {
        expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
        expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5)
    })
})

const hueGap = (a: number, b: number): number => Math.min(Math.abs(a - b), 360 - Math.abs(a - b))

describe('resolveTokens', () => {
    it('overrides only what the organizer set; dark inherits its own defaults', () => {
        const config = parseSiteConfig({ ...minimal, theme: { light: { primary: '#ff0000' } } })
        const { light, dark } = resolveTokens(config.theme)
        expect(light.primary).toBe('#ff0000')
        expect(light.surface).toBe('#ffffff')
        expect(dark.primary).toBe(DARK_DEFAULTS.primary)
    })

    it('tints the unset neutrals with the primary hue at the default lightness', () => {
        const config = parseSiteConfig({
            ...minimal,
            theme: { light: { primary: '#1f7a4d' }, dark: { primary: '#5fd39a' } },
        })
        const { light, dark } = resolveTokens(config.theme)
        for (const [set, defaults, primary] of [
            [light, LIGHT_DEFAULTS, '#1f7a4d'],
            [dark, DARK_DEFAULTS, '#5fd39a'],
        ] as const) {
            const brandHue = hexToOklch(primary).h
            for (const role of ['surface_alt', 'text', 'text_muted'] as const) {
                const tinted = hexToOklch(set[role])
                expect(hueGap(tinted.h, brandHue)).toBeLessThan(5)
                expect(tinted.l).toBeCloseTo(hexToOklch(defaults[role]).l, 2)
            }
        }
        expect(light.surface).toBe('#ffffff')
        expect(light.accent).toBe('#1f7a4d')
        expect(dark.accent).toBe('#5fd39a')
    })

    it('keeps a near-gray brand near gray', () => {
        const config = parseSiteConfig({ ...minimal, theme: { light: { primary: '#6b6f73' } } })
        expect(hexToOklch(resolveTokens(config.theme).light.text_muted).c).toBeLessThan(0.005)
    })

    it('picks white or a dark tint for text on the primary, whichever contrasts more', () => {
        const config = parseSiteConfig({
            ...minimal,
            theme: { light: { primary: '#1f7a4d' }, dark: { primary: '#5fd39a' } },
        })
        const { light, dark } = resolveTokens(config.theme)
        expect(light.primary_content).toBe('#ffffff')
        expect(dark.primary_content).not.toBe('#ffffff')
        expect(contrastRatio(dark.primary_content, '#5fd39a')).toBeGreaterThan(7)
        expect(hueGap(hexToOklch(dark.primary_content).h, hexToOklch('#5fd39a').h)).toBeLessThan(10)
    })

    it('never overrides a token the organizer set', () => {
        const config = parseSiteConfig({
            ...minimal,
            theme: {
                light: { primary: '#1f7a4d', surface_alt: '#eeeeee', primary_content: '#000000', accent: '#ff00ff' },
            },
        })
        const { light } = resolveTokens(config.theme)
        expect(light.surface_alt).toBe('#eeeeee')
        expect(light.primary_content).toBe('#000000')
        expect(light.accent).toBe('#ff00ff')
    })

    it('derives from a short #rgb primary', () => {
        const config = parseSiteConfig({ ...minimal, theme: { light: { primary: '#0a5' } } })
        const { light } = resolveTokens(config.theme)
        expect(hueGap(hexToOklch(light.text_muted).h, hexToOklch('#00aa55').h)).toBeLessThan(5)
        expect(light.accent).toBe('#0a5')
    })

    it('falls back to the shipped defaults for a primary it cannot read', () => {
        const config = parseSiteConfig({ ...minimal, theme: { light: { primary: 'oklch(0.5 0.1 150)' } } })
        const { light } = resolveTokens(config.theme)
        expect(light).toEqual({ ...LIGHT_DEFAULTS, primary: 'oklch(0.5 0.1 150)' })
    })
})

describe('themeCss', () => {
    it('auto mode emits light base + prefers-color-scheme block + data-theme override', () => {
        const css = themeCss(parseSiteConfig(minimal).theme)
        expect(css).toContain(':root {')
        expect(css).toContain('@media (prefers-color-scheme: dark)')
        expect(css).toContain(':root:not([data-theme="light"])')
        expect(css).toContain(':root[data-theme="dark"]')
    })

    it('a pinned mode emits exactly one palette and no media query', () => {
        const config = parseSiteConfig({ ...minimal, theme: { mode: 'dark' } })
        const css = themeCss(config.theme)
        expect(css).not.toContain('@media')
        expect(css).toContain(`--t-surface: ${resolveTokens(config.theme).dark.surface};`)
        expect(css).toContain('color-scheme: dark;')
        expect(css).not.toContain('color-scheme: light;')
    })

    it('declares color-scheme with every palette', () => {
        const [root, media, pinned] = themeCss(parseSiteConfig(minimal).theme).split('\n')
        expect(root).toContain('color-scheme: light;')
        expect(media).toContain('color-scheme: dark;')
        expect(pinned).toContain('color-scheme: dark;')
    })

    it('kebab-cases token names under the runtime --t- prefix (not Tailwind’s --color-)', () => {
        const css = themeCss(parseSiteConfig(minimal).theme)
        expect(css).toContain('--t-primary-content:')
        expect(css).toContain('--t-surface-alt:')
        expect(css).toContain('--t-text-muted:')
        expect(css).toContain('--t-font-display:')
        expect(css).not.toContain('--color-')
    })
})

describe('registrationEmbedUrl', () => {
    const origin = 'https://cloomba.com'

    it('carries both primaries and no theme in auto mode', () => {
        const config = parseSiteConfig({
            ...minimal,
            theme: { light: { primary: '#1F7A4D' }, dark: { primary: '#5fd39a' } },
        })
        const url = new URL(registrationEmbedUrl(config, origin))
        expect(url.origin + url.pathname).toBe('https://cloomba.com/embed/e/demo-conf')
        expect(url.searchParams.get('accent')).toBe('#1f7a4d')
        expect(url.searchParams.get('accent_dark')).toBe('#5fd39a')
        expect(url.searchParams.has('theme')).toBe(false)
    })

    it('pins the theme when the site pins a mode', () => {
        const config = parseSiteConfig({ ...minimal, theme: { mode: 'light' } })
        expect(new URL(registrationEmbedUrl(config, origin)).searchParams.get('theme')).toBe('light')
    })

    it('expands #rgb and leaves out a primary the embed cannot take', () => {
        const config = parseSiteConfig({
            ...minimal,
            theme: { light: { primary: '#0a5' }, dark: { primary: 'oklch(0.7 0.1 150)' } },
        })
        const url = new URL(registrationEmbedUrl(config, origin))
        expect(url.searchParams.get('accent')).toBe('#00aa55')
        expect(url.searchParams.has('accent_dark')).toBe(false)
    })
})
