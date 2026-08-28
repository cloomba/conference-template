// Navigation derivation. When the config doesn't hand-pick links, they follow
// from the enabled sections plus custom pages that opted in via `nav`
// frontmatter — reordering sections reorders the nav too.

import { getCollection } from 'astro:content'

import { config } from './config'
import { t } from './strings'

export interface NavLink {
    label: string
    href: string
}

// Sections that have a page of their own worth linking from the nav.
export const SECTION_LINKS: Partial<Record<(typeof config.sections)[number], NavLink>> = {
    about: { label: t('nav.about'), href: '/about' },
    agenda: { label: t('nav.agenda'), href: '/agenda' },
    speakers: { label: t('nav.speakers'), href: '/speakers' },
    sponsors: { label: t('nav.sponsors'), href: '/sponsors' },
    tickets: { label: t('nav.tickets'), href: '/tickets' },
    news: { label: t('nav.news'), href: '/news' },
}

export const navPages = async (slot: 'header' | 'footer'): Promise<NavLink[]> => {
    const pages = await getCollection('pages', ({ data }) => data.nav === slot)
    return pages
        .sort((a, b) => a.data.order - b.data.order)
        .map((page) => ({ label: page.data.title, href: `/${page.id}` }))
}

export const headerLinks = async (): Promise<NavLink[]> => {
    if (config.header) return config.header.links
    const fromSections = config.sections.flatMap((section) => SECTION_LINKS[section] ?? [])
    return [...fromSections, ...(await navPages('header'))]
}

export interface FooterColumn {
    title: string
    links: NavLink[]
}

// Derived footer columns (config.footer.columns replaces them wholesale):
//   Explore — content sections;  Attend — practical links + custom footer
//   pages;  More — the Cloomba apps (tickets live there) + legal.
// Everything in More is opt-in, so a site that configures neither ends up with
// two columns rather than a column of links to someone else's site.
export const footerColumns = async (): Promise<FooterColumn[]> => {
    if (config.footer.columns) return config.footer.columns

    const explore = config.sections.flatMap((section) => (section === 'tickets' ? [] : (SECTION_LINKS[section] ?? [])))
    const attend: NavLink[] = [
        ...(config.sections.includes('tickets') ? [{ label: t('nav.tickets'), href: '/tickets' }] : []),
        ...(config.sections.includes('agenda') ? [{ label: t('nav.add_to_calendar'), href: '/agenda.ics' }] : []),
        ...(await navPages('footer')),
        ...(config.contact_email ? [{ label: t('nav.contact_us'), href: `mailto:${config.contact_email}` }] : []),
    ]
    const more: NavLink[] = [
        ...(config.footer.show_app_links
            ? [
                  { label: t('nav.ios_app'), href: 'https://apps.apple.com/app/cloomba' },
                  {
                      label: t('nav.android_app'),
                      href: 'https://play.google.com/store/apps/details?id=com.allwhitetown.cloomba',
                  },
              ]
            : []),
        // Only when the site has its own — a conference's footer must not link
        // someone else's privacy policy, so there is no default to fall back to.
        ...(config.footer.privacy_href ? [{ label: t('nav.privacy'), href: config.footer.privacy_href }] : []),
        ...(config.footer.terms_href ? [{ label: t('nav.terms'), href: config.footer.terms_href }] : []),
    ]

    return [
        { title: t('nav.column_explore'), links: explore },
        { title: t('nav.column_attend'), links: attend },
        { title: t('nav.column_more'), links: more },
    ].filter((column) => column.links.length > 0)
}
