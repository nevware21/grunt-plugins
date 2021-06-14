/// <reference types="grunt" />

/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import { getGruntMultiTaskOptions, resolveValue } from "@nevware21/grunt-plugins-shared-utils";
import { ITsPluginOptions, ITsPluginTaskOptions } from "./interfaces/ITsPluginOptions";
import { ITypeScriptCompilerOptions, TypeScriptCompiler } from "./TypeScript";

export function pluginFn (grunt: IGrunt) {
    grunt.registerMultiTask("ts", "Compile TypeScript project", function () {
        // Merge task-specific and/or target-specific options with these defaults.
        let options = this.options<ITsPluginOptions>({
        });

        let taskOptions = getGruntMultiTaskOptions<ITsPluginTaskOptions>(grunt, this);

        if (options.debug) {
            grunt.log.verbose.writeln((" Options: [" + JSON.stringify(options) + "]").cyan);
            grunt.log.verbose.writeln((" Config : [" + JSON.stringify(this.data) + "]").cyan);
        }

        if (!grunt.file.exists(taskOptions.tsconfig)) {
            grunt.log.error("The TSConfig project file [" + taskOptions.tsconfig + "] does not exist");
            return false;
        }

        let tsOptions:ITypeScriptCompilerOptions = {
            tsconfig: taskOptions.tsconfig,
            tscPath: resolveValue(taskOptions.tscPath, options.tscPath, null),
            compiler: resolveValue(taskOptions.compiler, options.compiler, null),
            baseDir: resolveValue(taskOptions.baseDir, options.baseDir, null),
            additionalFlags: resolveValue(taskOptions.additionalFlags, taskOptions.additionalFlags, null),
            debug: resolveValue(taskOptions.debug, options.debug, false),
            failOnTypeErrors: resolveValue(taskOptions.failOnTypeErrors, taskOptions.failOnTypeErrors, false),
            out: taskOptions.out
        };

        //let tsConfig = require(options.tsconfig);

        let done = this.async();

        (async function () {
            let ts = new TypeScriptCompiler(grunt, tsOptions);

            await ts.compile(taskOptions.src || []);
            done(true);
        })().catch((error) => {
            grunt.log.error(error);
            done(false);
        });
    });
}
