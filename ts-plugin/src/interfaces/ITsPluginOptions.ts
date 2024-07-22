/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import { TsConfigDefinitions } from "@nevware21/grunt-plugins-shared-utils";
import { OnErrorHandler } from "./IErrorHandler";
import { IPromise } from "@nevware21/ts-async";

/**
 * A common set of options that can be defined eaither globally or per task, where any
 * task options may override the global options.
 * @example
 * ```json
 * ts: {
 *   // Global options (Defaults applied to each task if not specified)
 *   options: {
 *     "logOutput": true,
 *     "suppressWarnings": true,
 *     "additionalFlags": [ ],
 *     "failOnTypeErrors": true,
 *     "failOnExternalTypeErrors": false,
 *     "tscPath": "node_modules/typescript/bin",
 *     "compiler": "tsc",
 *     "onError": (errorNumber: string, line: string) => {
 *       return ErrorHandlerResponse.Error;
 *     }
 *   },
 *   // Example task specific options (overriding global options)
 *   task1: {
 *     "logOutput": false,
 *     "suppressWarnings": false,
 *     "failOnTypeErrors": false
 *   },
 *   // Another example task specific options (overriding global options)
 *   task2: {
 *     "additionalFlags": ["--noEmit"]
 *   }
 * }
 * ```
 */
export interface IPluginCommonOptions {
    /**
     * Log additional debug messages as verbose grunt messages.
     * Can be overridden by the task options.
     */
    debug?: boolean;

    /**
     * Log the output of the execute response
     * Can be overridden by the task options.
     */
    logOutput?: boolean;
 
    /**
     * Supporess any warnings from the output
     * Can be overridden by the task options.
     */
    suppressWarnings?: boolean;

    /**
     * Pass in additional flags to the tsc compiler (added to the end of the command line)
     * Can be overridden by the task options.
     */
    additionalFlags?: string | string[];

    /**
     * Should the compile run fail when type errors are identified
     * Can be overridden by the task options.
     * Defaults: true
     */
    failOnTypeErrors?: boolean;
 
    /**
     * Shoule the compile run fail when type errors are identified from an external module (in the node_modules/) path
     * Can be overridden by the task options.
     * Defaults: false
     */
    failOnExternalTypeErrors?: boolean;

    /**
     * Identify the root path of the version of the TypeScript is installed, this may include be either
     * the root folder of where the node_modules/typescript/bin folder is located or the location of
     * the command-line version of tsc.
     * Can be overridden by the task options.
     * Defaults to scanning the file system path to locate the node_modules/typescript/bin folder
     */
    tscPath?: string;
  
    /**
     * Identify the complete path to the command line version of tsc
     * Can be overridden by the task options.
     * Defaults to "tsc" within the located or defined tscPath
     */
    compiler?: string;

    /** 
     * Specify the output directory
     * Can be overridden by the task options.
     */
    outDir?: string;

    /**
     * Keep the generated temporary files (don't delete them)
     * Can be overridden by the task options.
     */
    keepTemp?: boolean;

    /**
     * This callback function will be called when an error matching "error: TS\d+:" is found, the errorNumber is the
     * detected value and line is the entire line containing the error message.
     * When both the global and task options are defined, both onError handlers will be called.
     * Can be overridden by the task options.
     * @returns ErrorHandlerResponse value
     */
    onError?: OnErrorHandler;
}

/**
 * Additional options that are specific to the global options and are not shared with the task options
 * while these options apply to each task, they cannot be overridden by the task options
 */
export interface ITsPluginOptions extends IPluginCommonOptions {
    /**
     * An array of source files to be "added" to all tasks as either files or include for each task tsconfig
     */
    src?: string | string[];

    /**
     * The name and path to the tsConfig file(s) or an ITsOption object describing the valuesto use, may be
     * - a single string
     * - an array of strings
     * - an iterable of strings
     * - an iterator of strings
     * - a single ITsOption object
     * - an array of ITsOption objects
     * - an iterable of ITsOption objects
     * - an iterator of ITsOption objects
     * - a promise that resolves to any of the above
     * - a function that returns any of the above including a promise that resolves to any of the above
     */
    tsconfig?: TsConfigDefinitions | IPromise<TsConfigDefinitions> | (() => TsConfigDefinitions | IPromise<TsConfigDefinitions>);
}

/**
 * Options that are specific to a task that are not shared with either the global
 * options or other tasks
 */
export interface ITsPluginTaskOptions extends IPluginCommonOptions {

    /**
     * The name and path to the tsConfig file(s) or an ITsOption object describing the valuesto use, may be
     * - a single string
     * - an array of strings
     * - an iterable of strings
     * - an iterator of strings
     * - a promise that resolves to any of the above
     * - a single {@linlITsOption object
     * - an array of ITsOption objects
     * - an iterable of ITsOption objects
     * - an iterator of ITsOption objects
     * - a promise that resolves to any of the above
     * - a function that returns any of the above including a promise that resolves to any of the above
     * @since 0.5.0
     * @example
     * ```js
     * ts: {
     *   "task1": {
     *     // Prior to 0.5.0 the tsconfig only accepted a string value
     *     "tsconfig": "./shared/tsconfig.json"
     *   },
     *   "task2": {
     *     // Starting with 0.5.0 the tsconfig can be an array of strings, an iterator or any iterable
     *     "tsconfig": [
     *       "./shared/tsconfig.json",
     *       "./shared/tsconfig2.json"
     *     ]
     *   },
     *   "task3": {
     *     // Starting with 0.5.0 the tsconfig can be an array of strings, an iterator or any iterable
     *     "tsconfig": new Set([
     *       "./shared/tsconfig.json",
     *       "./shared/tsconfig2.json"
     *     ])
     *   },
     *   "task4": {
     *     // Starting with 0.5.0 the tsconfig can be an array of strings, an iterator or any iterable
     *     "tsconfig": (function* () {
     *       yield "./shared/tsconfig.json";
     *       yield "./shared/tsconfig2.json";
     *     })()
     *   },
     *   "task5": {
     *     // Starting with 0.5.0 the tsconfig may also be a promise that resolves to an array of strings
     *     "tsconfig": async function () {
     *       return [
     *         "./shared/tsconfig.json",
     *         "./shared/tsconfig2.json"
     *       ];
     *    },
     *    "task6": {
     *      // Starting with 0.5.0 the tsconfig it may also be a promise that resolves to an iterator
     *      "tsconfig": async function () {
     *      return new Set([
     *        "./shared/tsconfig.json",
     *        "./shared/tsconfig2.json"
     *      ]);
     *    },
     *    "task7": {
     *      // Starting with 0.5.0 the tsconfig it may also be a promise that resolves to an iterable
     *      "tsconfig": async function () {
     *        return (function* () {
     *          yield "./shared/tsconfig.json";
     *          yield "./shared/tsconfig2.json";
     *        })();
     *      }
     *   },
     *   "task8": {
     *     // Starting with 0.5.0 the tsconfig may return a promise that resolves to a string
     *     "tsconfig": async function () {
     *       return "./shared/tsconfig.json";
     *     }
     *   },
     *   "task9": {
     *     // Starting with 0.5.0 the tsconfig may return an ITsOption object
     *     "tsconfig": async function () {
     *       return {
     *         name: "./shared/tsconfig.json",
     *         tsconfig: {
     *           "esModuleInterop": true,
     *           "useDefineForClassFields": true,
     *           "emitDeclarationMetadata": true
     *         }
     *      }
     *   }
     * }
     * ```
     */
    tsconfig?: TsConfigDefinitions | IPromise<TsConfigDefinitions> | (() => TsConfigDefinitions | IPromise<TsConfigDefinitions>);
 
    /**
     * An array of source files to be "added" to the tsconfig as either files or include.
     * The provided files will be added to all tsconfig files defined in the tsconfig property.
     */
    src?: string | string[];

    /**
     * Concatenate the output into a single file using the tsc --out parameter.
     * If the tscConfig also includes an ```outDir``` this value will be ignored
     */
    out?: string;
}
 