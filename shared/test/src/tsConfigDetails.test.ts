/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2023 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */


import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { IGruntWrapper } from "../../src/shared-utils";
import { getTsConfigDetails } from "../../src/tsConfigDetails";
import { arrForEach } from "@nevware21/ts-utils";
import { MockGruntWrapper } from "./MockGruntWrapper";


describe("getTsConfigDetails", () => {
    let grunt: IGruntWrapper;

    beforeEach(() => {
        grunt = new MockGruntWrapper();
    });

    it("should return the details of the tsconfig file when it exists", () => {
        const filePath = path.join(os.tmpdir(), "tsconfig.json");
        const content = {
            "extends": "./tsconfig.base.json",
            "compilerOptions": {
                target: "es5",
                declaration: true,
                declarationDir: "./build/types",
                removeComments: false,
                rootDir: "./src",
                outDir: "./dist-es5"
            }
        };

        fs.writeFileSync(filePath, JSON.stringify(content));
        const result = getTsConfigDetails(grunt, filePath, false);
        assert.equal(result.length, 1)
        assert.deepStrictEqual(result[0].tsConfig, content);
        fs.unlinkSync(filePath);
    });

    it("should return an empty details object when the tsconfig file does not exist", () => {
        const filePath = path.join(os.tmpdir(), "non-existing.json");
        const result = getTsConfigDetails(grunt, filePath, false);
        assert.equal(result.length, 1)
        assert.deepStrictEqual(result[0].tsConfig, {});
    });

    describe("addFiles", () => {
        it("should add a single file to the tsConfig", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            assert.equal(details.length, 1)
            details[0].addFiles("file1.ts");
            assert.deepStrictEqual(details[0].tsConfig.include, [ "file1.ts" ]);
        });
    
        it("should add multiple files to the tsConfig", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            assert.equal(details.length, 1)
            details[0].addFiles(["file1.ts", "file2.ts"]);
            assert.deepStrictEqual(details[0].tsConfig.include, ["file1.ts", "file2.ts"]);
        });
    
        it("should add the files to the exclude list when they start with \"!\"", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            assert.equal(details.length, 1)
            details[0].addFiles(["!file1.ts", "file2.ts"]);
            assert.deepStrictEqual(details[0].tsConfig.include, ["file2.ts"]);
            assert.deepStrictEqual(details[0].tsConfig.exclude, [ "node_modules/", "file1.ts" ]);
        });
    
        it("should add the files to the include list with a \"/*\" suffix when they end with \"**\"", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            assert.equal(details.length, 1)
            details[0].addFiles(["dir/**", "file2.ts"]);
            assert.deepStrictEqual(details[0].tsConfig.include, ["dir/**/*", "file2.ts"] );
        });
    });

    describe("getFiles", () => {
        it("should return the files from tsConfig.files when details.name is not null", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            assert.equal(details.length, 1)
            details[0].tsConfig = { files: ["file1.ts", "file2.ts"] };
            const files = details[0].getFiles();
            assert.deepStrictEqual(files, ["file1.ts", "file2.ts"]);
        });

        it("should return the files from tsConfig.include when details.name is not null and tsConfig.files is null", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            assert.equal(details.length, 1)
            details[0].tsConfig = { include: ["file1.ts", "file2.ts"] };
            const files = details[0].getFiles();
            assert.deepStrictEqual(files, ["file1.ts", "file2.ts"]);
        });

        it("should return an empty array when details.name is null", () => {
            const details = getTsConfigDetails(grunt, null, false);
            assert.equal(details.length, 1)
            const files = details[0].getFiles();
            assert.deepStrictEqual(files, []);
        });
    });

    describe("createTemp", () => {
        it("should create a temporary tsconfig file when details.modified is true", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            try {
                assert.equal(details.length, 1)
                details[0].modified = true;
                details[0].tsConfig = { files: ["file1.ts", "file2.ts"] };
                const tempName = details[0].createTemp();
                assert.ok(fs.existsSync(tempName));
            } finally {
                arrForEach(details, (d) => d.cleanupTemp());
                arrForEach(details, (d) => assert.equal(fs.existsSync(d.tempName), false));
            }
        });

        it("should return details.name when details.modified is false", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            try {
                assert.equal(details.length, 1)
                details[0].modified = false;
                const tempName = details[0].createTemp();
                assert.strictEqual(tempName, "tsconfig.json");
            } finally {
                arrForEach(details, (d) => d.cleanupTemp());
                arrForEach(details, (d) => assert.equal(fs.existsSync(d.tempName), false));
            }
        });
    });
});

