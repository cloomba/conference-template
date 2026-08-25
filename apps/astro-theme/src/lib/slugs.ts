// Readable URLs for generated detail pages. Slugs are WRITE-ONLY: every
// [slug] page receives its object via getStaticPaths props, so nothing ever
// parses a hash back out — the readable prefix is pure cosmetics.

const slugify = (value: string): string =>
    value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60)

export const detailSlug = (title: string | null, hash: string): string => {
    const readable = slugify(title ?? '')
    return readable ? `${readable}-${hash}` : hash
}

export const sessionPath = (session: { title: string; hash: string }): string =>
    `/sessions/${detailSlug(session.title, session.hash)}`

export const speakerPath = (speaker: { name: string | null; hash: string }): string =>
    `/speakers/${detailSlug(speaker.name, speaker.hash)}`
