import { Html } from '@/components/ui/Html'
import { SiteLink } from '@/components/ui/SiteLink'
import { useT } from '@/lib/site'

// Home teaser: the description's FIRST paragraph (rendered on the server) as
// an [image][text] split, linking to the full /about page.
export function About({ teaserHtml }: { teaserHtml: string | null }) {
    const { t } = useT()
    if (!teaserHtml) return null
    return (
        <section className='mx-auto max-w-5xl px-4 py-14'>
            <div className='grid items-center gap-8 md:grid-cols-2'>
                <img
                    draggable={false}
                    src='/placeholders/venue.svg'
                    alt=''
                    className='w-full rounded-card object-cover'
                    loading='lazy'
                />
                <div>
                    <h2 className='font-display text-2xl font-semibold tracking-tight sm:text-3xl'>
                        {t('about.heading')}
                    </h2>
                    <Html html={teaserHtml} className='prose-content mt-3 text-text-muted' />
                    <SiteLink
                        href='/about'
                        className='mt-4 inline-block rounded-card border border-text/15 px-5 py-2.5 font-medium transition-colors hover:bg-surface-alt'
                    >
                        {t('about.cta')}
                    </SiteLink>
                </div>
            </div>
        </section>
    )
}
