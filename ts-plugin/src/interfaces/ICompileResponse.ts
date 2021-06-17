/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

export interface ICompileResponse {
    time: number;
    isSuccess: boolean;
    errors: string[];
}