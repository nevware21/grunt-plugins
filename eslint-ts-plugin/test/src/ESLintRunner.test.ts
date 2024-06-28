/// <reference types="grunt" />
/*
 * @nevware21/grunt-eslint-ts
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2024 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import * as assert from "assert";
import * as sinon from 'sinon';
import { IGruntWrapper } from '@nevware21/grunt-plugins-shared-utils';
import { ESLintRunner } from '../../src/ESLintRunner';
import { IESLintRunnerOptions } from '../../src/interfaces/IESLintRunnerOptions';
import { MockGrunt } from "./MockGrunt";

describe('ESLintRunner', () => {
    let grunt: IGruntWrapper;
    let options: IESLintRunnerOptions;

    beforeEach(() => {
        let _grunt = {} as IGruntWrapper;
        // Initialize the mock grunt object and options
        grunt = new MockGrunt();
        options = {
            // Initialize the options as needed
        };
    });

    it('should construct without errors', () => {
        const runner = new ESLintRunner(grunt, options);
        assert.ok(runner);
    });

    it('should lint without errors', async () => {
        const runner = new ESLintRunner(grunt, options);
        const result = await runner.lint();
        assert.ok(result);
    });
});