import { Html } from '@/components/ui/Html'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { ContentBlock } from '@/lib/views'
import type { ContentData } from '@/server/content'

// Numbers you write yourself, from src/content/figures/ — one row per file, in
// the Stats card: the file's title as the heading, its numbers, and its body as
// a note under them. The numbers wrap and center, so a row of three or five
// never leaves one stranded in a grid column.
export function Figures({ figures }: { figures: ContentBlock<ContentData<'figures'>>[] }) {
    if (figures.length === 0) return null
    return (
        <section className='mx-auto max-w-5xl space-y-12 px-4 py-14'>
            {figures.map((entry) => (
                <div key={entry.id}>
                    <SectionHeading title={entry.data.title} />
                    <dl className='flex flex-wrap justify-center gap-x-6 gap-y-8 rounded-card border border-text/10 p-8 text-center'>
                        {entry.data.items.map((item) => (
                            <div key={`${item.value} ${item.label}`} className='w-[calc(50%-0.75rem)] sm:w-40'>
                                <dd className='font-display text-4xl font-bold text-primary'>{item.value}</dd>
                                <dt className='mt-1 text-sm text-text-muted'>{item.label}</dt>
                            </div>
                        ))}
                    </dl>
                    {entry.html && (
                        <Html html={entry.html} className='prose-content mt-4 max-w-3xl text-sm text-text-muted' />
                    )}
                </div>
            ))}
        </section>
    )
}
