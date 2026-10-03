import { useT } from '@/lib/site'

import { SiteLink } from './SiteLink'

interface Props {
    title: string
    href?: string
    linkLabel?: string
}

export function SectionHeading({ title, href, linkLabel }: Props) {
    const { t } = useT()
    return (
        <div className='mb-8 flex items-baseline justify-between gap-4'>
            <h2 className='font-display text-2xl font-semibold tracking-tight sm:text-3xl'>{title}</h2>
            {href && (
                <SiteLink href={href} className='group text-sm text-primary hover:underline'>
                    {linkLabel ?? t('common.see_all')}{' '}
                    <span className='inline-block transition-transform motion-safe:group-hover:translate-x-0.5'>→</span>
                </SiteLink>
            )}
        </div>
    )
}
