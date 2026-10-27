import { useT } from '@/lib/site'

// What a page shows while Cloomba has nothing for it yet (no sessions, no
// speakers): one line, in the bordered card the Stats row uses.
export function ComingSoon() {
    const { t } = useT()
    return (
        <p className='rounded-card border border-text/10 p-8 text-center text-text-muted'>{t('common.coming_soon')}</p>
    )
}
