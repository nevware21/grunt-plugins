/// <reference types="grunt" />

/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import { getGruntMultiTaskOptions, resolveValue, isString, dumpObj, GruntWrapper, IGruntWrapperOptions } from "@nevware21/grunt-plugins-shared-utils";
import { ErrorHandlerResponse } from "./interfaces/IErrorHandler";
import { ITsPluginOptions, ITsPluginTaskOptions } from "./interfaces/ITsPluginOptions";
import { ITypeScriptCompilerOptions, TypeScriptCompiler } from "./TypeScript";

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
        // Merge task-specific and/or target-specific options with these defaults.
        let options = this.options<ITsPluginOptions>({
        });

        let taskOptions = getGruntMultiTaskOptions<ITsPluginTaskOptions>(inst, this);
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
        
        let tsOptions:ITypeScriptCompilerOptions = {
            tsconfig: taskOptions.tsconfig,
            tscPath: resolveValue(taskOptions.tscPath, options.tscPath),
            compiler: resolveValue(taskOptions.compiler, options.compiler),
            additionalFlags: resolveValue(taskOptions.additionalFlags, options.additionalFlags),
            logOutput: resolveValue(taskOptions.logOutput, options.logOutput),
            failOnTypeErrors: resolveValue(taskOptions.failOnTypeErrors, options.failOnTypeErrors, true),
            failOnExternalTypeErrors: resolveValue(taskOptions.failOnExternalTypeErrors, options.failOnExternalTypeErrors, false),
            out: taskOptions.out,
            onError: resolveValue(taskOptions.onError, options.onError, handleDefaultTsErrors)
        };

        let done = this.async();

        (async function () {
            let ts = new TypeScriptCompiler(grunt, tsOptions);
            let srcFiles: string[] = [];
            srcFiles = _addFiles(srcFiles, options.src);
            srcFiles = _addFiles(srcFiles, taskOptions.src);
            
            let response = await ts.compile(srcFiles);
            if (!response.isSuccess && response.errors) {
                response.errors.forEach((value) => {
                    grunt.logError(value);
                });
            }

            if (grunt.isDebug) {
                grunt.logVerbose("Response:\n" + JSON.stringify(response, null, 4));
            }

            done(response.isSuccess ? true : false);
        })().catch((error) => {
            grunt.logError(dumpObj(error));
            done(error);
        });
    });
}
