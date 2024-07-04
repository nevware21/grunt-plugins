/// <reference types="grunt" />

/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import { arrForEach, dumpObj, isString } from "@nevware21/ts-utils";
import { getGruntMultiTaskOptions, resolveValue, GruntWrapper, IGruntWrapperOptions } from "@nevware21/grunt-plugins-shared-utils";
import { ErrorHandlerResponse } from "./interfaces/IErrorHandler";
import { ITsPluginOptions, ITsPluginTaskOptions } from "./interfaces/ITsPluginOptions";
import { ITypeScriptCompilerOptions, TypeScriptCompiler } from "./TypeScript";
import { IPromise, createPromise, doAwait } from "@nevware21/ts-async";

const buildFailingErrors = [
    "6050",
    "6051",
    "6053",
    "6054",
    "6059",
    "6082"
];

function _addFiles(files: string[], src: string | string[]) {
    if (src) {
        if (isString(src)) {
            files.push(src);
        } else if (Array.isArray(src)) {
            files = files.concat(src);
        }
    }

    return files;
}

export function pluginFn (inst: IGrunt) {
    inst.registerMultiTask("ts", "Compile TypeScript project", function () {
        let gwInst = new GruntWrapper(inst, { debug: false });

        // Merge task-specific and/or target-specific options with these defaults.
        let options = this.options<ITsPluginOptions>({
        });

        let taskOptions = getGruntMultiTaskOptions<ITsPluginTaskOptions>(gwInst, this);
        //let taskFiles = this.files || [];

        const loggerOptions: IGruntWrapperOptions = {
            debug: resolveValue(taskOptions.debug, options.debug, false)
        }

        let grunt = new GruntWrapper(inst, loggerOptions);

        if (grunt.isDebug) {
            grunt.logVerbose((" Options: [" + dumpObj(options) + "]").cyan);
            grunt.logVerbose((" Config : [" + dumpObj(taskOptions) + "]").cyan);
        }

        if (!taskOptions.tsconfig || !grunt.file.exists(taskOptions.tsconfig)) {
            grunt.logError("The TSConfig project file [" + taskOptions.tsconfig + "] does not exist");
            return false;
        }

        function handleDefaultTsErrors(number: string, line: string) {
            let response: ErrorHandlerResponse = null;

            if (taskOptions.onError) {
                response = taskOptions.onError(number, line);
            }

            if (!response && options.onError) {
                response = options.onError(number, line);
            }

            if (!response) {
                if (buildFailingErrors.indexOf(number) !== -1) {
                    response = ErrorHandlerResponse.Error;
                }
            }
        
            return response;
        }
        
        function _processSingleTsConfig(theOptions: ITypeScriptCompilerOptions): IPromise<boolean> {
            let ts = new TypeScriptCompiler(grunt, theOptions);
            let srcFiles: string[] = [];
            srcFiles = _addFiles(srcFiles, options.src);
            srcFiles = _addFiles(srcFiles, taskOptions.src);
            
            return createPromise<boolean>((resolve, reject) => {
                doAwait(ts.compile(srcFiles), (responses) => {
                    let isSuccess = true;
                    arrForEach(responses, (response) => {
                        if (!response.isSuccess && response.errors) {
                            isSuccess = false;
                            response.errors.forEach((value) => {
                                grunt.logError( " - " + value);
                            });
                        }
            
                        if (options.debug) {
                            grunt.logVerbose("Response:\n" + JSON.stringify(response, null, 4));
                        }
                    });

                    resolve(isSuccess);
                }, reject);
            });
        }

        let tsOptions:ITypeScriptCompilerOptions = {
            tsconfig: taskOptions.tsconfig,
            tscPath: resolveValue(taskOptions.tscPath, options.tscPath),
            compiler: resolveValue(taskOptions.compiler, options.compiler),
            additionalFlags: resolveValue(taskOptions.additionalFlags, options.additionalFlags),
            logOutput: resolveValue(taskOptions.logOutput, options.logOutput),
            failOnTypeErrors: resolveValue(taskOptions.failOnTypeErrors, options.failOnTypeErrors, true),
            failOnExternalTypeErrors: resolveValue(taskOptions.failOnExternalTypeErrors, options.failOnExternalTypeErrors, false),
            out: taskOptions.out,
            outDir: resolveValue(taskOptions.outDir, options.outDir),
            onError: resolveValue(taskOptions.onError, options.onError, handleDefaultTsErrors),
            keepTemp: resolveValue(taskOptions.keepTemp, options.keepTemp)
        };

        let done = this.async();

        (async function () {
            let isSuccess = await _processSingleTsConfig(tsOptions);
            done(isSuccess ? true : false);
        })().catch((error) => {
            grunt.logError("dump: " + dumpObj(error));
            done(error);
        });
    });
}
