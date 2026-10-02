// HTML the server rendered from markdown (renderMarkdown / renderContent) —
// the organizer's own text and the site's own content, never visitor input.

interface Props {
    html: string
    className?: string
}

export function Html({ html, className }: Props) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
