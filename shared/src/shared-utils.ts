/// <reference types="grunt" />
/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

export { IExecuteResponse } from "./interfaces/IExecuteResponse";

export { doExecute } from "./execute";
export { getRandomHex } from "./random";
export {
    getTempFile, quoteIfRequired, findCommonRoot, findCommonPath, normalizePath, makeRelative, makeRelativeTo, findModulePath
} from "./fileHelpers";
export {
    isUndefined, isPromiseLike, isPromise, isString, dumpObj, getGruntMultiTaskOptions, resolveValue
} from "./utils";