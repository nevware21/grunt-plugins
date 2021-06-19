/// <reference types="grunt" />

/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import { getGruntMultiTaskOptions, resolveValue, isString, dumpObj } from "@nevware21/grunt-plugins-shared-utils";
import { ErrorHandlerResponse } from "./interfaces/IErrorHandler";
import { ITsPluginOptions, ITsPluginTaskOptions } from "./interfaces/ITsPluginOptions";
import { ITypeScriptCompilerOptions, TypeScriptCompiler } from "./TypeScript";
import * as path from "path";
import * as fs from "fs";

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

export function pluginFn (grunt: IGrunt) {
    grunt.registerMultiTask("ts", "Compile TypeScript project", function () {
        // Merge task-specific and/or target-specific options with these defaults.
        let options = this.options<ITsPluginOptions>({
        });

        let taskOptions = getGruntMultiTaskOptions<ITsPluginTaskOptions>(grunt, this);
        //let taskFiles = this.files || [];

        if (options.debug) {
            grunt.log.verbose.writeln((" Options: [" + dumpObj(options) + "]").cyan);
            grunt.log.verbose.writeln((" Config : [" + dumpObj(this.data) + "]").cyan);
        }

        if (!grunt.file.exists(taskOptions.tsconfig)) {
            grunt.log.error("The TSConfig project file [" + taskOptions.tsconfig + "] does not exist");
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
            tscPath: resolveValue(taskOptions.tscPath, options.tscPath, null),
            compiler: resolveValue(taskOptions.compiler, options.compiler, null),
            additionalFlags: resolveValue(taskOptions.additionalFlags, taskOptions.additionalFlags, null),
            debug: resolveValue(taskOptions.debug, options.debug, false),
            logOutput: resolveValue(taskOptions.logOutput, options.logOutput, false),
            failOnTypeErrors: resolveValue(taskOptions.failOnTypeErrors, taskOptions.failOnTypeErrors, false),
            out: taskOptions.out,
            onError: resolveValue(taskOptions.onError, options.onError, handleDefaultTsErrors)
        };

        //let tsConfig = require(options.tsconfig);

        let done = this.async();

        (async function () {
            let ts = new TypeScriptCompiler(grunt, tsOptions);
            let srcFiles: string[] = [];
            srcFiles = _addFiles(srcFiles, resolveValue(taskOptions.src, options.src));
            
            let response = await ts.compile(srcFiles);
            if (!response.isSuccess && response.errors) {
                response.errors.forEach((value) => {
                    grunt.log.error(value);
                });
            }

            if (options.debug) {
                grunt.log.verbose.writeln("Response:\n" + JSON.stringify(response, null, 4));
            }

            done(response.isSuccess ? true : false);
        })().catch((error) => {
            grunt.log.error(dumpObj(error));
            done(error);
        });
    });
}
