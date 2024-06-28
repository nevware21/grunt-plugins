/// <reference types="grunt" />
/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import { IGruntLogger } from "./IGruntLogger";

export interface IGruntWrapperOptions {
    /**
     * Are debug logs enabled
     */
    debug: boolean;

    /**
     * Are warnings explicity enabled or disabled (defaults to enabled)
     */
    warnings?: boolean;
}

export interface IGruntWrapper extends IGruntLogger {
    /**
     * Returns the current grunt instance
     */
    grunt: IGrunt;

    /**
     * Returns whether debugging is enabled
     */
    isDebug: boolean;

    config: grunt.config.ConfigModule;

    event: grunt.event.EventModule;
    
    fail: grunt.fail.FailModule;
    
    file: grunt.file.FileModule;
    
    option: grunt.option.OptionModule;
    
    task: grunt.task.TaskModule;
    
    util: grunt.util.UtilModule;
}
