/// <reference types="grunt" />
/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import * as fs from "fs";
import * as path from "path";
import { getRandomHex } from "./random";

export function isUndefined(value: any) {
    return value === undefined || typeof value === 'undefined';
}

/**
 * Get a unique temporary file
 *
 * @returns {string} unique-ish path to file in given directory or null if a unique filename could not be identified.
 */
 export function getTempFile(filename: string, thePath: string = "", extension = ".tmp"): string {
    let attempt = 0;
    
    while (attempt < 100) {
        var name: string = filename + "-" + getRandomHex(8) + extension;
        var dest: string = path.join(thePath, name);

        if (!fs.existsSync(dest)) {
            return dest;
        }

        attempt++;
    }

    return null;
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

export function quoteIfRequired(value: string) {
    if (!value || !value.indexOf) {
        return value;
    }

    if (value.indexOf(" ") === -1) {
        return value;
    }

    if (value.indexOf("\"") == 0 && value.lastIndexOf("\"") == value.length - 1) {
        // Already Quoted
        return value;
    }

    return "\"" + value + "\"";
}

// Finds the longest common section of a collection of strings.
// Simply sorting and comparing first and last http://stackoverflow.com/a/1917041/390330
export function findCommonRoot(values: string[]) {
    if (!values || values.length === 0) {
        return "";
    }

    if (values.length === 1) {
        return values[0];
    }

    let sorted = values.slice(0).sort();
    let firstValue = sorted[0];
    let lastValue = sorted[sorted.length - 1];
    let len = firstValue.length;
    let idx = 0;
    while (idx < len && firstValue.charAt(idx) === lastValue.charAt(idx)) {
        idx ++;
    }

    return firstValue.substring(0, idx);
}

export function findCommonPath(paths: string[], seperator?: string) {
    let commonPath = findCommonRoot(paths);
    let endIdx = -1;

    if (commonPath) {
        if (isUndefined(seperator)) {
            endIdx = Math.max(commonPath.lastIndexOf("/"), commonPath.lastIndexOf("\\"));
        } else {
            endIdx = commonPath.lastIndexOf(seperator);
        }
    }

    if (endIdx === -1) {
        return "";
    }

    return commonPath.substring(0, endIdx);
}