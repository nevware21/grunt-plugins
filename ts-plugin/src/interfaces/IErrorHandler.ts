/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

export enum ErrorHandlerResponse {
    /**
     * The handler did not identify whether this should be treated as an error, warning or ignore. 
     * So follow normal built in handling.
     * Null and undefined responses are treated the same as this value
     */
    Undefined = 0,

    /**
     * Ignore this error with no logging
     */
    Ignore = 1,

    /**
     * Include the error in the log, but don't treat as an error or warning
     */
    Silent = 2,

     /**
     * Treat as an error and fail the build
     */
    Error = 3,
}

export type OnErrorHandler = (errorNumber: string, line?: string) => ErrorHandlerResponse;

