// The only server module routes import. Each export is a server function: on
// the server it runs the handler; in the browser the call becomes a request —
// to the live server ('server' mode) or to the JSON file the static build
// wrote for it ('static' mode). Handler bodies never reach the browser bundle,
// and neither does anything only they import (the key, the site config).

import { themeCss } from '@cloomba/core'
import { createServerFn } from '@tanstack/react-start'
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions'

import { withTrailingSlash } from '@/lib/head'
import { STATIC_MODE } from '@/lib/output-mode'
import type { Site } from '@/lib/site'
import { detailSlug, sessionPath } from '@/lib/slugs'
import type { AgendaPage, MarkdownPage, NewsPost, SessionPage, SpeakerPage } from '@/lib/views'

import { config } from './config'
import { getNews, getOrdered } from './content'
import { callsOpen, loadEvent, loadFeatured, loadSessions, loadSpeakers, loadTicketTypes } from './data'
import { browserBaseUrl, embedOrigin } from './env'
import { conferenceEventNode, jsonLdText, sessionEventNode } from './jsonld'
import { plainText, renderMarkdown } from './markdown'
import { footerColumns, headerLinks } from './nav'
import { GITHUB_ICON_PATH, socialLink } from './socials'
import { locale, strings } from './strings'
import {
    countDays,
    sessionWhen,
    toAgendaPage,
    toAgendaPreview,
    toEventSummary,
    toHost,
    toNewsTeaser,
    toPerson,
    toPublicTiers,
    toSponsorTiers,
} from './views'

// Static builds answer every call from the JSON file the prerender wrote; a
// server build calls live. A direct comparison (not a helper call) so the
// bundler folds it to a constant and drops the static middleware from a
// server build's browser code. Must be the LAST middleware on a function.
const middleware = import.meta.env.MODE === STATIC_MODE ? [staticFunctionMiddleware] : []

// Google Fonts is the one third-party the template may load, and only when
// the config asks for families.
const googleFontsHref = (families: string[]): string | null =>
    families.length
        ? `https://fonts.googleapis.com/css2?${families
              .map((family) => `family=${encodeURIComponent(family)}:wght@400;600;700`)
              .join('&')}&display=swap`
        : null

// Everything every page needs — the root route's loader.
export const getSite = createServerFn({ method: 'GET' })
    .middleware(middleware)
    .handler(async (): Promise<Site> => {
        const { api: _api, strings: _overrides, ...publicConfig } = config
        return {
            config: publicConfig,
            strings,
            locale,
            themeCss: themeCss(config.theme),
            googleFontsHref: googleFontsHref(config.theme.fonts.google),
            headerLinks: headerLinks(),
            footerColumns: footerColumns(),
            socials: config.socials.map(socialLink),
            githubIconPath: GITHUB_ICON_PATH,
            year: new Date().getFullYear(),
            browserBaseUrl,
            embedOrigin,
        }
    })

export const getHome = createServerFn({ method: 'GET' })
    .middleware(middleware)
    .handler(async () => {
        const [event, sessions, featured, ticketTypes] = await Promise.all([
            loadEvent(),
            loadSessions(),
            loadFeatured(),
            loadTicketTypes(),
        ])
        const ofKind = (kind: string) => featured.items.filter((entry) => entry.kind === kind)
        const speakers = ofKind('speaker')
        const sponsors = ofKind('sponsor')
        // The About teaser: the description's FIRST paragraph.
        const teaser = event.description?.split(/\n\s*\n/)[0] ?? null
        return {
            event: toEventSummary(event),
            stats: {
                speakers: speakers.length,
                talks: sessions.filter((session) => session.location !== null).length,
                sponsors: sponsors.length,
                days: countDays(sessions, event.timezone),
                confirmedGuests: event.guest_counts.confirmed.guests,
            },
            aboutHtml: teaser ? renderMarkdown(teaser) : null,
            agenda: toAgendaPreview(sessions, event.timezone),
            speakers: speakers.map(toPerson),
            sponsorTiers: toSponsorTiers(sponsors),
            hosts: ofKind('host').map(toHost),
            tiers: toPublicTiers(ticketTypes.items),
            features: getOrdered('features'),
            highlights: getOrdered('highlights'),
            faq: getOrdered('faq'),
            news: getNews().slice(0, 3).map(toNewsTeaser),
            // schema.org Event structured data — what Google builds event rich
            // results from (name, dates, venue, ticket offers, speakers).
            jsonLd: jsonLdText({
                '@context': 'https://schema.org',
                ...conferenceEventNode({
                    event,
                    speakers,
                    ticketTypes: ticketTypes.items,
                    description: plainText(event.description),
                }),
            }),
        }
    })

// Server functions that take a slug answer null for an unknown one; the
// route turns that into its not-found page.
const slugInput = (slug: string) => slug

export const getAgenda = createServerFn({ method: 'GET' })
    .middleware(middleware)
    .handler(async (): Promise<AgendaPage> => {
        const [event, sessions] = await Promise.all([loadEvent(), loadSessions()])
        return toAgendaPage(event, sessions)
    })

export const getSession = createServerFn({ method: 'GET' })
    .middleware(middleware)
    .validator(slugInput)
    .handler(async ({ data: slug }): Promise<SessionPage | null> => {
        const [event, sessions, speakers, ticketTypes] = await Promise.all([
            loadEvent(),
            loadSessions(),
            loadSpeakers(),
            loadTicketTypes(),
        ])
        const session = sessions.find((s) => detailSlug(s.title, s.hash) === slug)
        if (!session) return null
        return {
            title: session.title,
            when: sessionWhen(session, event.timezone),
            speakers: session.speakers.map(toPerson),
            descriptionHtml: session.description ? renderMarkdown(session.description) : null,
            // Sub-Event structured data: the talk, nested under the conference.
            // A session has no venue of its own — `session.location` is a room,
            // so the node takes the event's address (see jsonld.ts).
            jsonLd: jsonLdText({
                '@context': 'https://schema.org',
                ...sessionEventNode({
                    event,
                    session,
                    // The canonical path, trailing slash and all — the same value
                    // the page's <link rel='canonical'> carries.
                    path: withTrailingSlash(`/sessions/${slug}`),
                    speakers,
                    ticketTypes: ticketTypes.items,
                    description: plainText(session.description),
                }),
            }),
        }
    })

export const getSpeakers = createServerFn({ method: 'GET' })
    .middleware(middleware)
    .handler(async () => ({
        speakers: (await loadSpeakers()).map(toPerson),
        cfpOpen: await callsOpen(),
    }))

export const getSpeaker = createServerFn({ method: 'GET' })
    .middleware(middleware)
    .validator(slugInput)
    .handler(async ({ data: slug }): Promise<SpeakerPage | null> => {
        const [event, sessions, speakers] = await Promise.all([loadEvent(), loadSessions(), loadSpeakers()])
        const speaker = speakers.find((s) => detailSlug(s.name, s.hash) === slug)
        if (!speaker) return null
        const own = sessions.filter((session) => session.speakers.some((s) => s.hash === speaker.hash))
        return {
            name: speaker.name,
            headline: speaker.headline,
            image_url: speaker.image_url,
            link: speaker.link ? socialLink(speaker.link) : null,
            bioHtml: speaker.bio ? renderMarkdown(speaker.bio) : null,
            sessions: own.map((session) => ({
                hash: session.hash,
                title: session.title,
                when: sessionWhen(session, event.timezone),
                path: sessionPath(session),
            })),
            // Person structured data for search.
            jsonLd: jsonLdText({
                '@context': 'https://schema.org',
                '@type': 'Person',
                name: speaker.name ?? undefined,
                jobTitle: speaker.headline ?? undefined,
                image: speaker.image_url ?? undefined,
                ...(speaker.link ? { sameAs: [speaker.link] } : {}),
                ...(speaker.bio ? { description: speaker.bio } : {}),
            }),
        }
    })

export const getSponsors = createServerFn({ method: 'GET' })
    .middleware(middleware)
    .handler(async () => ({
        tiers: toSponsorTiers((await loadFeatured()).items.filter((entry) => entry.kind === 'sponsor')),
        callOpen: await callsOpen(),
    }))

// Registration runs INSIDE the Cloomba embed — the attendee signs in and pays
// on Cloomba; this site never touches auth, payments, or personal data.
export const getTickets = createServerFn({ method: 'GET' })
    .middleware(middleware)
    .handler(async () => ({
        tiers: toPublicTiers((await loadTicketTypes()).items),
        embedSrc: `${embedOrigin}/embed/e/${encodeURIComponent(config.event.slug)}`,
        embedScript: `${embedOrigin}/embed/embed.js`,
    }))

// The event's full description (markdown from Cloomba) — the home page shows
// only its first paragraph as a teaser. The organizing team ALWAYS renders
// here (no cutoff — unlike the call banners).
export const getAbout = createServerFn({ method: 'GET' })
    .middleware(middleware)
    .handler(async () => {
        const [event, featured] = await Promise.all([loadEvent(), loadFeatured()])
        return {
            descriptionHtml: event.description ? renderMarkdown(event.description) : null,
            hosts: featured.items.filter((entry) => entry.kind === 'host').map(toHost),
        }
    })

export const getNewsList = createServerFn({ method: 'GET' })
    .middleware(middleware)
    .handler(async () => getNews().map(toNewsTeaser))

export const getNewsPost = createServerFn({ method: 'GET' })
    .middleware(middleware)
    .validator(slugInput)
    .handler(async ({ data: slug }): Promise<NewsPost | null> => {
        const post = getNews().find((entry) => entry.id === slug)
        if (!post) return null
        return {
            title: post.data.title,
            description: post.data.description ?? null,
            dateLabel: toNewsTeaser(post).dateLabel,
            html: post.html,
        }
    })

// Custom pages: every markdown file in src/content/pages is a root-level page
// (travel.md → /travel). File routes win over this one, so a page can't
// shadow /agenda or /tickets.
export const getPage = createServerFn({ method: 'GET' })
    .middleware(middleware)
    .validator(slugInput)
    .handler(async ({ data: slug }): Promise<MarkdownPage | null> => {
        const page = getOrdered('pages').find((entry) => entry.id === slug)
        if (!page) return null
        return { title: page.data.title, description: page.data.description ?? null, html: page.html }
    })
