import { useT } from '@/lib/site'

// Light/dark toggle for `mode: auto` sites. First click pins the opposite of
// the effective theme; the choice persists in localStorage and the root
// route's head script re-applies it before paint. Which icon shows is pure
// CSS (global.css, `#theme-toggle`), so the server's HTML is already right.

const toggleTheme = () => {
    const root = document.documentElement
    const effective = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    const next = effective === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    try {
        localStorage.setItem('theme', next)
    } catch {
        // Private mode / blocked storage — the choice lasts for this page view.
    }
}

export function ThemeToggle() {
    const { t } = useT()
    return (
        <button
            id='theme-toggle'
            type='button'
            onClick={toggleTheme}
            className='flex size-9 items-center justify-center rounded-card text-text-muted hover:bg-surface-alt hover:text-text'
            aria-label={t('a11y.toggle_theme')}
        >
            {/* Sun — shown while dark is effective (click → light). */}
            <svg className='icon-sun size-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <circle cx='12' cy='12' r='4'></circle>
                <path
                    strokeLinecap='round'
                    d='M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'
                ></path>
            </svg>
            {/* Moon — shown while light is effective (click → dark). */}
            <svg className='icon-moon size-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z'
                ></path>
            </svg>
        </button>
    )
}
