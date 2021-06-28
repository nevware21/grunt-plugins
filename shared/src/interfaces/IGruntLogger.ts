/// <reference types="grunt" />
/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

export interface IGruntLogger {
    hasErrors: () => boolean;
    hasWarnings: () => boolean;

    log: (msg: string) => IGruntLogger;
    logWrite: (msg: string) => IGruntLogger;
    logError: (msg: string) => IGruntLogger;
    logWarn: (msg: string) => IGruntLogger;
    logDebug: (msg: string) => IGruntLogger;
    logVerbose: (msg: string) => IGruntLogger;
}
