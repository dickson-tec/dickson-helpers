//@ts-check
import { transform, tryStep, withValueSource } from './transformers.js';
import { sleep } from '../helpers.js';

async function main() {
    console.log('1');
    const transformer = await transform().appendSteps([
        withValueSource({ value: 'a' }),
        tryStep('aa', (data, { log }) => {
            return data + 'b';
        }),
        tryStep((data, { log }) => {
            return data + 'c';
        }),
        tryStep(async (data, { log }) => {
            await sleep(1000);

            return data + 'd';
        }),
        withValueSource({ key: 'input2', value: 'a' }),
        tryStep('aa', ({ input2, input }, { log }) => {
            return { input2, input1: input + 'E' };
        }),
    ]).run();
    console.log('6');

    console.log(transformer.result);
}

main();