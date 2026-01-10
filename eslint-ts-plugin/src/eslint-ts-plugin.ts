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
import { IESLintRunnerOptions, IESLintRunnerResponse } from "./interfaces/IESLintRunnerOptions";
import { arrForEachAsync, doAwaitResponse } from "@nevware21/ts-async";

function _registerTask(inst: IGrunt, taskName: string) {
    inst.registerMultiTask(taskName, "ESLint TypeScript validator project", function () {
        const tempIgnoreFile: string = null;
        let done: grunt.task.AsyncResultCatcher = null;
        let gwInst = new GruntWrapper(inst, { debug: false });

        let taskOptions: IEslintTsPluginTaskOptions = null;
        let loggerOptions: IGruntWrapperOptions = null;
        let grunt: GruntWrapper = null;
        try {
            const options = this.options<IEslintTsPluginTaskOptions>({
            });

            taskOptions = getGruntMultiTaskOptions<IEslintTsPluginTaskOptions>(gwInst, this);
            loggerOptions = {
                debug: resolveValue(taskOptions.debug, options.debug, false)
            }

            grunt = new GruntWrapper(inst, loggerOptions);
            if (grunt.isDebug) {
                grunt.logVerbose((" Pwd    : " + process.cwd()).cyan);
                grunt.logVerbose((" Options: [" + dumpObj(options) + "]").cyan);
                grunt.logVerbose((" Config : [" + dumpObj(this.data) + "]").cyan);
                grunt.logVerbose((" Task   : [" + dumpObj(taskOptions) + "]").cyan);
            }

            done = this.async();
            (async function runEslint() {
                let tsDefs: Array<string | ITsOption> = [];
                let tsconfig = await resolveValueAsync(taskOptions.tsconfig, options.tsconfig);
                
                if (tsconfig) {
                    if (isString(tsconfig)) {
                        tsDefs.push(tsconfig);
                    } else if (Array.isArray(tsconfig)) {
                        tsDefs = tsconfig;
                    } else if (isIterable(tsconfig) || isIterator(tsconfig)) {
                        iterForOf(tsconfig, (value) => {
                            tsDefs.push(value);
                        });
                    } else {
                        grunt.logError("The TSConfig project file [" + dumpObj(tsconfig) + "] is unsupported!");
                        return false;
                    }
                } else {
                    grunt.logError("Missing TSConfig project file... - " + dumpObj(tsconfig));
                    return false;
                }
        
                for (let lp = 0; lp < tsDefs.length; lp++) {
                    // eslint-disable-next-line security/detect-non-literal-fs-filename, security/detect-object-injection
                    let tsDef = tsDefs[lp];

                    if (isString(tsDef)) {
                        if (grunt.isDebug) {
                            grunt.logVerbose("TSConfig: " + tsDef);
                        }
                        if (!grunt.file.exists(tsDef)) {
                            // eslint-disable-next-line security/detect-object-injection
                            grunt.logError("The TSConfig project file [" + tsDefs[lp] + "] does not exist");
                            return false;
                        }
                    } else if (tsDef.name) {
                        if (grunt.isDebug) {
                            grunt.logVerbose("TSConfig: " + tsDef);
                        }
    
                        if (!grunt.file.exists(tsDef.name)) {
                            grunt.logError("The TSConfig project file [" + tsDef.name + "] does not exist");
                            return false;
                        }
                    } else {
                        grunt.logError("The TSConfig project file [" + tsDef + "] does not exist");
                        return false;
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
                const linterConfig: any = deepMerge(taskOptions.additionalConfig, options.additionalConfig);

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
                
                            let theFiles = tsDetail.getFiles();
                            if (theFiles.length === 0 && taskOptions.failNoFiles !== false) {
                                if (!taskOptions.ignoreFailures) {
                                    grunt.logError("No files found to lint! (disable this error with failNoFiles: false)");
                                    done(true);
                                    return -1;
                                } else {
                                    grunt.logError("[!] Ignoring Failures: No files found to lint... (disable this error with failNoFiles: false)")
                                }
                            }

                            results = await eslint.lint(linterConfig, tsDetail.getFiles());
                        } catch (e) {
                            if (grunt.isDebug) {
                                grunt.logError("EsLint error: " + e);
                            }

                            if (taskOptions.ignoreFailures) {
                                grunt.logError("[!] Ignoring Failures: The Task failed but continuing... - " + e)
                                done(true);
                                return -1;
                            }
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
                        let theResult = !response.rejected && isSuccess;
                        if (grunt.isDebug) {
                            grunt.logVerbose("EsLint response :" + theResult + " - " + dumpObj(response));
                        }

                        if (taskOptions.ignoreFailures) {
                            grunt.logError("[!] Ignoring Failures: The Task failed but continuing... - " + dumpObj(response))
                            theResult = true;
                        }

                        done(theResult);
                    });
            })().catch((error) => {
                let theResult = false;
                grunt.logError("EsLint error: " + error);
                if (taskOptions.ignoreFailures) {
                    grunt.logError("[!] Ignoring Failures: The Task failed but continuing...")
                    theResult = true;
                }
                
                done(theResult);
            });
    
        } catch (e) {
            let theResult = false;
            inst.log.error("EsLint catch:: " + e + "\n" + dumpObj(e));

            if (taskOptions && taskOptions.ignoreFailures) {
                inst.log.error("[!] Ignoring Failures: The Task failed but continuing...")
                theResult = true;
            }            

            if (done) {
                done(theResult);
            }
            return theResult;
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
