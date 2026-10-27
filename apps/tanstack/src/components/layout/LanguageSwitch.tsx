import { languageLinks } from '@cloomba/core'
import { useLocation } from '@tanstack/react-router'

import { withTrailingSlash } from '@/lib/head'
import { useSite, useT } from '@/lib/site'

// The site's language builds (site.alternates): this one as plain text, the
// others as links to the same page on their own hostname. Plain anchors —
// another build is another site, so switching is a full page load, and the
// switch works on the static 404 page, which runs no JS.
export function LanguageSwitch() {
    const { config, locale } = useSite()
    const { t } = useT()
    const { pathname } = useLocation()
    if (config.site.alternates.length === 0) return null

    return (
        <nav aria-label={t('a11y.language')} className='flex items-center text-sm'>
            {languageLinks(config.site.alternates, locale, withTrailingSlash(pathname)).map((link) =>
                link.current ? (
                    <span
                        key={link.language}
                        lang={link.language}
                        aria-current='true'
                        className='px-1.5 py-1 font-semibold text-text'
                    >
                        {link.label}
                    </span>
                ) : (
                    <a
                        key={link.language}
                        href={link.href}
                        hrefLang={link.language}
                        lang={link.language}
                        className='px-1.5 py-1 text-text-muted transition-colors hover:text-text'
                    >
                        {link.label}
                    </a>
                )
            )}
        </nav>
    )
}
