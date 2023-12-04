/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2023 Nevware21
 * Licensed under the MIT license.
 */


import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { IGruntLogger, IGruntWrapper } from "../../src/shared-utils";
import { getTsConfigDetails } from "../../src/tsConfigDetails";

class MockGruntWrapper implements IGruntWrapper {
    _messages: { type: string, msg: string }[];
    
    constructor() {
        this._messages = [];
    }

    grunt: IGrunt;
    isDebug: boolean;
    config: grunt.config.ConfigModule;
    event: grunt.event.EventModule;
    fail: grunt.fail.FailModule;
    file: grunt.file.FileModule;
    option: grunt.option.OptionModule;
    task: grunt.task.TaskModule;
    util: grunt.util.UtilModule;
    hasErrors: () => boolean;
    hasWarnings: () => boolean;
    log: (msg: string) => IGruntLogger;
    logWrite: (msg: string) => IGruntLogger;
    logError: (msg: string) => IGruntLogger;
    logWarn: (msg: string) => IGruntLogger;
    logDebug: (msg: string) => IGruntLogger = (msg: string) => {
        this._messages.push({ type: "debug", msg })
        return this;
    };
    logVerbose: (msg: string) => IGruntLogger;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fileExists(_filepath: string): boolean {
        // Implement your mock logic here
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    readFile(_filepath: string): string {
        // Implement your mock logic here
        return "{}";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    writeTempFile(_content: string): string {
        // Implement your mock logic here
        return "/tmp/tempfile";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteTempFile(_filepath: string): void {
        // Implement your mock logic here
    }
}

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
        assert.deepStrictEqual(result.tsConfig, content);
        fs.unlinkSync(filePath);
    });

    it("should return an empty details object when the tsconfig file does not exist", () => {
        const filePath = path.join(os.tmpdir(), "non-existing.json");
        const result = getTsConfigDetails(grunt, filePath, false);
        assert.deepStrictEqual(result.tsConfig, {});
    });

    describe("addFiles", () => {
        it("should add a single file to the tsConfig", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            details.addFiles("file1.ts");
            assert.deepStrictEqual(details.tsConfig.include, [ "file1.ts" ]);
        });
    
        it("should add multiple files to the tsConfig", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            details.addFiles(["file1.ts", "file2.ts"]);
            assert.deepStrictEqual(details.tsConfig.include, ["file1.ts", "file2.ts"]);
        });
    
        it("should add the files to the exclude list when they start with \"!\"", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            details.addFiles(["!file1.ts", "file2.ts"]);
            assert.deepStrictEqual(details.tsConfig.include, ["file2.ts"]);
            assert.deepStrictEqual(details.tsConfig.exclude, [ "node_modules/", "file1.ts" ]);
        });
    
        it("should add the files to the include list with a \"/*\" suffix when they end with \"**\"", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            details.addFiles(["dir/**", "file2.ts"]);
            assert.deepStrictEqual(details.tsConfig.include, ["dir/**/*", "file2.ts"] );
        });
    });

    describe("getFiles", () => {
        it("should return the files from tsConfig.files when details.name is not null", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            details.tsConfig = { files: ["file1.ts", "file2.ts"] };
            const files = details.getFiles();
            assert.deepStrictEqual(files, ["file1.ts", "file2.ts"]);
        });

        it("should return the files from tsConfig.include when details.name is not null and tsConfig.files is null", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            details.tsConfig = { include: ["file1.ts", "file2.ts"] };
            const files = details.getFiles();
            assert.deepStrictEqual(files, ["file1.ts", "file2.ts"]);
        });

        it("should return an empty array when details.name is null", () => {
            const details = getTsConfigDetails(grunt, null, false);
            const files = details.getFiles();
            assert.deepStrictEqual(files, []);
        });
    });

    describe("createTemp", () => {
        it("should create a temporary tsconfig file when details.modified is true", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            try {
                details.modified = true;
                details.tsConfig = { files: ["file1.ts", "file2.ts"] };
                const tempName = details.createTemp();
                assert.ok(fs.existsSync(tempName));
            } finally {
                details.cleanupTemp();
                assert.equal(fs.existsSync(details.tempName), false);
            }
        });

        it("should return details.name when details.modified is false", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            try {
                details.modified = false;
                const tempName = details.createTemp();
                assert.strictEqual(tempName, "tsconfig.json");
            } finally {
                details.cleanupTemp();
                assert.equal(fs.existsSync(details.tempName), false);
            }
        });
    });
});

