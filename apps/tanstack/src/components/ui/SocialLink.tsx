import type { SocialIconLink } from '@/lib/site'

interface Props {
    link: SocialIconLink
    // Icon-only round button (footer / person rows).
    size?: 'sm' | 'md'
}

export function SocialLink({ link, size = 'md' }: Props) {
    return (
        <a
            href={link.href}
            rel='noopener'
            aria-label={link.title}
            title={link.title}
            className={`inline-flex items-center justify-center rounded-card text-text-muted transition-colors hover:bg-surface-alt hover:text-text ${size === 'sm' ? 'size-8' : 'size-9'}`}
        >
            <svg className={size === 'sm' ? 'size-4' : 'size-5'} viewBox='0 0 24 24' fill='currentColor'>
                <path d={link.path}></path>
            </svg>
        </a>
    )
}
