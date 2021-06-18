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
import { isUndefined } from "./utils";

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

export function quoteIfRequired(value: string, convertToRelative: boolean = true) {
    if (!value || !value.indexOf) {
        return value;
    }

    if (value.length >= 2 && value.charAt(0) === "\"" && value.charAt(value.length - 1) === "\"") {
        // Already Quoted
        if (!convertToRelative) {
            return value;
        }

        // Stip existing quotes
        value = value.substring(1, value.length - 2);
    }

    if (convertToRelative) {
        value = makeRelative(path.resolve(value));
    }

    if (value.indexOf(" ") !== -1) {
        return "\"" + value + "\"";
    }

    return value;
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
    let firstValue = sorted[0] as string;
    let lastValue = sorted[sorted.length - 1];
    let len = firstValue.length;
    let idx = 0;
    while (idx < len && firstValue.charAt(idx) === lastValue.charAt(idx)) {
        idx ++;
    }

    return firstValue.substring(0, idx);
}

export function findCommonPath(paths: string[], seperator?: string) {
    let commonPath = findCommonRoot(paths.map((value) => normalizePath(value)));
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

export function normalizePath(thePath: string) {
    if (thePath) {
        return thePath.replace(/\\/g, "/");
    }

    return thePath || "";
}

export function makeRelative(thePath: string) {
    return makeRelativeTo(".", thePath);
}

export function makeRelativeTo(rootPath: string, thePath: string) {
    return normalizePath(path.relative(rootPath, path.resolve(thePath)));
}


function _findPath(rootPath: string, moduleFolder: string, logDebug?: (message: string) => void) {
    let currentPath = rootPath;
    while (currentPath && currentPath.length > 3) {
        let thePath = path.join(currentPath, moduleFolder);
        logDebug && logDebug("  - Checking [" + thePath + "]");
        if (fs.existsSync(path.join(currentPath, moduleFolder))) {
            return thePath;
        }

        currentPath = path.resolve(currentPath, "..");
    }

    return null;
}

export function findModulePath(moduleFolder: string, logDebug?: (message: string) => void) {
    // Try finding pased on the current working path
    let modulePath = _findPath(path.resolve("."), moduleFolder, logDebug);
    if (!modulePath) {
        // Try and find based on a relative location to the current module
        modulePath = _findPath(path.resolve(path.dirname(module.filename), ".."), moduleFolder, logDebug);
    }

    if (!modulePath) {
        logDebug && logDebug("Module [" + moduleFolder + "] path not found -- defaulting to cwd");
        modulePath = path.join(".", moduleFolder)
    }
    
    return normalizePath(modulePath);
}