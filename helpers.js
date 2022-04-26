//@ts-check
import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import * as readline from 'readline';

export const readLocalFile = (dir) => async (filename) => {
    return readFile(path.join(dir, filename));
};

export const readFile = async (filename) => {
    let fileHandle;
    try {
        fileHandle = await fsPromises.open(filename, 'r');
        let data = await fileHandle.readFile({
            encoding: 'utf8',
        });

        console.log(`readFile "${filename}" complete`);
        return data;
    } finally {
        if (fileHandle != null)
            await fileHandle.close();
    }
};

export const writeToNewFile = async (filename, content, silent = false) => {
    let fileHandle;
    try {
        fsPromises.mkdir(path.dirname(filename), { recursive: true });
        fileHandle = await fsPromises.open(filename, 'w+');
        await fileHandle.writeFile(content, { encoding: 'utf8' });
        if (!silent) console.log(`writeToNewFile "${filename}" complete`);
    } finally {
        if (fileHandle !== undefined)
            await fileHandle.close();
    }
};

export const clearFile = async (filename, silent = false) => {
    await writeToNewFile(filename, '', true);
    if (!silent) console.log(`clearFile "${filename}" complete`);
}

export const appendToFile = (filename, content, silent = false) => {
    fsPromises.mkdir(path.dirname(filename), { recursive: true });
    fs.appendFileSync(filename, content, { encoding: 'utf8' });
    if (!silent) console.log(`appendToFile "${filename}" complete`);
};

export const _logTeeAppendFile = (filename, silent = false) => (...args) => {
    if (!silent) console.log(...args);

    let content = args.length > 1 ? JSON.stringify(args, null, 4) : args[0];
    if (typeof content !== 'string') content = JSON.stringify(content, null, 4);
    appendToFile(filename, content + '\n', silent);
}


export const _exportJSON = (dir) => async (filename, obj) => {
    await writeToNewFile(path.join(dir, filename), JSON.stringify(obj, null, 2));
}

export const createDirIfNotExist = async (dir) => {
    const dirname = path.dirname(dir);
    if (!fs.existsSync(dirname)) {
        return fsPromises.mkdir(dirname, { recursive: true });
    }
}


export async function processLineByLine(path, silent, callback) {
    const fileStream = fs.createReadStream(path);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        if (!silent) console.log(`Line from file: ${line}`);
        await callback(line);
    }
}


export const sleep = async (ms, isSilent = false) => {
    if (!isSilent) console.log(`sleep ${ms}`);
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const doQuery = async (connection, query) => {
    let result;
    result = await new Promise((resolve, reject) => {
        connection.query(query, function (error, results, fields) {
            if (error) reject(error);
            resolve(results);
        });
    });
    return result;
}

const defaultTransformOptions = {
    title: '',
    indentLv: 0,
    isLogErrors: true,
    isLogSteps: true,
    stopWhenError: true,
    logger: console.log,
    warn: console.warn,
};
export const transform = (startingData, options = defaultTransformOptions) => {
    return {
        _i: 0,
        _data: [startingData],
        _indentCache: null,
        _cacheFolder: './',
        _cacheName: 'cache-%i.json',
        _cache: {
            index: 0,
        },
        options: {
            ...defaultTransformOptions,
            ...options,
        },
        get result() {
            return this._data[this._data.length - 1] ?? null;
        },
        get indent() {
            if (this._indentCache == null) {
                this._indentCache = Array(this.options.indentLv).fill(' ').join('');
            }
            return this._indentCache;
        },
        tailData(count = 2) {
            return this._data.slice(-count);
        },
        // withCache(folder, cacheName) {
        //     if (folder) this._cacheFolder = folder;
        //     if (cacheName) this._cacheName = cacheName;

        //     createDirIfNotExist();
        //     const cacheStatePath = path.join(this._cacheFolder, this._cacheName.replace('%i', '0'));
        //     fs.readFileSync()
        //     _exportJSON(this._cacheFolder)(this._cacheName.replace('%i', '0'), this._cache);
        // },
        // cache(title = '') {
        //     this._cacheFolder
        //     this._cacheName
        // },
        /**
         * @param {string | ((data:any, index:number)=>any) } callbackOrTitle
         * @param {(data:any, index:number)=>any} [nullOrCallback]
         */
        tryStep(callbackOrTitle, nullOrCallback) {
            const [stepTitle, callback] = ((_a, _b) => {
                if (typeof _a === 'string') return [_a, _b];
                return [null, _a];
            })(callbackOrTitle, nullOrCallback);

            try {
                if (this.options.isLogSteps) console.log(`${this.indent}(${this._i}) ${stepTitle}`);
                const newData = callback(this._data[this._i], this._i);

                this._data.push(newData);
                this._i++;
            } catch (err) {
                const newData = this.onError(err, this._i, stepTitle, this.options);
                this._data.push(newData);
                this._i++;
            }
            return this;
        },
        /**
         * @param {Error} err
         * @param {number} stepIndex
         * @param {string} stepTitle
         * @param {defaultTransformOptions} options
         * 
         * @return {any} default value, if user chose not to continue throwing
         */
        onError(err, stepIndex, stepTitle, options) {
            if (options.isLogErrors) {
                if (options.title) options.warn(options.title);
                options.warn(`${this.indent}(step-${stepIndex}) ERR: ${stepTitle}`);
                options.warn(this.tailData(2));
            }
            if (options.stopWhenError) throw err;

            return '';
        },
    };
}