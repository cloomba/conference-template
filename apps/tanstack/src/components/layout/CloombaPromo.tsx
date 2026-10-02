import { useSite, useT } from '@/lib/site'

// The band above the footer: this site is itself the pitch. Organizers who
// like what they see get the three doors — how it works, the code, the
// platform. Config-gated (`cloomba_promo` ships false — the demo opts in).
//
// The documentation pages are built by the Astro app only, so "how it works"
// points at the copy demo.cloomba.com publishes; with `cloomba_docs` off the
// door drops out.
const DOCS_URL = 'https://demo.cloomba.com/cloomba-for-conferences'

export function CloombaPromo() {
    const { config, githubIconPath } = useSite()
    const { t } = useT()
    return (
        <aside className='px-4'>
            <div className='mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 bg-primary/10 rounded-xl'>
                <p className='text-sm text-text-muted'>
                    <span className='font-medium text-text'>{t('promo.title')}</span>
                    <br />
                    {t('promo.body')}
                    <br />
                    {t('promo.tagline')}
                </p>
                <div className='flex flex-wrap gap-2'>
                    {config.cloomba_docs && (
                        <a
                            href={DOCS_URL}
                            className='rounded-card bg-primary px-4 py-2 text-sm font-medium text-primary-content transition-opacity hover:opacity-90'
                        >
                            {t('promo.how_it_works')}
                        </a>
                    )}
                    <a
                        href='https://github.com/cloomba/conference-template'
                        rel='noopener'
                        className='inline-flex items-center gap-2 rounded-card border border-text/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-alt'
                    >
                        <svg className='size-4' viewBox='0 0 24 24' fill='currentColor'>
                            <path d={githubIconPath}></path>
                        </svg>
                        {t('promo.github')}
                    </a>
                    <a
                        href='https://cloomba.com'
                        rel='noopener'
                        className='inline-flex items-center gap-2 rounded-card border border-text/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-alt'
                    >
                        <img draggable={false} src='/cloomba-mark.svg' alt='' className='size-4' />
                        {t('promo.cloomba')}
                    </a>
                </div>
            </div>
        </aside>
    )
}
