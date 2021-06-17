/// <reference types="grunt" />
/*
 * @nevware21/grunt-eslint-ts
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import { dumpObj, IGruntWrapper, isFunction, isUndefined, locateModulePath } from "@nevware21/grunt-plugins-shared-utils";
import { IESLintRunnerFileResponse, IESLintRunnerOptions, IESLintRunnerResponse } from "./interfaces/IESLintRunnerOptions";
import { Linter, ESLint } from "eslint";

function _getESLint(grunt: IGruntWrapper) {
    let eslintPath = "eslint";
    try {
        eslintPath = require.resolve("eslint");
    } catch(e) {
        eslintPath = "eslint";
    }

    grunt.log("Using ESLint from : " + eslintPath);

    return require(eslintPath);
}

export class ESLintRunner {

    lint: (linterConfig?: Linter.Config, files?: string[]) => Promise<IESLintRunnerResponse>;

    constructor(grunt: IGruntWrapper, options: IESLintRunnerOptions) {
        const _self = this;

        function _logDebug(message: string) {
            if (grunt.isDebug) {
                grunt.logVerbose(message.cyan);
            }
        }
        
        function _hasEsLintParser() {
            _logDebug("Locating @typescript-eslint/parser...");
            return !!locateModulePath("node_modules/@typescript-eslint/parser", _logDebug);
        }
       
        function _hasEsLintPlugin() {
            _logDebug("Locating @typescript-eslint/eslint-plugin...");
            return !!locateModulePath("node_modules/@typescript-eslint/eslint-plugin", _logDebug);
        }

        function _hasEsLintSecurity() {
            _logDebug("Locating eslint-plugin-security...");
            return !!locateModulePath("node_modules/eslint-plugin-security", _logDebug);
        }
       
        _self.lint = async (linterConfig?: Linter.Config, files?: string[]) => {
            const defaultConfig: Linter.Config = {
                parserOptions: { },
                plugins: [ ],
                extends: [ ]
            }

            if (Array.isArray(defaultConfig.extends)) {
                defaultConfig.extends.push("eslint:recommended");
            }

            if (!linterConfig || isUndefined(linterConfig.parser)) {
                // Try and add the default parser options
                if (_hasEsLintParser()) {
                    defaultConfig.parser = "@typescript-eslint/parser";
                } else {
                    grunt.logWarn("@typescript-eslint/parser does not appear to be installed. Either add to your package.json 'npm i @typescript-eslint/parser' or specify a null or empty parser option in your grunt config.");
                }
    
                if (_hasEsLintPlugin()) {
                    defaultConfig.plugins.push("@typescript-eslint");
                    if (Array.isArray(defaultConfig.extends)) {
                        defaultConfig.extends.push("plugin:@typescript-eslint/recommended");
                    }
                } else {
                    grunt.logWarn("@typescript-eslint/eslint-plugin does not appear to be installed. Either add to your package.json 'npm i @typescript-eslint/eslint-plugin' or specify a null or empty parser option in your grunt config.");
                }

                if (_hasEsLintSecurity()) {
                    grunt.log("Found eslint-plugin-security -- automatically adding, to avoid this specify a null or empty parser option in your grunt config.")
                    defaultConfig.plugins.push("security");
                    if (Array.isArray(defaultConfig.extends)) {
                        defaultConfig.extends.push("plugin:security/recommended");
                    }
                }
            }

            const eslintOpts: ESLint.Options = { 
                baseConfig: Object.assign(defaultConfig, linterConfig),
            };

            if (options.fix !== false) {
                if (isFunction(options.fix)) {
                    eslintOpts.fix = options.fix;
                } else {
                    eslintOpts.fix = true;
                }
            }
            
            let fixableErrors = 0;
            let fixableWarnings = 0;

            const eslint = _getESLint(grunt);
            if (grunt.isDebug) {
                grunt.logDebug("Using EsLint Options: " + dumpObj(eslintOpts, true))
            }

            const esLint = new eslint.ESLint(eslintOpts);
            if (grunt.isDebug && Array.isArray(files)) {
                let fileDetails = "";
                files.forEach((value) => {
                    fileDetails += " - " + value + "\n";
                });

                grunt.logDebug("Linting " + files.length + " files...\n" + fileDetails);
            }

            const results: ESLint.LintResult[] = await esLint.lintFiles(files);
            if (results) {
                results.forEach((value) => {
                    fixableErrors += value.fixableErrorCount;
                    fixableWarnings += value.fixableWarningCount;
                });

                if (options.fix && (fixableErrors + fixableWarnings) > 0) {
                    grunt.log("Fixing lint issues...");
                    await eslint.ESLint.outputFixes(results);
                }
            }
    
            const formatter = await esLint.loadFormatter(options.format || "codeframe");

            let reportResults = results;
            let hasErrors = false;
            const errorResults: ESLint.LintResult[]  = eslint.ESLint.getErrorResults(results);
            const lintErrors: IESLintRunnerFileResponse[] = [];
            const lintWarnings: IESLintRunnerFileResponse[] = [];

            if (errorResults.length > 0) {
                hasErrors = true;
                errorResults.forEach((lintResult) => {
                    lintErrors.push({
                        filePath: lintResult.filePath,
                        messages: formatter.format([lintResult]).split("\n"),
                        count: lintResult.errorCount
                    });
                });
            }

            if (results) {
                results.forEach((lintResult) => {
                    if (lintResult.warningCount > 0) {
                        lintWarnings.push({
                            filePath: lintResult.filePath,
                            messages: formatter.format([lintResult]).split("\n"),
                            count: lintResult.errorCount
                        });
                    }
                });
            }

            if (options.suppressWarnings) {
                reportResults = errorResults;
            }
                
            const resultText = formatter.format(reportResults);
            if (options.outputFile) {
                grunt.file.write(options.outputFile, resultText);
            }
            
            if (!options.quiet && resultText) {
                grunt.log(resultText);
            }

            return {
                isSuccess: !hasErrors,
                errors: lintErrors,
                warnings: lintWarnings,
                fixableErrors: fixableErrors,
                fixableWarnings: fixableWarnings
            };
        }
    }
}
