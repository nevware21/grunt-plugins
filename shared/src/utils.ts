/// <reference types="grunt" />
/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

export function isUndefined(value: any) {
    return value == "undefined" || typeof value === "undefined";
}

export function isNullOrUndefined(value:  any) {
    return value === null || isUndefined(value);
}

export function isPromiseLike<T>(value: any): value is PromiseLike<T> {
    return value && isFunction(value.then);
}

export function isPromise<T>(value: any): value is Promise<T> {
    return isPromiseLike(value) && isFunction((value as any).catch);
}

export function isString(value: any): value is string {
    return typeof value === "string";
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(value: any): value is Function {
    return typeof value === "function";
}

export function getGruntMultiTaskOptions<T>(grunt: IGrunt, theTask: grunt.task.IMultiTask<T>) {
    let taskOptions = theTask.data as T;

    if (!taskOptions) {
        taskOptions = (grunt.config.getRaw(theTask.name + "." + theTask.target) || {}) as T;
    }

    return taskOptions;
}

export function resolveValue<T>(value1?: T, value2?: T, defaultValue?: T) {
    let value = value1;

    if (isUndefined(value)) {
        value = value2;
    }
    
    if (isUndefined(value)) {
        value = defaultValue;
    }

    return value;
}

export function deepMerge<T>(target: T, src: T): T {
    let newValue = Object.assign({}, target, src);

    if (target && src) {
        Object.keys(target).forEach((key) => {
            // Any existing src[key] value would have been assigned over the target[key] version
            /* eslint-disable security/detect-object-injection */
            if (src[key] !== undefined) {
                if (Array.isArray(newValue[key])) {
                    target[key].forEach((value: any) => {
                        newValue[key].push(value);
                    });
                } else if (typeof newValue[key] === "object") {
                    // Make sure we merge all properties
                    newValue[key] = deepMerge(newValue[key], target[key]);
                }
            }
            /* eslint-enable security/detect-object-injection */
        });
    }

    return newValue;
}

export function mergeOptions<T>(value1?: T, value2?: T, value3?: T): T {
    let result;

    if (!isNullOrUndefined(value3)) {
        result = Object.assign(result || {}, value3)
    }

    if (!isNullOrUndefined(value2)) {
        result = Object.assign(result || {}, value2)
    }

    if (!isNullOrUndefined(value1)) {
        result = Object.assign(result || {}, value1)
    }

    return result;
}

/**
 * Returns string representation of an object suitable for diagnostics logging.
 */
 export function dumpObj(object: any, format?: boolean | number): string {
    const objectTypeDump: string = Object.prototype.toString.call(object);
    let propertyValueDump = "";
    if (objectTypeDump === "[object Error]") {
        propertyValueDump = "{ stack: '" + object.stack + "', message: '" + object.message + "', name: '" + object.name + "'";
    } else {
        if (format) {
            if (typeof format === "number") {
                propertyValueDump = JSON.stringify(object, null, format);
            } else {
                propertyValueDump = JSON.stringify(object, null, format ? 4 : 0);
            }
        } else {
            propertyValueDump = JSON.stringify(object);
        }
    }

    return objectTypeDump + propertyValueDump;
}
