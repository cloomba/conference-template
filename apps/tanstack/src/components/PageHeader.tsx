import type { ReactNode } from 'react'

import { SiteLink } from './ui/SiteLink'

// The one page-title block, identical on EVERY page — top-level and detail:
// same container as the nav bar (max-w-5xl → the title sits under the logo),
// same type scale, same spacing, so navigating never moves or resizes the
// title. Detail pages pass `back`; extra header content rides in `children`,
// and a right-side element (e.g. a speaker avatar) in `aside`.

interface Props {
    title: string
    subtitle?: string
    back?: { href: string; label: string }
    aside?: ReactNode
    children?: ReactNode
}

export function PageHeader({ title, subtitle, back, aside, children }: Props) {
    return (
        <div className='mx-auto max-w-5xl px-4 pb-2 pt-10'>
            {back && (
                <SiteLink href={back.href} className='mb-3 inline-block text-sm text-primary hover:underline'>
                    ← {back.label}
                </SiteLink>
            )}
            <div className='flex items-start justify-between gap-6'>
                <div className='min-w-0'>
                    <h1 className='font-display text-3xl font-bold tracking-tight sm:text-4xl'>{title}</h1>
                    {subtitle && <p className='mt-2 text-sm text-text-muted'>{subtitle}</p>}
                    {children}
                </div>
                {aside}
            </div>
        </div>
    )
}
