/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

export interface ITsPluginOptions {
    /**
     * Log additional debug messages as verbose grunt messages
     */
    debug?: boolean;

    /**
     * Pass in additional flags to the tsc compiler (added to the end of the command line)
     */
    additionalFlags?: string | string[];

    /**
     * Should the compile run fail when type errors are identified
     */
    failOnTypeErrors?: boolean;
 
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
     * If specified, outDir files are located relative to this location
     */
    baseDir?: string;
}

export interface ITsPluginTaskOptions {
    /**
     * Log additional debug messages as verbose grunt messages
     */
     debug?: boolean;

     /**
     * The path to the tsConfig file to use
     */
    tsconfig?: string;

    /**
     * Pass in additional flags to the tsc compiler (added to the end of the command line)
     */
    additionalFlags?: string | string[];

    /**
     * Should the compile run fail when type errors are identified
     */
    failOnTypeErrors?: boolean;

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
     * If specified, outDir files are located relative to this location
     */
    baseDir?: string;

    src?: string[],
    out?: string
}

 