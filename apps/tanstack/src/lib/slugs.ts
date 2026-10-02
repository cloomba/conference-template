// Readable URLs for generated detail pages: `<readable-title>-<hash>`. A
// detail route matches its object by comparing the WHOLE slug against
// detailSlug() of each candidate — nothing parses a hash back out, so the
// readable prefix stays pure cosmetics.

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
