/*
 * @nevware21/grunt-eslint-ts
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import { Linter } from "eslint";

export interface ITsCommonOptions {
    /**
     * Log the output of the execute response
     */
    logOutput?: boolean;
 
    fix?: boolean;
    
    /**
     * Only include errors in the output
     */
    suppressWarnings?: boolean;

    /**
     * Don't output the report to the console / grunt output
     */
    quiet?: boolean;

    /**
     * Output the results to the provided file
     */
    outputFile?: string;

    /**
     * The Lint error formatter to use, defaults to codeframe
     */
    format?: string;

    /**
     * When automatic fixes are request and found, ignore the fix and don't output the fixed version
     */
    disableOutputFixes?: boolean;
}

export interface IEsLintParser {
    name: string;
    plugins: string | string[];
    parserOptions?: Linter.ParserOptions;
}

export interface IEsLintOptions extends ITsCommonOptions {

     /**
      * Override the parser and plugin to use, defaults to { plugin: "@typescript-eslint"; name: "@typescript-eslint/parser" }
      */
     parser?: IEsLintParser;
 
     /**
      * Additional Config that will be used to override the base Configuration, any additionalConfig will override any defaults
      */
     additionalConfig?: Linter.Config;

    /**
     * Specific rules to override 
     */
     rules?: Partial<Linter.RulesRecord>;
}

export interface IEslintTsPluginOptions extends IEsLintOptions {
    /**
     * Log additional debug messages as verbose grunt messages
     */
     debug?: boolean;

     /**
     * The path to the tsConfig file to use
     */
     tsconfig?: string;

    /**
     * If more than this number of warnings are reported failed the task
     */
     maxWarnings?: number;

    /**
     * An array of source files to be "added" to all tasks as either files or include for each task tsconfig
     */
     src?: string | string[];
}

export interface IEslintTsPluginTaskOptions extends IEsLintOptions {
    /**
     * Log additional debug messages as verbose grunt messages
     */
     debug?: boolean;

     /**
     * The path to the tsConfig file to use
     */
    tsconfig?: string;

    /**
     * If more than this number of warnings are reported failed the task
     */
     maxWarnings?: number;

    /**
     * An array of source files to be "added" to all tasks as either files or include for each task tsconfig
     */
     src?: string | string[];

    /**
     * Ignore failures and continue
     */
    ignoreFailures?: boolean;
}
