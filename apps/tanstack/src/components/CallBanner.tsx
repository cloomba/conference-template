import { SiteLink } from './ui/SiteLink'

// A call-to-action banner under a listing page (call for papers on
// /speakers, call for sponsors on /sponsors). A call open on Cloomba shows for as
// long as it is open and links there. The site's own pages are gated with the
// server's `callsOpen()` — those banners retire close to the event.

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
                className='rounded-card bg-primary px-5 py-2.5 font-medium text-primary-content transition hover:opacity-90 hover:shadow-md hover:shadow-primary/25 motion-safe:hover:-translate-y-0.5'
            >
                {label}
            </SiteLink>
        </div>
    )
}
