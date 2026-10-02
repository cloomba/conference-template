import { STATIC_MODE } from './output-mode'

// A slug the static build didn't prerender has no JSON file, so the browser's
// server-function call for it fails. In a static build that IS "not found" —
// the loader turns null into the 404 page. On a server a failed call is a
// real error and stays one.
export const staticMissingAsNull = <T>(call: Promise<T | null>): Promise<T | null> =>
    import.meta.env.MODE === STATIC_MODE ? call.catch(() => null) : call
