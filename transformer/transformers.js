//@ts-check

export * from './operators/index.js';



/**
 * // API:
 * 
 * const transformer = transform(options).appendSteps([
 *   withJSONSource(contextKey1, startingData),
 *   withCache('cacheName1'),
 *   tryStep('title', (data, stepIndex)=>{
 *     // body
 *     // return data
 *   }),
 *   withSQLSource(contextKey2, connection, query)
 *   tryStep('title', async (data, stepIndex)=>{
 *     // await body
 *     // return data or promise
 *   }),
 *   tryStep('title', async (data, stepIndex)=>{
 *     const {contextKey1, contextKey2} = data;
 *     // await body
 *     // return data or promise
 *   }),
 *   withCache('cacheName2'),
 * ])
 * 
 * 
 * // to run, do:
 * transformer.run(2, null); // from 2 to end
 * // or
 * transformer.run(5); // from start to 5
 * // or
 * transformer.run(-5); // from start to (end - 5)
 * // or
 * transformer.run(); // from start to end
 */

/**
 * 
 */







/** @typedef {(...data: any[])=>void} LoggingFunction */
/** @typedef {{log: LoggingFunction, warn: LoggingFunction}} UtilDelegates */


const defaultOptions = {
    title: '',
    indentLv: 0,
    isLogErrors: true,
    isLogSteps: true,
    stopWhenError: true,
    onError(err, stepIndex, stepTitle, options) {
        if (options.isLogErrors) {
            if (options.title) options.warn(options.title);
            options.warn(`${this.indent}(step-${stepIndex}) ERR: ${stepTitle}`);
            options.warn(this.tailData(2));
        }
        if (options.stopWhenError) throw err;

        return '';
    },
    /** @type {LoggingFunction} */ logDelegate: console.log,
    /** @type {LoggingFunction} */ warnDelegate: console.warn,
};


/** @typedef {(transformer:Transformer, stepIndex:number, utils: UtilDelegates) => any | Promise<any>} StepCallback */
/** @typedef {readonly [title: string, run: StepCallback]} Step */

export const transform = (/** @type {Partial<defaultOptions>} */params) => {
    return new Transformer(params);
};
class Transformer {
    /** @type {typeof defaultOptions} */ options;

    /** @type {number} counts the current step index, stateful across function calls */
    stepIndex = 0;
    /** @type {Step[]} list of registered steps. can change object state */
    steps = [];

    data = {};

    /** @type {string} stores a string of space characters for indent */
    _indentCache = null

    constructor(/** @type {Partial<defaultOptions>} */options = {}) {
        this.options = { ...defaultOptions, ...options };
    }

    get result() {
        return this.data;
    }
    get indent() {
        if (this._indentCache == null) {
            this._indentCache = Array(this.options.indentLv).fill(' ').join('');
        }
        return this._indentCache;
    }

    appendSteps(/** @type {Step[]} */ stepsList) {
        this.steps = [...this.steps, ...stepsList];
        return this;
    }

    async run(a, b) {
        const [start, end] = (() => {
            if (a === undefined && b === undefined) {
                return [0, null];
            } else if (b === undefined) {
                return [0, 5];
            } else {
                return [a, b];
            }
        })();

        return this.runSteps();
    }

    async runSteps() {
        for (let stepIndex = 0; stepIndex < this.steps.length; stepIndex++) {
            const [stepTitle, runStep] = this.steps[stepIndex];


            const utils = {
                log: this.options.logDelegate,
                warn: this.options.warnDelegate,
            };

            let result = runStep(this, stepIndex, utils);
            if (result instanceof Promise) {
                result = await result;
            }
            this.data = result;
        }

        return this;
    }
}


