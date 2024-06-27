/// <reference types="grunt" />
/*
 * @nevware21/grunt-eslint-ts
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2024 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import { IGruntLogger, IGruntWrapper } from '@nevware21/grunt-plugins-shared-utils';
import * as sinon from 'sinon';

export class MockGrunt implements IGruntWrapper {
    constructor() {
        this.file = {
            read: sinon.stub(),
            write: sinon.stub(),
            // Add other methods as needed
        } as any;
        this.log = {
            writeln: sinon.stub(),
            write: sinon.stub(),
            // Add other methods as needed
        } as any;
        this.task = {
            registerTask: sinon.stub(),
            registerMultiTask: sinon.stub(),
            renameTask: sinon.stub(),
            loadTasks: sinon.stub(),
            loadNpmTasks: sinon.stub(),
            registerInitTask: sinon.stub(),
            // Add other methods as needed
        } as any;
        this.config = {
            init: function (config: grunt.config.IProjectConfig): void {
                throw new Error("Function not implemented.");
            },
            get: function <T>(prop?: string): T {
                throw new Error("Function not implemented.");
            },
            process: function <T>(value: string): T {
                throw new Error("Function not implemented.");
            },
            getRaw: function <T>(prop: string): T {
                throw new Error("Function not implemented.");
            },
            set: function (prop: string, value: any): any {
                throw new Error("Function not implemented.");
            },
            escape: function (propString: string): string {
                throw new Error("Function not implemented.");
            },
            requires: function (prop: string | string[], ...andProps: string[] | string[][]): void {
                throw new Error("Function not implemented.");
            },
            merge: function <T>(configObject: T): void {
                throw new Error("Function not implemented.");
            },
            getPropString: sinon.stub(),
            getProp: sinon.stub(),
            setProp: sinon.stub(),
            delProp: sinon.stub(),
            pushProp: sinon.stub(),
            multiprop: sinon.stub(),
        } as any;
        this.option = {
            init: sinon.stub(),
            get: sinon.stub(),
            getBoolean: sinon.stub(),
            getNumber: sinon.stub(),
            getArray: sinon.stub(),
            getRaw: sinon.stub(),
            set: sinon.stub(),
            defaults: sinon.stub(),
        } as any;
        this.event = {
            on: sinon.stub(),
            off: sinon.stub(),
            emit: sinon.stub(),
        } as any;
        this.fail = {
            warn: function (error: string | Error, errorCode?: grunt.fail.ErrorCode | undefined): void {
                throw new Error("Function not implemented.");
            },
            fatal: function (error: string | Error, errorCode?: grunt.fail.ErrorCode | undefined): void {
                throw new Error("Function not implemented.");
            }
        };

        this.util = {
            // Add methods as needed
        } as grunt.util.UtilModule;
        this.package = {};
        this.version = '1.0.0';
    }

    grunt: IGrunt;
    isDebug: boolean;
    config: grunt.config.ConfigModule;
    event: grunt.event.EventModule;
    fail: grunt.fail.FailModule;
    file: grunt.file.FileModule;
    option: grunt.option.OptionModule;
    task: grunt.task.TaskModule;
    util: grunt.util.UtilModule;
    package: any;
    version: string;

    hasErrors: () => boolean;
    hasWarnings: () => boolean;
    log: (msg: string) => IGruntLogger;
    logWrite: (msg: string) => IGruntLogger;
    logError: (msg: string) => IGruntLogger;
    logWarn: (msg: string) => IGruntLogger;
    logDebug: (msg: string) => IGruntLogger;
    logVerbose: (msg: string) => IGruntLogger;
}
