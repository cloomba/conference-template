import type { SectionName } from '@cloomba/core'
import { createFileRoute } from '@tanstack/react-router'
import { Fragment, type ReactNode } from 'react'

import { About } from '@/components/sections/About'
import { AgendaPreview } from '@/components/sections/AgendaPreview'
import { Cta } from '@/components/sections/Cta'
import { Faq } from '@/components/sections/Faq'
import { Features } from '@/components/sections/Features'
import { Hero } from '@/components/sections/Hero'
import { Highlights } from '@/components/sections/Highlights'
import { News } from '@/components/sections/News'
import { Speakers } from '@/components/sections/Speakers'
import { Sponsors } from '@/components/sections/Sponsors'
import { Stats } from '@/components/sections/Stats'
import { Team } from '@/components/sections/Team'
import { Tickets } from '@/components/sections/Tickets'
import { Venue } from '@/components/sections/Venue'
import { JsonLd } from '@/components/ui/JsonLd'
import { pageHead, siteOf } from '@/lib/head'
import { useSite } from '@/lib/site'
import { getHome } from '@/server/functions'

type Home = Awaited<ReturnType<typeof getHome>>

// The whole "reorder sections" feature: config.sections is both presence and
// order, this map is the only wiring.
const SECTIONS: Record<SectionName, (home: Home) => ReactNode> = {
    hero: (home) => <Hero event={home.event} />,
    stats: (home) => <Stats stats={home.stats} />,
    about: (home) => <About teaserHtml={home.aboutHtml} />,
    features: (home) => <Features features={home.features} />,
    agenda: (home) => <AgendaPreview agenda={home.agenda} />,
    speakers: (home) => <Speakers speakers={home.speakers} />,
    highlights: (home) => <Highlights highlights={home.highlights} />,
    sponsors: (home) => <Sponsors tiers={home.sponsorTiers} />,
    team: (home) => <Team hosts={home.hosts} />,
    tickets: (home) => <Tickets tiers={home.tiers} />,
    venue: (home) => <Venue location={home.event.location} />,
    faq: (home) => <Faq faq={home.faq} />,
    news: (home) => <News news={home.news} />,
    cta: (home) => <Cta event={home.event} />,
}

export const Route = createFileRoute('/')({
    loader: () => getHome(),
    head: ({ matches, loaderData }) => pageHead(siteOf(matches), { path: '/', ogImage: loaderData?.event.cover_url }),
    component: Home,
})

function Home() {
    const home = Route.useLoaderData()
    const { config } = useSite()
    return (
        <>
            <JsonLd text={home.jsonLd} />
            {config.sections.map((name) => (
                <Fragment key={name}>{SECTIONS[name](home)}</Fragment>
            ))}
        </>
    )
}
