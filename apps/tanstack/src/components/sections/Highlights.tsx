import { Html } from '@/components/ui/Html'
import { SiteLink } from '@/components/ui/SiteLink'
import { useT } from '@/lib/site'
import type { ContentBlock } from '@/lib/views'
import type { ContentData } from '@/server/content'

// Alternating [image][text] / [text][image] splits from
// src/content/highlights/ — even entries put the image left, odd right.
export function Highlights({ highlights }: { highlights: ContentBlock<ContentData<'highlights'>>[] }) {
    const { t } = useT()
    if (highlights.length === 0) return null
    return (
        <section className='mx-auto max-w-5xl space-y-16 px-4 py-14'>
            {highlights.map((entry, index) => (
                <div key={entry.id} className='grid items-center gap-8 md:grid-cols-2'>
                    <img
                        draggable={false}
                        src={entry.data.image}
                        alt={entry.data.image_alt}
                        className={`w-full rounded-card object-cover ${index % 2 === 1 ? 'md:order-2' : ''}`}
                        loading='lazy'
                    />
                    <div>
                        <h3 className='font-display text-2xl font-semibold tracking-tight'>{entry.data.title}</h3>
                        <Html html={entry.html} className='prose-content mt-3 text-text-muted' />
                        {entry.data.cta_href && (
                            <SiteLink
                                href={entry.data.cta_href}
                                className='mt-4 inline-block rounded-card border border-text/15 px-5 py-2.5 font-medium transition-colors hover:bg-surface-alt'
                            >
                                {entry.data.cta_label ?? t('common.learn_more')}
                            </SiteLink>
                        )}
                    </div>
                </div>
            ))}
        </section>
    )
}
