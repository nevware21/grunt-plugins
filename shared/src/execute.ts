/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import { createPromise, IPromise } from "@nevware21/ts-async";
import { IExecuteResponse } from "./interfaces/IExecuteResponse";
import { IGruntWrapper } from "./interfaces/IGruntWrapper";

export function doExecute(grunt: IGruntWrapper, args: string[]): IPromise<IExecuteResponse> {
    return createPromise<IExecuteResponse>((resolve) => {
        // Log the complete running command line
        grunt.logVerbose("Executing: [" + (args.join(" ")).cyan + "]")
        grunt.util.spawn({
            cmd: process.execPath,
            args: args
        }, (_error, result, code) => {
            resolve({
                cmd: args,
                code: code,
                stdout: result.stdout,
                stderr: result.stderr
            });
        });
    });
}
