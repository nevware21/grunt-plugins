/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import { OnErrorHandler } from "./IErrorHandler";

export interface ITsCommonOptions {
     /**
     * Log the output of the execute response
     */
    logOutput?: boolean;
 
     /**
     * Pass in additional flags to the tsc compiler (added to the end of the command line)
     */
    additionalFlags?: string | string[];

    /**
    * Should the compile run fail when type errors are identified
     * Defaults: true
    */
    failOnTypeErrors?: boolean;
 
    /**
     * Shoule the compile run fail when type errors are identified from an external module (in the node_modules/) path
     * Defaults: false
     */
    failOnExternalTypeErrors?: boolean;

    /**
     * Identify the root path of the version of the TypeScript is installed, this may include be either
     * the root folder of where the node_modules/typescript/bin folder is located or the location of
     * the command-line version of tsc.
     * Defaults to scanning the file system path to locate the node_modules/typescript/bin folder
     */
    tscPath?: string;
  
    /**
     * Identify the complete path to the command line version of tsc
     * Defaults to "tsc" within the located or defined tscPath
     */
    compiler?: string;

    /**
     * This callback function will be called when an error matching "error: TS\d+:" is found, the errorNumber is the
     * detected value and line is the entire line containing the error message.
     * @returns ErrorHandlerResponse value
     */
    onError?: OnErrorHandler;
 }

export interface ITsPluginOptions extends ITsCommonOptions {
    /**
     * Log additional debug messages as verbose grunt messages
     */
     debug?: boolean;

     /**
     * An array of source files to be "added" to all tasks as either files or include for each task tsconfig
     */
     src?: string | string[];

    /** 
     * Specify the output directory
     */
    outDir?: string;

    /**
     * Keep the generated temporary files (don't delete them)
     */
    keepTemp?: boolean;
}

export interface ITsPluginTaskOptions extends ITsCommonOptions {
    /**
     * Log additional debug messages as verbose grunt messages
     */
     debug?: boolean;

     /**
     * The path to the tsConfig file to use
     */
    tsconfig?: string;

    /**
     * An array of source files to be "added" to the tsconfig as either files or include
     */
    src?: string | string[];

    /**
     * Concatenate the output into a single file using the tsc --out parameter.
     * If the tscConfig also includes an ```outDir``` this value will be ignored
     */
    out?: string;

    /** Specify the output directory */
    outDir?: string;

    /**
     * Keep the generated temporary files (don't delete them)
     */
     keepTemp?: boolean;
}

 