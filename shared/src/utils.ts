/// <reference types="grunt" />
/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import { arrForEach, isArray, isFunction, isNullOrUndefined, isUndefined, objAssign, objForEachKey } from "@nevware21/ts-utils";
import { IGruntWrapper } from "./shared-utils";
import { doAwaitResponse, IPromise } from "@nevware21/ts-async";

export function getGruntMultiTaskOptions<T>(grunt: IGruntWrapper, theTask: grunt.task.IMultiTask<T>) {
    let taskOptions = theTask.data as T;

    if (!taskOptions) {
        taskOptions = (grunt.config.getRaw(theTask.name + "." + theTask.target) || {}) as T;
    }

    return taskOptions;
}

function _resolveValue<T>(theValue?: T | IPromise<T> | (() => T | IPromise<T>)): T | IPromise<T> {
    if (isNullOrUndefined(theValue)) {
        return theValue as T;
    }

    if (isFunction(theValue)) {
        theValue = theValue();
    }

    return doAwaitResponse<T>(theValue, (response) => {
        if (response.rejected) {
            throw response.reason;
        }

        return response.value;
    });
}

export function resolveValueAsync<T>(value1?: T | IPromise<T> | (() => T | IPromise<T>), value2?: T | IPromise<T> | (() => T | IPromise<T>), defaultValue?: T): T | IPromise<T> {
    return doAwaitResponse<T>(_resolveValue(value1), (response) => {
        if (response.rejected) {
            throw response.reason;
        }

        if (!isUndefined(response.value)) {
            return response.value;
        }

        return doAwaitResponse<T>(_resolveValue(value2), (response) => {
            if (response.rejected) {
                throw response.reason;
            }

            if (!isUndefined(response.value)) {
                return response.value;
            }

            return defaultValue;
        });
    });
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

export function deepMerge<T = any>(target: T, src: T): T {
    let newValue: any = objAssign({}, target, src);

    if (target && src) {
        objForEachKey(target, (key) => {
            // Any existing src[key] value would have been assigned over the target[key] version
            /* eslint-disable security/detect-object-injection */
            if ((src as any)[key] !== undefined) {
                if (isArray(newValue[key])) {
                    arrForEach((target as any)[key], (value: any) => {
                        newValue[key].push(value);
                    });
                } else if (typeof newValue[key] === "object") {
                    // Make sure we merge all properties
                    newValue[key] = deepMerge(newValue[key], (target as any)[key]);
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
        result = objAssign(result || {}, value3)
    }

    if (!isNullOrUndefined(value2)) {
        result = objAssign(result || {}, value2)
    }

    if (!isNullOrUndefined(value1)) {
        result = objAssign(result || {}, value1)
    }

    return result;
}
