import { Html } from '@/components/ui/Html'
import type { ContentBlock } from '@/lib/views'
import type { ContentData } from '@/server/content'

// Three-up feature cards from src/content/features/.
export function Features({ features }: { features: ContentBlock<ContentData<'features'>>[] }) {
    if (features.length === 0) return null
    return (
        <section className='mx-auto max-w-5xl px-4 py-14'>
            <ul className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {features.map((entry) => (
                    <li key={entry.id} className='rounded-card border border-text/10 p-6'>
                        {entry.data.icon && <span className='text-3xl'>{entry.data.icon}</span>}
                        <h3 className='mt-3 font-display text-lg font-semibold'>{entry.data.title}</h3>
                        <Html html={entry.html} className='prose-content mt-2 text-sm text-text-muted' />
                    </li>
                ))}
            </ul>
        </section>
    )
}
