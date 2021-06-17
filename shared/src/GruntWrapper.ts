/// <reference types="grunt" />
/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import { IGruntLogger } from "./interfaces/IGruntLogger";
import { IGruntWrapper, IGruntWrapperOptions } from "./interfaces/IGruntWrapper";


class GruntLogger implements IGruntLogger {

    hasErrors: () => boolean;
    hasWarnings: () => boolean;

    log: (msg: string) => IGruntLogger;
    logWrite: (msg: string) => IGruntLogger;
    logError: (msg: string) => IGruntLogger;
    logWarn: (msg: string) => IGruntLogger;
    logDebug: (msg: string) => IGruntLogger;
    logVerbose: (msg: string) => IGruntLogger;

    constructor (grunt: IGrunt, loggerOptions: IGruntWrapperOptions) {
        let numErrors = 0;
        let numWarnings = 0;

        this.hasErrors = () => numErrors > 0;
        this.hasWarnings = () => numWarnings > 0;

        this.log = (msg: string) => {
            if (msg) {
                grunt.log.writeln(msg);
            }

            return this;
        };

        this.logWrite = (msg: string) => {
            if (msg) {
                grunt.log.write(msg);
            }

            return this;
        };

        this.logError = (msg: string) => {
            if (msg) {
                numErrors++;
                grunt.log.error(msg);
            }

            return this;
        };

        this.logWarn = (msg: string) => {
            if (msg && loggerOptions.warnings !== false) {
                numWarnings++;
                grunt.log.warn(msg);
            }

            return this;
        };

        this.logDebug = (msg: string) => {
            if (msg && loggerOptions.debug) {
                grunt.log.writeln(msg);
            }

            return this;
        };

        this.logVerbose = (msg: string) => {
            if (msg && loggerOptions.debug) {
                grunt.log.verbose.writeln(msg);
            }

            return this;
        };
    }
}

export class GruntWrapper extends GruntLogger implements IGruntWrapper {
    private _grunt: IGrunt;
    private _options: IGruntWrapperOptions;

    constructor(grunt: IGrunt, options: IGruntWrapperOptions) {
        super(grunt, options);
        this._grunt = grunt;
        this._options = options;
    }

    public get grunt() {
        return this._grunt;
    }

    public get isDebug() {
        return !!this._options.debug;
    }

    public get config() {
        return this._grunt.config;
    }

    public get event() {
        return this._grunt.event;
    }

    public get fail() {
        return this._grunt.fail;
    }

    public get file() {
        return this._grunt.file;
    }

    public get option() {
        return this._grunt.option;
    }

    public get task() {
        return this._grunt.task;
    }

    public get util() {
        return this._grunt.util;
    }
}
