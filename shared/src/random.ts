/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import { strLeft } from "@nevware21/ts-utils";

const UInt32Mask = 0x100000000;

/**
 * Get a random hex value
 *
 * @returns {string} hex string
 */
export function getRandomHex(length = 8): string {
    let randomValue = "";

    do {
        // Make sure the number is converted into the specified range (0x00000000..0xFFFFFFFF)
        let value = Math.floor((UInt32Mask * Math.random()) | 0) >>> 0;
        randomValue += value.toString(16);
    } while (randomValue.length < length);

    return strLeft(randomValue, length);
}
