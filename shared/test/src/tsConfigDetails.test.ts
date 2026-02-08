/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2023 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */


import { assert } from "@nevware21/tripwire";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { IGruntWrapper } from "../../src/shared-utils";
import { getTsConfigDetails } from "../../src/tsConfigDetails";
import { arrForEach } from "@nevware21/ts-utils";
import { TestGruntWrapper } from "./TestGruntWrapper";

describe("getTsConfigDetails", () => {
    let grunt: IGruntWrapper;
    let filePathBase: string;
    let filePathEs5: string;
    let filePathEs6: string;

    beforeEach(() => {
        grunt = new TestGruntWrapper();
    });

    afterEach(() => {
        if (fs.existsSync(filePathBase)) {
            fs.unlinkSync(filePathBase);
        }

        if (fs.existsSync(filePathEs5)) {
            fs.unlinkSync(filePathEs5);
        }

        if (fs.existsSync(filePathEs6)) {
            fs.unlinkSync(filePathEs6);
        }
    });

    function _createTestConfigs() {
        filePathBase = path.join(os.tmpdir(), "tsconfig.base.json");
        const baseContent = {
            "compilerOptions": {
                declaration: true,
                declarationDir: "./build/types",
                removeComments: false,
                rootDir: "./src",
            }
        };

        fs.writeFileSync(filePathBase, JSON.stringify(baseContent));

        filePathEs5 = path.join(os.tmpdir(), "tsconfig.es5.json");
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

        fs.writeFileSync(filePathEs5, JSON.stringify(content));

        filePathEs6 = path.join(os.tmpdir(), "tsconfig.es6.json");
        const contentEs6 = {
            "extends": "./tsconfig.base.json",
            "compilerOptions": {
                target: "es6",
                declaration: true,
                declarationDir: "./build/types",
                removeComments: false,
                rootDir: "./src",
                outDir: "./dist-es6"
            }
        };

        fs.writeFileSync(filePathEs6, JSON.stringify(contentEs6));
    }

    it("should return the details of the tsconfig file when it exists", () => {
        _createTestConfigs();
        const expectedContent = {
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

        const result = getTsConfigDetails(grunt, filePathEs5, false);
        assert.equal(result.length, 1)
        assert.deepEqual(result[0].tsConfig, expectedContent);
    });

    it("should return the details of multiple tsconfig files when they exists", () => {
        _createTestConfigs();
        const expectedContent1 = {
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
        const expectedContent2 = {
            "extends": "./tsconfig.base.json",
            "compilerOptions": {
                target: "es6",
                declaration: true,
                declarationDir: "./build/types",
                removeComments: false,
                rootDir: "./src",
                outDir: "./dist-es6"
            }
        };

        const result = getTsConfigDetails(grunt, [ filePathEs5, filePathEs6 ], false);
        assert.equal(result.length, 2)
        assert.deepEqual(result[0].tsConfig, expectedContent1);
        assert.deepEqual(result[1].tsConfig, expectedContent2);
    });

    it("should return the details of multiple tsconfig files when they exists with single compilerOptions override", () => {
        _createTestConfigs();
        const expectedContent1 = {
            "extends": "./tsconfig.base.json",
            "compilerOptions": {
                target: "es5",
                declaration: true,
                declarationDir: "./build/types",
                removeComments: false,
                rootDir: "./override/src",
                outDir: "./dist-es5"
            }
        };
        const expectedContent2 = {
            "extends": "./tsconfig.base.json",
            "compilerOptions": {
                target: "es6",
                declaration: true,
                declarationDir: "./build/types",
                removeComments: false,
                rootDir: "./override/src",
                outDir: "./dist-es6"
            }
        };

        const result = getTsConfigDetails(grunt, [  
            {
                name: filePathEs5,
                tsconfig: {
                    compilerOptions: {
                        rootDir: "./override/src" 
                    }
                }
            },
            {
                name: filePathEs6,
                tsconfig: {
                    compilerOptions: {
                        rootDir: "./override/src" 
                    }
                }
            }],
            false);
        assert.equal(result.length, 2)
        assert.deepEqual(result[0].tsConfig, expectedContent1, "Actual:" + JSON.stringify(result[0].tsConfig, null, 2));
        assert.deepEqual(result[1].tsConfig, expectedContent2, "Actual:" + JSON.stringify(result[1].tsConfig, null, 2));
    });

    it("should return the details of multiple tsconfig files when provided with multiple variants as an array", () => {
        _createTestConfigs();
        const expectedContent1 = {
            "compilerOptions": {
                target: "es5",
                declaration: true,
                declarationDir: "./build/types",
                removeComments: false,
                rootDir: "./src",
                outDir: "./dist-es5"
            }
        };
        const expectedContent2 = {
            "compilerOptions": {
                target: "es6",
                declaration: true,
                declarationDir: "./build/types",
                removeComments: false,
                rootDir: "./src",
                outDir: "./dist-es6"
            }
        };

        const result = getTsConfigDetails(grunt, [
            {
                name: filePathBase,
                tsconfig: {
                    compilerOptions: {
                        target: "es5",
                        outDir: "./dist-es5"
                    }
                }
            },
            {
                name: filePathBase,
                tsconfig: {
                    compilerOptions: {
                        target: "es6",
                        outDir: "./dist-es6"
                    }
                }
            }
        ], false);
        assert.equal(result.length, 2)
        assert.deepEqual(result[0].tsConfig, expectedContent1);
        assert.deepEqual(result[1].tsConfig, expectedContent2);
    });

    it("should return the details of multiple tsconfig files when provided with multiple variants as an iterable", () => {
        _createTestConfigs();
        const expectedContent1 = {
            "compilerOptions": {
                target: "es5",
                declaration: true,
                declarationDir: "./build/types",
                removeComments: false,
                rootDir: "./src",
                outDir: "./dist-es5"
            }
        };
        const expectedContent2 = {
            "compilerOptions": {
                target: "es6",
                declaration: true,
                declarationDir: "./build/types",
                removeComments: false,
                rootDir: "./src",
                outDir: "./dist-es6"
            }
        };

        const result = getTsConfigDetails(grunt, {
            [Symbol.iterator]: function* () {
                yield {
                    name: filePathBase,
                    tsconfig: {
                        compilerOptions: {
                            target: "es5",
                            outDir: "./dist-es5"
                        }
                    }
                };
                yield {
                    name: filePathBase,
                    tsconfig: {
                        compilerOptions: {
                            target: "es6",
                            outDir: "./dist-es6"
                        }
                    }
                };
            }
        }, false);
        assert.equal(result.length, 2)
        assert.deepEqual(result[0].tsConfig, expectedContent1);
        assert.deepEqual(result[1].tsConfig, expectedContent2);
    });

    it("should return the details of multiple tsconfig files when provided with multiple variants via an iterator", async () => {
        _createTestConfigs();
        const expectedContent1 = {
            "compilerOptions": {
                target: "es5",
                declaration: true,
                declarationDir: "./build/types",
                removeComments: false,
                rootDir: "./src",
                outDir: "./dist-es5"
            }
        };
        const expectedContent2 = {
            "compilerOptions": {
                target: "es6",
                declaration: true,
                declarationDir: "./build/types",
                removeComments: false,
                rootDir: "./src",
                outDir: "./dist-es6"
            }
        };

        const result = getTsConfigDetails(grunt, {
            next: function() {
                if (this._index === undefined) {
                    this._index = 0;
                } else {
                    this._index++;
                }

                if (this._index < 2) {
                    return { done: false, value: {
                        name: filePathBase,
                        tsconfig: {
                            compilerOptions: {
                                target: this._index === 0 ? "es5" : "es6",
                                outDir: this._index === 0 ? "./dist-es5" : "./dist-es6"
                            }
                        }
                    }};
                }

                return { done: true, value: undefined };
            }
        }, false);
        assert.equal(result.length, 2)
        assert.deepEqual(result[0].tsConfig, expectedContent1);
        assert.deepEqual(result[1].tsConfig, expectedContent2);
    });

    it("should return the details of multiple tsconfig files when tsconfig uses the default is provided with multiple compilerOptions", () => {
        _createTestConfigs();
        const expectedContent1 = {
            compilerOptions: {
                sourceMap: true,
                inlineSources: true,
                noImplicitAny: true,
                module: "es6",
                moduleResolution: "node",
                target: "es5",
                forceConsistentCasingInFileNames: true,
                importHelpers: true,
                noEmitHelpers: false,
                alwaysStrict: true,
                declaration: true,
                declarationDir: "./types",
                outDir: "./dist-es5",
                allowSyntheticDefaultImports: true,
                rootDir: "./src",
                removeComments: true
            },
            "include" : [
                "./src/**/*.ts"
            ],
            "exclude": [
                "node_modules/"
            ]
        };

        const expectedContent2 = {
            compilerOptions: {
                sourceMap: true,
                inlineSources: true,
                noImplicitAny: true,
                module: "es6",
                moduleResolution: "node",
                target: "es6",
                forceConsistentCasingInFileNames: true,
                importHelpers: true,
                noEmitHelpers: false,
                alwaysStrict: true,
                declaration: true,
                declarationDir: "./types",
                outDir: "./dist-es6",
                allowSyntheticDefaultImports: true,
                rootDir: "./src",
                removeComments: true
            },
            "include" : [
                "./src/**/*.ts"
            ],
            "exclude": [
                "node_modules/"
            ]
        };

        const result = getTsConfigDetails(grunt, [
            {
                tsconfig: { 
                    compilerOptions: {
                        target: "es5",
                        outDir: "./dist-es5"
                    }
                }
            },
            {
                tsconfig: { 
                    compilerOptions: {
                        target: "es6",
                        outDir: "./dist-es6"
                    }
                }
            }
        ], false);
        assert.equal(result.length, 2)
        assert.equal(result[0].name, "./tsconfig.json");
        assert.deepEqual(result[0].tsConfig, expectedContent1);

        assert.equal(result[1].name, "./tsconfig.json");
        assert.deepEqual(result[1].tsConfig, expectedContent2);
    });

    it("should return the details of multiple tsconfig files when tsconfig does not exist and is provided with multiple compilerOptions", () => {
        _createTestConfigs();
        const expectedContent1 = {
            compilerOptions: {
                target: "es5",
                outDir: "./dist-es5",
            }
        };

        const expectedContent2 = {
            compilerOptions: {
                target: "es6",
                outDir: "./dist-es6",
            }
        };

        const result = getTsConfigDetails(grunt, [
            {
                name: "./non-existing.json",
                tsconfig: { 
                    compilerOptions: {
                        target: "es5",
                        outDir: "./dist-es5"
                    }
                }
            },
            {
                name: "./non-existing.json",
                tsconfig: { 
                    compilerOptions: {
                        target: "es6",
                        outDir: "./dist-es6"
                    }
                }
            }
        ], false);
        assert.equal(result.length, 2)
        assert.equal(result[0].name, "./non-existing.json");
        assert.deepEqual(result[0].tsConfig, expectedContent1);

        assert.equal(result[1].name, "./non-existing.json");
        assert.deepEqual(result[1].tsConfig, expectedContent2);
    });

    it("should return an empty details object when the tsconfig file does not exist", () => {
        const filePath = path.join(os.tmpdir(), "non-existing.json");
        const result = getTsConfigDetails(grunt, filePath, false);
        assert.equal(result.length, 1)
        assert.deepEqual(result[0].tsConfig, {compilerOptions:{}});
    });

    it("should return an empty details object when the tsconfig is past as null / undefined / empty", () => {

        let defaultConfig = JSON.parse(fs.readFileSync("./tsconfig.json", "utf8"));

        const result1 = getTsConfigDetails(grunt, null, false);
        assert.equal(result1.length, 1, "result1: " + JSON.stringify(result1))
        assert.deepEqual(result1[0].tsConfig, defaultConfig, "result1: " + JSON.stringify(result1));

        const result2 = getTsConfigDetails(grunt, undefined, false);
        assert.equal(result2.length, 1, "result2: " + JSON.stringify(result2))
        assert.deepEqual(result2[0].tsConfig, defaultConfig, "result2: " + JSON.stringify(result2));

        const result3 = getTsConfigDetails(grunt, "", false);
        assert.equal(result3.length, 1, "result3: " + JSON.stringify(result3))
        assert.deepEqual(result3[0].tsConfig, defaultConfig, "result3: " + JSON.stringify(result3));
    });

    describe("addFiles", () => {
        it("should add a single file to the tsConfig", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            assert.equal(details.length, 1)
            details[0].addFiles("file1.ts");
            assert.deepEqual(details[0].tsConfig.include, [ "./src/**/*.ts", "file1.ts" ]);
        });
    
        it("should add multiple files to the tsConfig", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            assert.equal(details.length, 1)
            details[0].addFiles([ "file1.ts", "file2.ts"]);
            assert.deepEqual(details[0].tsConfig.include, [ "./src/**/*.ts", "file1.ts", "file2.ts"]);
        });
    
        it("should add the files to the exclude list when they start with \"!\"", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            assert.equal(details.length, 1)
            details[0].addFiles(["!file1.ts", "file2.ts"]);
            assert.deepEqual(details[0].tsConfig.include, [ "./src/**/*.ts", "file2.ts" ]);
            assert.deepEqual(details[0].tsConfig.exclude, [ "node_modules/", "file1.ts" ]);
        });
    
        it("should add the files to the include list with a \"/*\" suffix when they end with \"**\"", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            assert.equal(details.length, 1)
            details[0].addFiles(["dir/**", "file2.ts"]);
            assert.deepEqual(details[0].tsConfig.include, [ "./src/**/*.ts", "dir/**/*", "file2.ts"] );
        });
    });

    describe("getFiles", () => {
        it("should return the files from tsConfig.files when details.name is not null", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            assert.equal(details.length, 1)
            details[0].tsConfig = { files: ["file1.ts", "file2.ts"] };
            const files = details[0].getFiles();
            assert.deepEqual(files, ["file1.ts", "file2.ts"]);
        });

        it("should return the files from tsConfig.include when details.name is not null and tsConfig.files is null", () => {
            const details = getTsConfigDetails(grunt, "tsconfig.json", false);
            assert.equal(details.length, 1)
            details[0].tsConfig = { include: ["file1.ts", "file2.ts"] };
            const files = details[0].getFiles();
            assert.deepEqual(files, ["file1.ts", "file2.ts"]);
        });

        it("should return an empty array when details.name is null", () => {
            const details = getTsConfigDetails(grunt, null, false);
            assert.equal(details.length, 1)
            assert.deepEqual(details[0].tsConfig.include, [ "./src/**/*.ts"]);
            const files = details[0].getFiles();
            assert.deepEqual(files, [ "./src/**/*.ts" ]);
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

