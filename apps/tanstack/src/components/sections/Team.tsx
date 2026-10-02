import { SectionHeading } from '@/components/ui/SectionHeading'
import { SocialLink } from '@/components/ui/SocialLink'
import { useT } from '@/lib/site'
import type { Host } from '@/lib/views'

// The organizing team — featured entries with kind 'host'.
export function Team({ hosts }: { hosts: Host[] }) {
    const { t } = useT()
    if (hosts.length === 0) return null
    return (
        <section className='mx-auto max-w-5xl px-4 py-14'>
            <SectionHeading title={t('team.title')} />
            <ul className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {hosts.map((host) => (
                    <li key={host.hash} className='rounded-card border border-text/10 p-6'>
                        <div className='flex items-center gap-4'>
                            {host.image_url ? (
                                <img
                                    draggable={false}
                                    src={host.image_url}
                                    alt={host.name ?? ''}
                                    className='size-14 rounded-full object-cover'
                                />
                            ) : (
                                <div className='flex size-14 items-center justify-center rounded-full bg-surface-alt font-display text-xl text-text-muted'>
                                    {(host.name ?? '?').slice(0, 1)}
                                </div>
                            )}
                            <div className='min-w-0 flex-1'>
                                <h3 className='font-medium'>{host.name}</h3>
                                {host.headline && <p className='text-sm text-text-muted'>{host.headline}</p>}
                            </div>
                            {host.link && <SocialLink link={host.link} size='sm' />}
                        </div>
                        {host.bio && <p className='mt-4 text-sm text-text-muted'>{host.bio}</p>}
                    </li>
                ))}
            </ul>
        </section>
    )
}
