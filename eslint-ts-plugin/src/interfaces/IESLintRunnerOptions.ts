/*
 * @nevware21/grunt-eslint-ts
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import { ITsCommonOptions } from "./IEslintTsPluginOptions";

export interface IESLintRunnerOptions extends ITsCommonOptions {
}

export interface IESLintRunnerFileResponse {
    filePath: string;
    messages: string[];
    count: number;
}

export interface IESLintRunnerResponse {
    isSuccess: boolean;
    errors?: IESLintRunnerFileResponse[];
    warnings?: IESLintRunnerFileResponse[];
    fixableErrors?: number,
    fixableWarnings?: number
}

