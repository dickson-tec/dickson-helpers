# dickson-helpers


## File System Utility
|                             |                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| async `readLocalFile()`     | shortcut to write into certain directory                                                  |
| async `readFile()`          | `fsPromises.readFile` shortcut with logs                                                  |
| async `writeToNewFile()`    | `fsPromises.writeFile` shortcut with logs                                                 |
| async `clearFile()`         | Clear file content                                                                        |
| `appendToFile`              | Append content into file immediately                                                      |
| `_logTeeAppendFile`         | Generates a `log()` function that logs into console, while also appending into `filename` |
| async `_exportJSON`         | Write object into file, auto do `JSON.stringify`                                          |
| async `createDirIfNotExist` | Create Directory if not exists                                                            |
| async `processLineByLine`   | Reads file into stream, do callback for each line in the file                             |
| async `sleep`               | Shortcut for Promise setTimeout                                                           |
| async `doQuery`             | Promisify connection.query                                                                |
| `transform`                 | Data transformation utility with error logs                                               |

## Transform Utility
Wrap each step with `tryStep()` to inspect previous values before it breaks

Usage
```js
import { transform } from './helpers.js';

function main(obj) {
    const transformer = transform(obj.Body,
        {
            isLogSteps: false,
            stopWhenError: false,
            title: `Line ${i} ${obj.Subject}`
        }
    );
    transformer.onError = (err, stepIndex, stepTitle, options) => {
        if (options.isLogErrors) {
            console.log(`(step-${stepIndex}) ERR: ${stepTitle}`);
            console.log(transformer.tailData(2));
        }
        if (options.stopWhenError) throw err;

        return '';
    };

    transformer.tryStep('split by empty line',
        d => {
            /// body
        })
    transformer.tryStep('parse json',
        d => JSON.parse(d))

    // transformer.tryStep('intentional throw',
    //     d => { throw new Error('haha'); })

    return transformer.result;
}

```
