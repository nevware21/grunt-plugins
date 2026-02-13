/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2023 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */


import { assert } from "@nevware21/tripwire";
import { deepMerge, mergeOptions, resolveValue, resolveValueAsync } from "../../src/utils";

describe("utils", () => {

    describe("resolveValue", () => {
        it("should return value1 when it is defined", () => {
            const result = resolveValue(1, 2, 3);
            assert.strictEqual(result, 1);
        });

        it("should return value2 when value1 is undefined", () => {
            const result = resolveValue<any>(undefined, 2, 3);
            assert.strictEqual(result, 2);
        });

        it("should return defaultValue when both value1 and value2 are undefined", () => {
            const result = resolveValue(undefined, undefined, 3);
            assert.strictEqual(result, 3);
        });

        it("should return undefined when all values are undefined", () => {
            const result = resolveValue(undefined, undefined, undefined);
            assert.strictEqual(result, undefined);
        });
    });

    describe("resolveValueAsync", () => {
        it("should return value1 when it is defined", async () => {
            const result = await resolveValueAsync(1, 2, 3);
            assert.strictEqual(result, 1);
        });

        it("should return value2 when value1 is undefined", async () => {
            const result = await resolveValueAsync<any>(undefined, 2, 3);
            assert.strictEqual(result, 2);
        });

        it("should return defaultValue when both value1 and value2 are undefined", async () => {
            const result = await resolveValueAsync(undefined, undefined, 3);
            assert.strictEqual(result, 3);
        }); 

        it("should return undefined when all values are undefined", async () => {
            const result = await resolveValueAsync(undefined, undefined, undefined);
            assert.strictEqual(result, undefined);
        });

        it("should return the resolved value when value1 is a function", async () => {
            const result = await resolveValueAsync(() => 1, 2, 3);
            assert.strictEqual(result, 1);
        });

        it("should return the resolved value when value2 is a function", async () => {
            const result = await resolveValueAsync<any>(undefined, () => 2, 3);
            assert.strictEqual(result, 2);
        });

        it("should return the resolved value when defaultValue is a function", async () => {
            const result = await resolveValueAsync(undefined, undefined, 3);
            assert.strictEqual(result, 3);
        });

        it("should return the resolved value when all values are functions", async () => {
            const result = await resolveValueAsync(() => 1, () => 2, 3);
            assert.strictEqual(result, 1);
        });

        it("should return the resolved value when all values are promises", async () => {
            const result = await resolveValueAsync(Promise.resolve(1), Promise.resolve(2), 3);
            assert.strictEqual(result, 1);
        });

        it("should return the resolved value when value1 is a promise", async () => {
            const result = await resolveValueAsync(Promise.resolve(1), 2, 3);
            assert.strictEqual(result, 1);
        });

        it("should return the resolved value when value2 is a promise", async () => {
            const result = await resolveValueAsync<any>(undefined, Promise.resolve(2), 3);
            assert.strictEqual(result, 2);
        });

        it("should return the resolved value when defaultValue is a promise", async () => {
            const result = await resolveValueAsync(undefined, undefined, 3);
            assert.strictEqual(result, 3);
        });

        it("should return the resolved value when all values are promises", async () => {
            const result = await resolveValueAsync(Promise.resolve(1), Promise.resolve(2), 3);
            assert.strictEqual(result, 1);
        });

        it("should return the resolved value when value1 is a promise and value2 is a function", async () => {
            const result = await resolveValueAsync(Promise.resolve(1), () => 2, 3);
            assert.strictEqual(result, 1);
        });

        it("should return the resolved value when value1 is a promise and defaultValue is a function", async () => {
            const result = await resolveValueAsync(Promise.resolve(1), undefined, 3);
            assert.strictEqual(result, 1);
        });

        it("should return the resolved value when value2 is a promise and defaultValue is a function", async () => {
            const result = await resolveValueAsync(undefined, Promise.resolve(2), 3);
            assert.strictEqual(result, 2);
        });

        it("should return the resolved value when all values are promises and functions", async () => {
            const result = await resolveValueAsync(Promise.resolve(1), () => 2, 3);
            assert.strictEqual(result, 1);
        });


    });
    
    describe("deepMerge", () => {
        it("should merge two non-empty objects", () => {
            const target = { a: 1, b: { c: 2 } };
            const src = { b: { d: 3 }, e: 4 };
            const result = deepMerge<any>(target, src);
            assert.deepStrictEqual(result, { a: 1, b: { c: 2, d: 3 }, e: 4 });
        });

        it("should return src when target is an empty object", () => {
            const target = {};
            const src = { a: 1 };
            const result = deepMerge(target, src);
            assert.deepStrictEqual(result, { a: 1 });
        });

        it("should return target when src is an empty object", () => {
            const target = { a: 1 };
            const src = {};
            const result = deepMerge(target, src);
            assert.deepStrictEqual(result, { a: 1 });
        });

        it("should return an empty object when both target and src are empty", () => {
            const target = {};
            const src = {};
            const result = deepMerge(target, src);
            assert.deepStrictEqual(result, {});
        });
    });

    describe("mergeOptions", () => {
        it("should merge all three values", () => {
            const result = mergeOptions({ a: 1 }, { b: 2 }, { c: 3 });
            assert.deepStrictEqual(result, { a: 1, b: 2, c: 3 });
        });

        it("should merge two values", () => {
            const result = mergeOptions({ a: 1 }, { b: 2 });
            assert.deepStrictEqual(result, { a: 1, b: 2 });
        });

        it("should return the single value", () => {
            const result = mergeOptions({ a: 1 });
            assert.deepStrictEqual(result, { a: 1 });
        });

        it("should return an empty object when no values are provided", () => {
            const result = mergeOptions();
            assert.strictEqual(result, undefined);
        });
    });
});