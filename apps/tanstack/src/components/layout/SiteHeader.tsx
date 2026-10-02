import { Link } from '@tanstack/react-router'
import { useRef } from 'react'

import { SiteLink } from '@/components/ui/SiteLink'
import { useSite, useT } from '@/lib/site'

import { ThemeToggle } from './ThemeToggle'

export function SiteHeader() {
    const { config, headerLinks } = useSite()
    const { t } = useT()
    const menu = useRef<HTMLElement>(null)
    // Links navigate in-app, so nothing reloads the page to dismiss the menu.
    const closeMenu = () => menu.current?.hidePopover()

    return (
        <header className='sticky top-0 z-40 bg-surface/90 backdrop-blur'>
            <div className='mx-auto flex h-14 max-w-5xl items-center gap-6 px-4'>
                <Link to='/' className='flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight'>
                    {config.site.logo && <img draggable={false} src={config.site.logo} alt='' className='h-7 w-auto' />}
                    {config.site.name}
                </Link>
                {/* Right side as ONE wrapper so ml-auto works with the desktop nav hidden. */}
                <div className='ml-auto flex items-center gap-2'>
                    <nav className='hidden items-center gap-5 text-sm sm:flex'>
                        {headerLinks.map((link) => (
                            <SiteLink
                                key={link.href}
                                href={link.href}
                                className='text-text-muted transition-colors hover:text-text'
                            >
                                {link.label}
                            </SiteLink>
                        ))}
                    </nav>
                    {config.theme.mode === 'auto' && <ThemeToggle />}
                    {/* Native popover: light-dismiss (outside click / Esc) with no
                        state to manage. Fixed position works because the header is
                        sticky. */}
                    <button
                        type='button'
                        popoverTarget='mobile-menu'
                        className='flex size-9 cursor-pointer items-center justify-center rounded-card hover:bg-surface-alt sm:hidden'
                        aria-label={t('a11y.menu')}
                    >
                        <svg className='size-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                            <path strokeLinecap='round' d='M4 7h16M4 12h16M4 17h16'></path>
                        </svg>
                    </button>
                    <nav
                        ref={menu}
                        id='mobile-menu'
                        popover=''
                        className='fixed inset-auto right-4 top-14 m-0 w-48 rounded-card border border-text/10 bg-surface py-2 shadow-lg'
                    >
                        {headerLinks.map((link) => (
                            <SiteLink
                                key={link.href}
                                href={link.href}
                                onClick={closeMenu}
                                className='block px-4 py-2 text-sm text-text-muted hover:bg-surface-alt hover:text-text'
                            >
                                {link.label}
                            </SiteLink>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    )
}
