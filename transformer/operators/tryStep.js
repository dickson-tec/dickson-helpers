//@ts-check


/** @typedef {{stepIndex:number} & import("../transformers").UtilDelegates} TryStepContext */
/** @typedef {(data:any, context: TryStepContext) => any | Promise<any>} TryStepBody */

/** 
 * @typedef {(callback: TryStepBody) => import("../transformers").Step} TryStep
 * @typedef {(title: string, callback: TryStepBody) => import("../transformers").Step} TryStepWithStepTitle 
 * @type {(TryStep & TryStepWithStepTitle)}
 */
export const tryStep = (callbackOrTitle, nullOrCallback = null) => {
    /** @type {Parameters<TryStepWithStepTitle>} */
    const [stepTitle, callback] = ((_a, _b) => {
        if (typeof _a === 'string') return [_a, _b];
        return [null, _a];
    })(callbackOrTitle, nullOrCallback);

    /** @type {import("../transformers").StepCallback} */
    function applyTryStep(transformer, stepIndex, utils) {
        const { log } = utils;
        try {
            if (transformer.options.isLogSteps) log(`${transformer.indent}(${stepIndex}) ${stepTitle || 'tryStep'}`);
            const context = { stepIndex, ...utils };
            const newData = callback(transformer.data, context);

            return newData;
        } catch (err) {
            const newData = transformer.options.onError(err, stepIndex, stepTitle, transformer.options);
            return newData;
        }
    }

    return /** @type {const} */([stepTitle, applyTryStep]);
}