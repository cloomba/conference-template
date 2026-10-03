// Color math for the theme: hex ↔ OKLCH and WCAG contrast. Used by config.ts at
// build time to derive the neutral tokens from the primary — no dependency, and
// nothing here ships to the browser unless an island imports it.

export interface Oklch {
    l: number
    c: number
    h: number
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

// '#ABC' → '#aabbcc'. Anything that isn't #rgb / #rrggbb (named colors, rgb(),
// oklch(), …) → null: the template doesn't parse every CSS color, it just
// doesn't derive from one it can't read.
export const normalizeHex = (value: string): string | null => {
    const v = value.trim()
    if (!HEX.test(v)) return null
    const digits = v.slice(1).toLowerCase()
    return `#${digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits}`
}

const channels = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
]

const toLinear = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

const toByte = (linear: number): string => {
    const c = Math.min(1, Math.max(0, linear))
    const gamma = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
    return Math.round(gamma * 255)
        .toString(16)
        .padStart(2, '0')
}

// Björn Ottosson's OKLab matrices (the ones CSS Color 4 specifies). Hue in degrees.
export const hexToOklch = (hex: string): Oklch => {
    const [r, g, b] = channels(hex).map(toLinear) as [number, number, number]
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    const h = (Math.atan2(bb, a) * 180) / Math.PI
    return { l: L, c: Math.hypot(a, bb), h: h < 0 ? h + 360 : h }
}

// Out-of-gamut channels are clipped — fine for the low chromas the theme asks for.
export const oklchToHex = ({ l: L, c, h }: Oklch): string => {
    const a = c * Math.cos((h * Math.PI) / 180)
    const b = c * Math.sin((h * Math.PI) / 180)
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
    const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193381 * s
    const bl = -0.0041960771 * l - 0.7034186147 * m + 1.707614701 * s
    return `#${toByte(r)}${toByte(g)}${toByte(bl)}`
}

const luminance = (hex: string): number => {
    const [r, g, b] = channels(hex).map(toLinear) as [number, number, number]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// WCAG 2 contrast ratio, 1–21.
export const contrastRatio = (a: string, b: string): number => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
    return (hi + 0.05) / (lo + 0.05)
}
