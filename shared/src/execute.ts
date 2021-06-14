/// <reference types="grunt" />
/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import { IExecuteResponse } from "./interfaces/IExecuteResponse";

export function doExecute(grunt: IGrunt, args: string[]): Promise<IExecuteResponse> {
    return new Promise<IExecuteResponse>((resolve, reject) => {
        // Log the complete running command line
        grunt.log.verbose.writeln("Executing: [" + (args.join(" ")).cyan + "]")
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
