//@ts-check
import { insertValueToContext } from './utils.js';

const withValueSourceParams = {
    /** @type {string} */ stepTitle: null,
    /** @type {string} */ key: null,
    /** @type {import('./utils').Primitive} */ value: '',
};



/** 
 * @typedef {(params: Partial<withValueSourceParams>) => import('../transformers.js').Step} WithValueSource
 * @type {WithValueSource}
 */
export const withValueSource = (params) => {
    const { stepTitle, key, value } = { ...withValueSourceParams, ...params };

    /** @type {import('../transformers.js').StepCallback} */
    function applyValueSource(transformer, stepIndex, utils) {
        try {
            if (!!key) {
                return insertValueToContext(transformer.data, key, value);
            }
            return value;
        } catch (err) {
        }
        return transformer.data;
    }
    return [stepTitle, applyValueSource];
}