/// <reference types="grunt" />
/*
 * @nevware21/grunt-eslint-ts
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import { arrForEach, dumpObj, isIterable, isIterator, isString, iterForOf } from "@nevware21/ts-utils";
import { getGruntMultiTaskOptions, resolveValue, deepMerge, getTsConfigDetails, IGruntWrapperOptions, GruntWrapper, resolveValueAsync, ITsOption } from "@nevware21/grunt-plugins-shared-utils";
import { ESLintRunner } from "./ESLintRunner";
import { IEslintTsPluginTaskOptions } from "./interfaces/IEslintTsPluginOptions";
import { Linter } from "eslint";
import { IESLintRunnerOptions, IESLintRunnerResponse } from "./interfaces/IESLintRunnerOptions";
import { arrForEachAsync, doAwaitResponse } from "@nevware21/ts-async";

function _registerTask(inst: IGrunt, taskName: string) {
    inst.registerMultiTask(taskName, "ESLint TypeScript validator project", function () {
        const tempIgnoreFile: string = null;
        let done: grunt.task.AsyncResultCatcher = null;
        let gwInst = new GruntWrapper(inst, { debug: false });

        try {
            const options = this.options<IEslintTsPluginTaskOptions>({
            });

            const taskOptions = getGruntMultiTaskOptions<IEslintTsPluginTaskOptions>(gwInst, this);
            const loggerOptions: IGruntWrapperOptions = {
                debug: resolveValue(taskOptions.debug, options.debug, false)
            }

            let grunt = new GruntWrapper(inst, loggerOptions);
            if (grunt.isDebug) {
                grunt.logVerbose((" Options: [" + dumpObj(options) + "]").cyan);
                grunt.logVerbose((" Config : [" + dumpObj(this.data) + "]").cyan);
            }

            done = this.async();
            (async function runEslint() {
                let tsDefs: Array<string | ITsOption> = [];
                let tsconfig = await resolveValueAsync(taskOptions.tsconfig, options.tsconfig);
                
                if (!tsconfig) {
                    if (isString(tsconfig)) {
                        tsDefs.push(tsconfig);
                    } else if (Array.isArray(tsconfig)) {
                        tsDefs = tsconfig;
                    } else if (isIterable(tsconfig) || isIterator(tsconfig)) {
                        iterForOf(tsconfig, (value) => {
                            tsDefs.push(value);
                        });
                    } else {
                        grunt.logError("The TSConfig project file [" + tsconfig + "] does not exist");
                        return false;
                    }
                }
        
                for (let lp = 0; lp < tsDefs.length; lp++) {
                    // eslint-disable-next-line security/detect-non-literal-fs-filename, security/detect-object-injection
                    let tsDef = tsDefs[lp];

                    if (isString(tsDef)) {
                        if (!grunt.file.exists(tsDef)) {
                            // eslint-disable-next-line security/detect-object-injection
                            grunt.logError("The TSConfig project file [" + tsDefs[lp] + "] does not exist");
                            return false;
                        }
                    } else if (tsDef.name) {
                        if (!grunt.file.exists(tsDef.name)) {
                            grunt.logError("The TSConfig project file [" + tsDef.name + "] does not exist");
                            return false;
                        }
                    }
                }   

                const eslintOptions: IESLintRunnerOptions = {
                    format: resolveValue(taskOptions.format, options.format, "codeframe"),
                    logOutput: resolveValue(taskOptions.logOutput, options.logOutput),
                    fix: resolveValue(taskOptions.fix, options.fix),
                    suppressWarnings: resolveValue(taskOptions.suppressWarnings, options.suppressWarnings),
                    quiet: resolveValue(taskOptions.quiet, options.quiet),
                    outputFile: resolveValue(taskOptions.outputFile, options.outputFile),
                    disableOutputFixes: resolveValue(taskOptions.disableOutputFixes, options.disableOutputFixes)
                };            
              
                const maxWarnings = resolveValue(taskOptions.maxWarnings, options.maxWarnings);
                grunt.logDebug("grunt-eslint-typescript options: " + dumpObj(eslintOptions, true));
    
                let tsDetails = getTsConfigDetails(grunt, tsDefs, !eslintOptions.suppressWarnings);
                arrForEach(tsDetails, (tsDetail) => {
                    if (tsDetail) {
                        tsDetail.addFiles(options.src);
                        tsDetail.addFiles(taskOptions.src);
                    }
                });
    
                let results: IESLintRunnerResponse = null;
        
    

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

                let isSuccess = true;
                return doAwaitResponse(
                    arrForEachAsync(tsDetails, async (tsDetail, idx) => {
                        try {
                            const theTsConfig = tsDetail.createTemp(idx);
                            if (theTsConfig) {
                                grunt.log("Using tsconfig: " + theTsConfig);
                                linterConfig.parserOptions = linterConfig.parserOptions || {};
                                linterConfig.parserOptions.project = theTsConfig;
                            }                    
                
                            results = await eslint.lint(linterConfig, tsDetail.getFiles());
            
                        } finally {
                            tsDetail.cleanupTemp();
                        }
            
                        isSuccess = results.isSuccess;
                        if (maxWarnings >= 0 && results && results.warnings && results.warnings.length > maxWarnings) {
                            grunt.logWarn(`ESLint found too many warnings (maximum: ${maxWarnings})`);
                            isSuccess = false;
                        }

                        if (taskOptions.ignoreFailures) {
                            if (!isSuccess) {
                                grunt.logError("[!] Ignoring Failures: The Task failed but continuing...")
                                done(true);
                                return -1;
                            }
                        }
                    }), 
                    (response) => {
                        if (grunt.isDebug) {
                            grunt.logVerbose("EsLint response:" + dumpObj(response));
                        }
                        done(!response.rejected && isSuccess);
                    });
            })().catch((error) => {
                grunt.logError("EsLint error: " + error);
                done(false);
            });
    
        } catch (e) {
            inst.log.error("EsLint catch:: " + e + "\n" + dumpObj(e));
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
