/// <reference types="grunt" />
/*
 * @nevware21/grunt-eslint-ts
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import { getGruntMultiTaskOptions, resolveValue, dumpObj, deepMerge, getTsConfigDetails, isString, IGruntWrapperOptions, GruntWrapper } from "@nevware21/grunt-plugins-shared-utils";
import { ESLintRunner } from "./ESLintRunner";
import { IEslintTsPluginTaskOptions } from "./interfaces/IEslintTsPluginOptions";
import { Linter } from "eslint";
import { IESLintRunnerOptions, IESLintRunnerResponse } from "./interfaces/IESLintRunnerOptions";

function _registerTask(inst: IGrunt, taskName: string) {
    inst.registerMultiTask(taskName, "ESLint TypeScript validator project", function () {
        const tempIgnoreFile: string = null;
        let done: grunt.task.AsyncResultCatcher = null;

        try {
            const options = this.options<IEslintTsPluginTaskOptions>({
            });

            const taskOptions = getGruntMultiTaskOptions<IEslintTsPluginTaskOptions>(inst, this);
            const loggerOptions: IGruntWrapperOptions = {
                debug: resolveValue(taskOptions.debug, options.debug, false)
            }

            let grunt = new GruntWrapper(inst, loggerOptions);
            if (grunt.isDebug) {
                grunt.logVerbose((" Options: [" + dumpObj(options) + "]").cyan);
                grunt.logVerbose((" Config : [" + dumpObj(this.data) + "]").cyan);
            }
    
            let tsconfig = resolveValue(taskOptions.tsconfig, options.tsconfig);
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            if (!tsconfig || !grunt.file.exists(tsconfig)) {
                grunt.logError("The TSConfig project file [" + tsconfig + "] does not exist");
                return false;
            }

            const eslintOptions: IESLintRunnerOptions = {
                format: resolveValue(taskOptions.format, options.format, "codeframe"),
                logOutput: resolveValue(taskOptions.logOutput, options.logOutput),
                fix: resolveValue(taskOptions.fix, options.fix),
                suppressWarnings: resolveValue(taskOptions.suppressWarnings, options.suppressWarnings),
                quiet: resolveValue(taskOptions.quiet, options.quiet),
                outputFile: resolveValue(taskOptions.outputFile, options.outputFile)
            };            
          
            const maxWarnings = resolveValue(taskOptions.maxWarnings, options.maxWarnings);
            grunt.logDebug("grunt-eslint-typescript options: " + dumpObj(eslintOptions, true));

            let tsDetails = getTsConfigDetails(grunt, tsconfig, true);
            tsDetails.addFiles(options.src);
            tsDetails.addFiles(taskOptions.src);

            let results: IESLintRunnerResponse = null;
    
            done = this.async();
            (async function runEslint() {
                const eslint = new ESLintRunner(grunt, eslintOptions);

                // Merge all of the additional Config into the linter
                const linterConfig: Linter.Config = deepMerge(taskOptions.additionalConfig, options.additionalConfig);

                const parser = resolveValue(taskOptions.parser, options.parser);
                if (parser) {
                    linterConfig.parser = parser.name;
                    if (parser.plugins) {
                        if (isString(parser.plugins)) {
                            linterConfig.plugins = [ parser.plugins ];
                        } else {
                            linterConfig.plugins =  parser.plugins;
                        }
                    }

                    linterConfig.parserOptions = parser.parserOptions;
                }

                const rules = deepMerge(taskOptions.rules, options.rules);
                if (rules) {
                    linterConfig.rules = linterConfig.rules || {};
                    const keys = Object.keys(rules);
                    keys.forEach((key) => {
                        // eslint-disable-next-line security/detect-object-injection
                        linterConfig.rules[key] = rules[key];
                    });
                }

                try {

                    const theTsConfig = tsDetails.createTemp();
                    if (theTsConfig) {
                        grunt.log("Using tsconfig: " + theTsConfig);
                        linterConfig.parserOptions = linterConfig.parserOptions || {};
                        linterConfig.parserOptions.project = theTsConfig;
                    }                    
        
                    results = await eslint.lint(linterConfig, tsDetails.getFiles());
    
                } finally {
                    tsDetails.cleanupTemp();
                }
    
                let success = results.isSuccess;
                if (maxWarnings >= 0 && results && results.warnings && results.warnings.length > maxWarnings) {
                    grunt.logWarn(`ESLint found too many warnings (maximum: ${maxWarnings})`);
                    success = false;
                }
       
                if (taskOptions.ignoreFailures) {
                    if (!success) {
                        grunt.logError("[!] Ignoring Failures: The Task failed but continuing...")
                        done(true);
                    }
                }
                done(success);
            })().catch((error) => {
                console.error(error);
                done(false);
            });
    
        } catch (e) {
            console.error(e);
            if (done) {
                done(false);
            }
            return false;
        } finally {
            if (tempIgnoreFile) {
                // cleanup temp file
                inst.file.delete(tempIgnoreFile);
            }
        }
	});
}

export function esLintFn (inst: IGrunt) {
    _registerTask(inst, "lint");
    _registerTask(inst, "eslint");
    _registerTask(inst, "eslint-ts");
}
