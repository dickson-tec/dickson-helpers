//@ts-check




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





export const transform = (params) => {

};


class Transformer {
    options = {
        title: '',
        logging: {
            indentLv: 0,
            isLogErrors: true,
            isLogSteps: true,
            stopWhenError: true,
            logger: console.log,
            warn: console.warn,
        },
    };

    /** @type {number} */ stepIndex = 0;
    /** @type {Step[]} */ steps = [];

    constructor(/** @type {Transformer['options']} */ params) {

    }

    appendSteps(/** @type {Step[]} */ stepsList) {
        this.steps = [...this.steps, ...stepsList];
    }

    run(a, b) {
        const [start, end] = (() => {
            if (a === undefined && b === undefined) {
                return [0, null];
            } else if (b === undefined) {
                return [0, 5];
            } else {
                return [a, b];
            }
        })();

        runSteps();
    }

    runSteps
}


/** @typedef {(data:any, stepIndex:number) => any | Promise<any>} StepCallback */
class Step {
    title = '';
    /** @type {StepCallback} */ run = () => null;

    constructor(
        title = '',
        /** @type {StepCallback} */ run,
    ) {
        this.title = title;
        this.run = run;
    }
}









export const tryStep = (callbackOrTitle, nullOrCallback) => {
    const [stepTitle, callback] = ((_a, _b) => {
        if (typeof _a === 'string') return [_a, _b];
        return [null, _a];
    })(callbackOrTitle, nullOrCallback);

    return new Step(stepTitle, (context, stepIndex) => {
        try {
            if (context.options.isLogSteps) console.log(`${context.indent}(${context._i}) ${stepTitle}`);
            const newData = callback(context._data[context._i], stepIndex);

            context._data.push(newData);
            context._i++;
        } catch (err) {
            const newData = context.onError(err, context._i, stepTitle, context.options);
            context._data.push(newData);
            context._i++;
        }
        return context;
    });
}


export const withCache = (cacheTitle = '') => (context, stepIndex) => {

    return context;
}