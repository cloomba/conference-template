import { describe, expect, it } from 'vitest'

import { DARK_DEFAULTS, parseSiteConfig, resolveTokens, themeCss } from '../src/config'

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

describe('resolveTokens', () => {
    it('overrides only what the organizer set; dark inherits its own defaults', () => {
        const config = parseSiteConfig({ ...minimal, theme: { light: { primary: '#ff0000' } } })
        const { light, dark } = resolveTokens(config.theme)
        expect(light.primary).toBe('#ff0000')
        expect(light.surface).toBe('#ffffff')
        expect(dark.primary).toBe(DARK_DEFAULTS.primary)
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
        expect(css).toContain(DARK_DEFAULTS.surface)
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
