/// <reference types="grunt" />
/*
 * @nevware21/grunt-eslint-ts
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2024 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import { assert } from "@nevware21/tripwire";
import * as fs from "fs";
import * as path from "path";
import { IExecuteResponse, IGruntWrapper } from "@nevware21/grunt-plugins-shared-utils";
import { TestGruntWrapper } from "./TestGruntWrapper";
import { ITypeScriptCompilerOptions, TypeScriptCompiler } from "../../src/TypeScript";
import { dumpObj } from "@nevware21/ts-utils";

describe("TypeScript", () => {
    let grunt: IGruntWrapper;

    beforeEach(() => {
        grunt = new TestGruntWrapper();
    });

    it("Simple TypeScript", async () => {
        let response: IExecuteResponse = {
            cmd: [],
            code: 0,
            stdout: "",
            stderr: ""
        };

        let theArgs: any[] = [];
        let expectedTsConfig = {
            "compilerOptions": {
                "allowSyntheticDefaultImports": true,
                "alwaysStrict": true,
                "declaration": true,
                "declarationDir": "./types",
                "forceConsistentCasingInFileNames": true,
                "importHelpers": true,
                "inlineSources": true,
                "module": "es6",
                "moduleResolution": "node",
                "noEmitHelpers": false,
                "noImplicitAny": true,
                "outDir": "./dist-esm",
                "removeComments": true,
                "sourceMap": true,
                // "suppressImplicitAnyIndexErrors": true,
                "target": "es5",
            },
            "exclude": [
                "node_modules/"
            ],
            "include": [
                "./src/**/*.ts"
            ]
        };

        let options: ITypeScriptCompilerOptions= {
            tsConfigs: ["tsconfig.json"],
            defaults: {
                execute: (grunt: IGrunt, args: string[]) => {
                    assert.ok("execute called");

                    let cmdFile = fs.readFileSync(args[1].substring(1), "utf8");
                    let parts = cmdFile.split("\n");
                    assert.equal(parts.length, 1, dumpObj(parts));
                    assert.ok(parts[0].startsWith("--project "), dumpObj(parts));
                    let tsConfig = JSON.parse(fs.readFileSync(parts[0].substring(10), "utf8"));

                    theArgs.push({
                        args: args,
                        tsConfig: tsConfig,
                        tsCmd: cmdFile
                    });
                    return Promise.resolve(response)
                }
            }
        };

        let compiler = new TypeScriptCompiler(grunt, options);

        let theResponse = await compiler.compile([]);

        assert.ok(theResponse, dumpObj(theResponse));
        assert.equal(theArgs.length, 1, dumpObj(theArgs));
        assert.deepEqual(expectedTsConfig, theArgs[0].tsConfig, dumpObj(theArgs));
    });

    it("Simple TypeScript with single variant", async () => {
        let response: IExecuteResponse = {
            cmd: [],
            code: 0,
            stdout: "",
            stderr: ""
        };

        let theArgs: any[] = [];
        let expectedTsConfig = {
            "compilerOptions": {
                "allowSyntheticDefaultImports": true,
                "alwaysStrict": true,
                "declaration": true,
                "declarationDir": "./types",
                "forceConsistentCasingInFileNames": true,
                "importHelpers": true,
                "inlineSources": true,
                "module": "esnext",
                "moduleResolution": "node",
                "noEmitHelpers": false,
                "noImplicitAny": true,
                "outDir": "./dist-esm",
                "removeComments": true,
                "sourceMap": true,
                // "suppressImplicitAnyIndexErrors": true,
                "target": "es5",
            },
            "exclude": [
                "node_modules/"
            ],
            "include": [
                "./src/**/*.ts"
            ]
        };

        let options: ITypeScriptCompilerOptions= {
            tsConfigs: [{
                name: "tsconfig.json",
                tsconfig: {
                    compilerOptions: {
                        module: "esnext"
                    }
                }
            }],
            defaults: {
                execute: (grunt: IGrunt, args: string[]) => {
                    assert.ok("execute called");

                    let cmdFile = fs.readFileSync(args[1].substring(1), "utf8");
                    let parts = cmdFile.split("\n");
                    assert.equal(parts.length, 1, dumpObj(parts));
                    assert.ok(parts[0].startsWith("--project "), dumpObj(parts));
                    console.log(dumpObj(parts));
                    let tsConfig = JSON.parse(fs.readFileSync(parts[0].substring(10), "utf8"));

                    theArgs.push({
                        args: args,
                        tsConfig: tsConfig,
                        tsCmd: cmdFile
                    });
                    return Promise.resolve(response)
                }
            }
        };

        let compiler = new TypeScriptCompiler(grunt, options);

        let theResponse = await compiler.compile([]);

        assert.ok(theResponse, dumpObj(theResponse));
        assert.equal(theArgs.length, 1, dumpObj(theArgs));
        assert.deepEqual(expectedTsConfig, theArgs[0].tsConfig, dumpObj(theArgs));
    });

    it("Simple TypeScript with single variant as an array", async () => {
        let response: IExecuteResponse = {
            cmd: [],
            code: 0,
            stdout: "",
            stderr: ""
        };

        let theArgs: any[] = [];
        let expectedTsConfig1 = {
            "compilerOptions": {
                "allowSyntheticDefaultImports": true,
                "alwaysStrict": true,
                "declaration": true,
                "declarationDir": "./types",
                "forceConsistentCasingInFileNames": true,
                "importHelpers": true,
                "inlineSources": true,
                "module": "esnext",
                "moduleResolution": "node",
                "noEmitHelpers": false,
                "noImplicitAny": true,
                "outDir": "./dist-esm",
                "removeComments": true,
                "sourceMap": true,
                // "suppressImplicitAnyIndexErrors": true,
                "target": "es5",
            },
            "exclude": [
                "node_modules/"
            ],
            "include": [
                "./src/**/*.ts"
            ]
        };

        let expectedTsConfig2 = {
            "compilerOptions": {
                "allowSyntheticDefaultImports": true,
                "alwaysStrict": true,
                "declaration": true,
                "declarationDir": "./types",
                "forceConsistentCasingInFileNames": true,
                "importHelpers": true,
                "inlineSources": true,
                "module": "esnext",
                "moduleResolution": "node",
                "noEmitHelpers": false,
                "noImplicitAny": true,
                "outDir": "./dist-esm",
                "removeComments": true,
                "sourceMap": true,
                // "suppressImplicitAnyIndexErrors": true,
                "target": "es5",
            },
            "exclude": [
                "node_modules/"
            ],
            "include": [
                "./src/**/*.ts"
            ]
        };

        let options: ITypeScriptCompilerOptions= {
            tsConfigs: [{
                name: "tsconfig.json",
                tsconfig: {
                    compilerOptions: {
                        module: "esnext"
                    }
                }
            }],
            defaults: {
                execute: (grunt: IGrunt, args: string[]) => {
                    assert.ok("execute called");

                    let cmdFile = fs.readFileSync(args[1].substring(1), "utf8");
                    let parts = cmdFile.split("\n");
                    assert.equal(parts.length, 1, dumpObj(parts));
                    assert.ok(parts[0].startsWith("--project "), dumpObj(parts));
                    console.log(dumpObj(parts));
                    let tsConfig = JSON.parse(fs.readFileSync(parts[0].substring(10), "utf8"));

                    theArgs.push({
                        args: args,
                        tsConfig: tsConfig,
                        tsCmd: cmdFile
                    });
                    return Promise.resolve(response)
                }
            }
        };

        let compiler = new TypeScriptCompiler(grunt, options);

        let theResponse = await compiler.compile([]);

        assert.ok(theResponse, dumpObj(theResponse));
        assert.equal(theArgs.length, 1, dumpObj(theArgs));
        assert.deepEqual(expectedTsConfig1, theArgs[0].tsConfig, dumpObj(theArgs));
    });

    it("Simple TypeScript with multiple variant as an array", async () => {
        let response: IExecuteResponse = {
            cmd: [],
            code: 0,
            stdout: "",
            stderr: ""
        };

        let theArgs: any[] = [];
        let expectedTsConfig1 = {
            "compilerOptions": {
                "allowSyntheticDefaultImports": true,
                "alwaysStrict": true,
                "declaration": true,
                "declarationDir": "./types",
                "forceConsistentCasingInFileNames": true,
                "importHelpers": true,
                "inlineSources": true,
                "module": "esnext",
                "moduleResolution": "node",
                "noEmitHelpers": false,
                "noImplicitAny": true,
                "outDir": "./dist-esm",
                "removeComments": true,
                "sourceMap": true,
                // "suppressImplicitAnyIndexErrors": true,
                "target": "es5",
            },
            "exclude": [
                "node_modules/"
            ],
            "include": [
                "./src/**/*.ts"
            ]
        };

        let expectedTsConfig2 = {
            "compilerOptions": {
                "allowSyntheticDefaultImports": true,
                "alwaysStrict": true,
                "declaration": true,
                "declarationDir": "./types",
                "forceConsistentCasingInFileNames": true,
                "importHelpers": true,
                "inlineSources": true,
                "module": "es2015",
                "moduleResolution": "node",
                "noEmitHelpers": false,
                "noImplicitAny": true,
                "outDir": "./dist-esm",
                "removeComments": true,
                "sourceMap": true,
                // "suppressImplicitAnyIndexErrors": true,
                "target": "es5",
            },
            "exclude": [
                "node_modules/"
            ],
            "include": [
                "./src/**/*.ts",
                "./src/es2015/**/*.ts",
            ]
        };

        let options: ITypeScriptCompilerOptions= {
            tsConfigs: [{
                name: "tsconfig.json",
                tsconfig: {
                    compilerOptions: {
                        module: "esnext"
                    }
                }
            },
            {
                name: "tsconfig.json",
                tsconfig: {
                    compilerOptions: {
                        module: "es2015"
                    },
                    "include": [
                        "./src/es2015/**/*.ts"
                    ]
                }
            }],
            defaults: {
                execute: (grunt: IGrunt, args: string[]) => {
                    assert.ok("execute called");

                    let cmdFile = fs.readFileSync(args[1].substring(1), "utf8");
                    let parts = cmdFile.split("\n");
                    assert.equal(parts.length, 1, dumpObj(parts));
                    assert.ok(parts[0].startsWith("--project "), dumpObj(parts));
                    console.log(dumpObj(parts));
                    let tsConfig = JSON.parse(fs.readFileSync(parts[0].substring(10), "utf8"));

                    theArgs.push({
                        args: args,
                        tsConfig: tsConfig,
                        tsCmd: cmdFile
                    });
                    return Promise.resolve(response)
                }
            }
        };

        let compiler = new TypeScriptCompiler(grunt, options);

        let theResponse = await compiler.compile([]);

        assert.ok(theResponse, dumpObj(theResponse));
        assert.equal(theArgs.length, 2, dumpObj(theArgs));
        assert.deepEqual(expectedTsConfig1, theArgs[0].tsConfig, dumpObj(theArgs[0]));
        assert.deepEqual(expectedTsConfig2, theArgs[1].tsConfig, dumpObj(theArgs[1]));
    });
});
