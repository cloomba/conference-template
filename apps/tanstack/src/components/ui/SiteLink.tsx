import { Link } from '@tanstack/react-router'
import type { AnchorHTMLAttributes } from 'react'

// One link for every href the site renders — config nav, markdown CTAs,
// section buttons. Pages of this site navigate in-app (no reload); files
// (/agenda.ics), other sites and mailto: stay plain anchors.

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

const isPagePath = (href: string): boolean => {
    if (!href.startsWith('/') || href.startsWith('//')) return false
    const lastSegment = href.split(/[?#]/)[0].split('/').pop() ?? ''
    return !/\.[a-z0-9]+$/i.test(lastSegment)
}

export function SiteLink({ href, ...rest }: Props) {
    if (!isPagePath(href)) return <a href={href} {...rest} />
    const [path, hash] = href.split('#')
    // Config and markdown hrefs are runtime strings, so they can't be checked
    // against the route tree — an unknown path lands on the not-found page.
    return <Link to={path as '/'} hash={hash} {...rest} />
}
