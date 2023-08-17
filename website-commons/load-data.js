export const CACHE_VERSION = 1;
const EMOJI_CACHE_NAME = `cache-v${CACHE_VERSION}`
const cache = await caches.open(EMOJI_CACHE_NAME);
console.log('hello')
/**
 * Loads using get from network or cache  a json asset and returns the response as a data object
 * @param assetPath
 * @returns {Promise<any>}
 */
export async function loadData(assetPath) {
    const options = {
        method: "GET",
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
    }
    const request = new Request(assetPath, options)
    const matchOptions = {
        ignoreVary: true, // ignore differences in Headers
        ignoreMethod: true, // ignore differences in HTTP methods
        ignoreSearch: true // ignore differences in query strings
    }

    let response = await cache.match(request, matchOptions);
    if (response) {
        return response.json();
    } else {
        await cache.add(request);
        response = await cache.match(request, matchOptions);
        return response.json();
    }
}
