import { SiteLink } from './ui/SiteLink'

// A call-to-action banner under a listing page (call for papers on
// /speakers, call for sponsors on /sponsors). Callers gate rendering with the
// server's `callsOpen()` — the banners retire close to the event.

interface Props {
    title: string
    body: string
    href: string
    label: string
}

export function CallBanner({ title, body, href, label }: Props) {
    return (
        <div className='mt-12 flex flex-wrap items-center justify-between gap-4 rounded-card border border-primary/30 bg-primary/5 p-6'>
            <div>
                <h2 className='font-display text-xl font-semibold'>{title}</h2>
                <p className='mt-1 text-sm text-text-muted'>{body}</p>
            </div>
            <SiteLink
                href={href}
                className='rounded-card bg-primary px-5 py-2.5 font-medium text-primary-content transition-opacity hover:opacity-90'
            >
                {label}
            </SiteLink>
        </div>
    )
}
