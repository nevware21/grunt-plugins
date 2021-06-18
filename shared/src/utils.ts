/// <reference types="grunt" />
/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import { getRandomHex } from "./random";

export function isUndefined(value: any) {
    return value === undefined || typeof value === 'undefined';
}

export function isPromiseLike<T>(value: any): value is PromiseLike<T> {
    return value && typeof value.then === "function";
}

export function isPromise<T>(value: any): value is Promise<T> {
    return isPromiseLike(value) && typeof (value as any).catch === "function";
}

export function isString(value: any): value is string {
    return typeof value === "string";
}

export function getGruntMultiTaskOptions<T>(grunt: IGrunt, theTask: grunt.task.IMultiTask<T>) {
    let taskOptions = theTask.data as T;

    if (!taskOptions) {
        taskOptions = (grunt.config.getRaw(theTask.name + '.' + theTask.target) || {}) as T;
    
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

/**
 * Returns string representation of an object suitable for diagnostics logging.
 */
 export function dumpObj(object: any): string {
    const objectTypeDump: string = Object.prototype.toString.call(object);
    let propertyValueDump: string = "";
    if (objectTypeDump === "[object Error]") {
        propertyValueDump = "{ stack: '" + object.stack + "', message: '" + object.message + "', name: '" + object.name + "'";
    } else {
        propertyValueDump = JSON.stringify(object);
    }

    return objectTypeDump + propertyValueDump;
}
