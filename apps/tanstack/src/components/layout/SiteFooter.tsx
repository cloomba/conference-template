import { Link } from '@tanstack/react-router'
import type { CSSProperties } from 'react'

import { SiteLink } from '@/components/ui/SiteLink'
import { SocialLink } from '@/components/ui/SocialLink'
import { useSite, useT } from '@/lib/site'

export function SiteFooter() {
    const { config, footerColumns, socials, year } = useSite()
    const { t } = useT()

    return (
        <footer className='mt-20 bg-surface-alt'>
            <div className='mx-auto max-w-5xl px-4 py-12'>
                <div
                    className='grid gap-10 sm:grid-cols-[1.2fr_repeat(var(--cols),1fr)]'
                    style={{ '--cols': footerColumns.length } as CSSProperties}
                >
                    <div>
                        <Link
                            to='/'
                            className='flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight'
                        >
                            {config.site.logo && (
                                <img draggable={false} src={config.site.logo} alt='' className='h-7 w-auto' />
                            )}
                            {config.site.name}
                        </Link>
                        {config.site.description && (
                            <p className='mt-3 text-sm text-text-muted'>{config.site.description}</p>
                        )}
                        {socials.length > 0 && (
                            <div className='mt-4 flex gap-1'>
                                {socials.map((link) => (
                                    <SocialLink key={link.href} link={link} size='sm' />
                                ))}
                            </div>
                        )}
                    </div>
                    {footerColumns.map((column) => (
                        <nav key={column.title}>
                            <h3 className='text-sm font-semibold'>{column.title}</h3>
                            <ul className='mt-3 space-y-2 text-sm'>
                                {column.links.map((link) => (
                                    <li key={link.href}>
                                        <SiteLink href={link.href} className='text-text-muted hover:text-text'>
                                            {link.label}
                                        </SiteLink>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>
                <div className='mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-text/10 pt-6 text-sm text-text-muted'>
                    <p>
                        {t('footer.copyright', { year, site: config.site.name })}
                        {config.footer.text && <span> · {config.footer.text}</span>}
                    </p>
                    <a href='https://cloomba.com' className='hover:text-text' rel='noopener'>
                        {t('footer.powered_by')}
                    </a>
                </div>
            </div>
        </footer>
    )
}
