//@ts-check

const withCacheParams = {
    /** @type {string} */ stepTitle: null,
    cacheKey: null,
    contextKey: null,
};
/**
 * @typedef {(params: withCacheParams) => import("../transformers").Step} WithCache
 * @type {WithCache}
 */
export const withCache = (params) => {
    const { stepTitle, cacheKey, contextKey } = { ...withCacheParams, ...params };

    /** @type {import("../transformers").StepCallback} */
    function saveAndLoadCache(transformer, stepIndex, utils) {
        return transformer;
    }

    return [stepTitle, saveAndLoadCache];
}