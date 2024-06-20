import { MTLNovel } from "./MTLNovel"
import { Source } from "./Source"
import { WebNovel } from "./WebNovel"

/**
 * The sources used to search for the novels
 */
export let sources = [new WebNovel(), new MTLNovel()]

/**
 * Get the corresponding source based on the URL
 */
export function getSourceFromURL(url: string): Source {
    if (url.includes('webnovel')) {
        return new WebNovel()
    } else if (url.includes('mtlnovel')) {
        return new MTLNovel()
    }
    return null
}

/**
 * Get the MTLNovel source
 */
export function getMTLNovelSource(): MTLNovel {
    return sources[1] as MTLNovel
}

/**
 * Get the WebNovel source
 */
export function getWebNovelSource(): WebNovel {
    return sources[0] as WebNovel
}