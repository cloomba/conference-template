// schema.org structured data, as finished text from the server
// (src/server/jsonld.ts — `<` already escaped).
export function JsonLd({ text }: { text: string }) {
    return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: text }} />
}
