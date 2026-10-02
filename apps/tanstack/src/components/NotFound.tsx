import { Link } from '@tanstack/react-router'

import { useT } from '@/lib/site'

export function NotFound() {
    const { t } = useT()
    return (
        <div className='mx-auto max-w-5xl px-4 py-24 text-center'>
            <h1 className='font-display text-4xl font-bold tracking-tight'>{t('error.not_found_title')}</h1>
            <p className='mt-4 text-text-muted'>{t('error.not_found_body')}</p>
            <Link
                to='/'
                className='mt-8 inline-block rounded-card bg-primary px-6 py-3 font-medium text-primary-content transition-opacity hover:opacity-90'
            >
                {t('error.not_found_cta')}
            </Link>
        </div>
    )
}
