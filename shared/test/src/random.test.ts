/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2023 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import { assert } from "@nevware21/tripwire";
import { getRandomHex } from "../../src/random";

describe("random", () => {
    it("getRandomHex length", () => {
        assert.equal(8, getRandomHex(8).length);
        assert.equal(2, getRandomHex(2).length);
        assert.equal(0, getRandomHex(0).length);
        assert.equal(42, getRandomHex(42).length);
    });
});
