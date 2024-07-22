/// <reference types="grunt" />
/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

export { IExecuteResponse } from "./interfaces/IExecuteResponse";
export { IGruntLogger } from "./interfaces/IGruntLogger";
export { IGruntWrapper, IGruntWrapperOptions } from "./interfaces/IGruntWrapper";
export { ITsConfig, ITsCompilerOptions, TsConfigDefinitions, ITsOption, ITsOptions } from "./interfaces/ITsConfig";
export { doExecute } from "./execute";
export { getRandomHex } from "./random";
export {
    getTempFile, quoteIfRequired, findCommonRoot, findCommonPath, normalizePath, makeRelative, makeRelativeTo, findModulePath, locateModulePath,
    readJsonFile
} from "./fileHelpers";
export { GruntWrapper } from "./GruntWrapper";
export { ITsConfigDetails, getTsConfigDetails } from "./tsConfigDetails";
export {
    getGruntMultiTaskOptions, resolveValue, resolveValueAsync, mergeOptions, deepMerge
} from "./utils";