//@ts-check

// util
export const insertValueToContext = (context, key, value) => {
    if (typeof context === 'object') {
        context[key] = value;
        return context;
    }
    return {
        input: context,
        [key]: value,
    };
}

/** @typedef {string | number | boolean | BigInt} Primitive */
