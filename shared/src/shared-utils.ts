/// <reference types="grunt" />
/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

export { IExecuteResponse } from "./interfaces/IExecuteResponse";
export { IGruntLogger } from "./interfaces/IGruntLogger";
export { IGruntWrapper, IGruntWrapperOptions } from "./interfaces/IGruntWrapper";
export { ITsConfig, ITsCompilerOptions } from "./interfaces/ITsConfig";
export { doExecute } from "./execute";
export { getRandomHex } from "./random";
export {
    getTempFile, quoteIfRequired, findCommonRoot, findCommonPath, normalizePath, makeRelative, makeRelativeTo, findModulePath, locateModulePath,
    readJsonFile
} from "./fileHelpers";
export { GruntWrapper } from "./GruntWrapper";
export { ITsConfigDetails, getTsConfigDetails } from "./tsConfigDetails";
export {
    isUndefined, isNullOrUndefined, isPromiseLike, isPromise, isString, isFunction, dumpObj, getGruntMultiTaskOptions, resolveValue, mergeOptions, deepMerge
} from "./utils";