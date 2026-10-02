import { SectionHeading } from '@/components/ui/SectionHeading'
import { SiteLink } from '@/components/ui/SiteLink'
import { useT } from '@/lib/site'
import type { NewsTeaser } from '@/lib/views'

export function News({ news }: { news: NewsTeaser[] }) {
    const { t } = useT()
    if (news.length === 0) return null

    return (
        <section className='mx-auto max-w-5xl px-4 py-14'>
            <SectionHeading title={t('nav.news')} href='/news' linkLabel={t('news.all')} />
            <ul className='grid gap-6 sm:grid-cols-3'>
                {news.map((post) => (
                    <li key={post.id}>
                        <SiteLink
                            href={`/news/${post.id}`}
                            className='group block rounded-card border border-text/10 p-5'
                        >
                            <time className='text-sm text-text-muted'>{post.dateLabel}</time>
                            <h3 className='mt-2 font-medium group-hover:text-primary'>{post.title}</h3>
                            {post.description && <p className='mt-2 text-sm text-text-muted'>{post.description}</p>}
                        </SiteLink>
                    </li>
                ))}
            </ul>
        </section>
    )
}
