import { Html } from '@/components/ui/Html'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useT } from '@/lib/site'
import type { ContentBlock } from '@/lib/views'
import type { ContentData } from '@/server/content'

export function Faq({ faq }: { faq: ContentBlock<ContentData<'faq'>>[] }) {
    const { t } = useT()
    if (faq.length === 0) return null
    return (
        <section className='mx-auto max-w-5xl px-4 py-14'>
            <SectionHeading title={t('faq.title')} />
            <div className='max-w-3xl divide-y divide-text/10 overflow-hidden rounded-card border border-text/10'>
                {faq.map((entry) => (
                    <details
                        key={entry.id}
                        className='group [interpolate-size:allow-keywords] [&::details-content]:h-0 [&::details-content]:overflow-clip [&::details-content]:[transition:height_300ms_ease,content-visibility_300ms_allow-discrete] open:[&::details-content]:h-auto'
                    >
                        {/* Padding lives ON the summary so the whole row —
                            edges included — is the click target. */}
                        <summary className='flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium transition-colors hover:bg-surface-alt'>
                            {entry.data.question}
                            <span className='text-text-muted transition-transform group-open:rotate-45'>+</span>
                        </summary>
                        <Html html={entry.html} className='prose-content px-5 pb-4 text-text-muted' />
                    </details>
                ))}
            </div>
        </section>
    )
}
