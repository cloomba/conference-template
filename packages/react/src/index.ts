// @cloomba/react — deliberately anemic React bindings. Every hook is a thin
// adapter over @cloomba/core; if one grows past a few lines, the logic moves
// to core (see CLAUDE.md). Data fetching stays in the app's islands.

import { computeNowNext, type AgendaSlot, type NowNext } from '@cloomba/core'
import { useEffect, useState } from 'react'

// Live now/next over a (static or freshly fetched) slot list. Recomputes
// exactly at the next agenda boundary rather than on a dumb interval, so the
// display flips the second a session starts or ends.
export const useNowNext = (slots: AgendaSlot[]): NowNext => {
    const [value, setValue] = useState<NowNext>(() => computeNowNext(slots, new Date()))

    useEffect(() => {
        const recompute = () => setValue(computeNowNext(slots, new Date()))
        recompute()
        const boundary = computeNowNext(slots, new Date()).nextBoundaryAt
        if (!boundary) return
        // +1s of slack so the clock is safely past the boundary when we wake.
        const timer = setTimeout(recompute, Math.max(1000, boundary.getTime() - Date.now() + 1000))
        return () => clearTimeout(timer)
    }, [slots, value.nextBoundaryAt])

    return value
}
