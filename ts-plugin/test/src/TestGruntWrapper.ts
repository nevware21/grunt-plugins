/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2023 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import { IGruntLogger, IGruntWrapper } from "@nevware21/grunt-plugins-shared-utils";

export class TestGruntWrapper implements IGruntWrapper {
    _messages: { type: string, msg: string }[];
    
    constructor() {
        this._messages = [];
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
    hasErrors: () => boolean;
    hasWarnings: () => boolean;
    log: (msg: string) => IGruntLogger = (msg: string) => {
        this._messages.push({ type: "log", msg })
        return this;
    };
    logWrite: (msg: string) => IGruntLogger;
    logError: (msg: string) => IGruntLogger;
    logWarn: (msg: string) => IGruntLogger = (msg: string) => {
        this._messages.push({ type: "warn", msg })
        return this;
    };
    logDebug: (msg: string) => IGruntLogger = (msg: string) => {
        this._messages.push({ type: "debug", msg })
        return this;
    };
    logVerbose: (msg: string) => IGruntLogger = (msg: string) => {
        this._messages.push({ type: "verbose", msg })
        return this;
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fileExists(_filepath: string): boolean {
        // Implement your mock logic here
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    readFile(_filepath: string): string {
        // Implement your mock logic here
        return "{}";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    writeTempFile(_content: string): string {
        // Implement your mock logic here
        return "/tmp/tempfile";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteTempFile(_filepath: string): void {
        // Implement your mock logic here
    }
}