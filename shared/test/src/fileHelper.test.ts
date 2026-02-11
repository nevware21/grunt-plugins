/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2023 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { assert } from "@nevware21/tripwire";
import { findCommonPath, findCommonRoot, findModulePath, getTempFile, locateModulePath, makeRelative, makeRelativeTo, normalizePath, quoteIfRequired, readJsonFile } from "../../src/fileHelpers";
import { strEndsWith, strStartsWith } from "@nevware21/ts-utils";

describe("fileHelpers", () => {
    describe("getTempFile", () => {
        it("temp file generation", () => {
            const tmpFile = getTempFile("hello");
            assert.equal(strStartsWith(tmpFile, "hello-"), true);
            assert.equal(strEndsWith(tmpFile, ".tmp"), true);
        });
    });

    describe("quoteIfRequired", () => {

        it("check null / undefined", () => {
            assert.equal(quoteIfRequired(null), null);
            assert.equal(quoteIfRequired(null, true), null);
            assert.equal(quoteIfRequired(null, false), null);
            assert.equal(quoteIfRequired(undefined), undefined);
            assert.equal(quoteIfRequired(undefined, true), undefined);
            assert.equal(quoteIfRequired(undefined, false), undefined);
        });

        it("empty", () => {
            assert.equal(quoteIfRequired(""), "");
            assert.equal(quoteIfRequired("", true), "");
            assert.equal(quoteIfRequired("", false), "");
        });

        it("whitespace", () => {
            assert.equal(quoteIfRequired(" "), "\" \"");
            assert.equal(quoteIfRequired(" ", true), "\" \"");
            assert.equal(quoteIfRequired(" ", false), "\" \"");
        });

        it("with values not requiring quoting", () => {
            assert.equal(quoteIfRequired("./ProgramData"), "ProgramData");
            assert.equal(quoteIfRequired("./ProgramData", true), "ProgramData");
            assert.equal(quoteIfRequired("./ProgramData", false), "./ProgramData");
        });

        it("with values requiring quoting", () => {
            assert.equal(quoteIfRequired("./Program Files"), "\"Program Files\"");
            assert.equal(quoteIfRequired("./Program Files", true), "\"Program Files\"");
            assert.equal(quoteIfRequired("./Program Files", false), "\"./Program Files\"");
        });

        it("with double quoted values", () => {
            assert.equal(quoteIfRequired("\"./ProgramData\""), "ProgramData");
            assert.equal(quoteIfRequired("\"./ProgramData\"", true), "ProgramData");
            assert.equal(quoteIfRequired("\"./ProgramData\"", false), "./ProgramData");
            assert.equal(quoteIfRequired("\"./Program Files\""), "\"Program Files\"");
            assert.equal(quoteIfRequired("\"./Program Files\"", true), "\"Program Files\"");
            assert.equal(quoteIfRequired("\"./Program Files\"", false), "\"./Program Files\"");
        });

        it("with single quoted values", () => {
            assert.equal(quoteIfRequired("'./ProgramData'"), "ProgramData");
            assert.equal(quoteIfRequired("'./ProgramData'", true), "ProgramData");
            assert.equal(quoteIfRequired("'./ProgramData'", false), "./ProgramData");
            assert.equal(quoteIfRequired("'./Program Files'"), "\"Program Files\"");
            assert.equal(quoteIfRequired("'./Program Files'", true), "\"Program Files\"");
            assert.equal(quoteIfRequired("'./Program Files'", false), "\"./Program Files\"");
        });

        it("with previous folder", () => {
            assert.equal(quoteIfRequired("../ProgramData"), "../ProgramData");
            assert.equal(quoteIfRequired("../ProgramData", true), "../ProgramData");
            assert.equal(quoteIfRequired("../ProgramData", false), "../ProgramData");
            assert.equal(quoteIfRequired("../Program Files"), "\"../Program Files\"");
            assert.equal(quoteIfRequired("../Program Files", true), "\"../Program Files\"");
            assert.equal(quoteIfRequired("../Program Files", false), "\"../Program Files\"");
            assert.equal(quoteIfRequired("'../ProgramData'"), "../ProgramData");
            assert.equal(quoteIfRequired("'../ProgramData'", true), "../ProgramData");
            assert.equal(quoteIfRequired("'../ProgramData'", false), "../ProgramData");
            assert.equal(quoteIfRequired("'../Program Files'"), "\"../Program Files\"");
            assert.equal(quoteIfRequired("'../Program Files'", true), "\"../Program Files\"");
            assert.equal(quoteIfRequired("'../Program Files'", false), "\"../Program Files\"");
        });

        it("with multiple relative folders", () => {
            assert.equal(quoteIfRequired("../hello/../ProgramData"), "../ProgramData");
            assert.equal(quoteIfRequired("../darkness/../ProgramData", true), "../ProgramData");
            assert.equal(quoteIfRequired("../my/../ProgramData", false), "../my/../ProgramData");
            assert.equal(quoteIfRequired("../old/../Program Files"), "\"../Program Files\"");
            assert.equal(quoteIfRequired("../friend/../Program Files", true), "\"../Program Files\"");
            assert.equal(quoteIfRequired("../I've/../Program Files", false), "\"../I've/../Program Files\"");
            assert.equal(quoteIfRequired("'../come/../ProgramData'"), "../ProgramData");
            assert.equal(quoteIfRequired("'../to/../ProgramData'", true), "../ProgramData");
            assert.equal(quoteIfRequired("'../talk/../ProgramData'", false), "../talk/../ProgramData");
            assert.equal(quoteIfRequired("'../with/../Program Files'"), "\"../Program Files\"");
            assert.equal(quoteIfRequired("'../you/../Program Files'", true), "\"../Program Files\"");
            assert.equal(quoteIfRequired("'../again/../Program Files'", false), "\"../again/../Program Files\"");
        });
    });

    describe("findCommonRoot", () => {
        it("null / undefined", () => {
            assert.equal(findCommonRoot(null), "");
            assert.equal(findCommonRoot(undefined), "");
        });

        it("empty / invalid values", () => {
            assert.equal(findCommonRoot([]), "");
            assert.equal(findCommonRoot([null, null]), "");
            assert.equal(findCommonRoot([undefined, undefined]), "");
        })

        it("single value", () => {
            assert.equal(findCommonRoot([null]), "");
            assert.equal(findCommonRoot([undefined]), "");
            assert.equal(findCommonRoot(["./hello"]), "./hello");
            assert.equal(findCommonRoot(["./darkness"]), "./darkness");
        });

        it("should return common root when strings have a common root", () => {
            const strings = ["apple", "application", "apply"];
            const result = findCommonRoot(strings);
            assert.strictEqual(result, "appl");
        });

        it("should return empty string when strings do not have a common root", () => {
            const strings = ["apple", "banana", "cherry"];
            const result = findCommonRoot(strings);
            assert.strictEqual(result, "");
        });

        it("should return the string itself when given an array with only one string", () => {
            const strings = ["apple"];
            const result = findCommonRoot(strings);
            assert.strictEqual(result, "apple");
        });

        it("should return empty string when given an empty array", () => {
            assert.strictEqual(findCommonRoot([]), "");
        });
    });

    describe("findCommonPath", () => {
        it("should return common path when paths have a common root", () => {
            const paths = ["/home/user/dir1", "/home/user/dir2", "/home/user/dir3"];
            assert.strictEqual(findCommonPath(paths), "/home/user");

            const winPaths = ["C:\\Users\\user\\Documents", "C:\\Users\\user\\Downloads", "C:\\Users\\user\\Pictures"];
            assert.strictEqual(findCommonPath(winPaths, "\\"), "C:/Users/user");
        });
    
        it("should return empty string when paths do not have a common root", () => {
            const paths = ["/home/user/dir1", "/usr/local/bin", "/etc/hosts"];
            assert.strictEqual(findCommonPath(paths), "");

            const winPaths = ["C:\\Users\\user\\Documents", "D:\\Users\\user\\Downloads", "E:\\Users\\user\\Pictures"];
            assert.strictEqual(findCommonPath(winPaths, "\\"), "");
        });
    
        it("should return common path with specified separator", () => {
            const paths = ["/home/user/dir1", "/home/user/dir2", "/home/user/dir3"];
            assert.strictEqual(findCommonPath(paths, "/"), "/home/user");

            const winPaths = ["C:\\Users\\user\\Documents", "C:\\Users\\user\\Downloads", "C:\\Users\\user\\Pictures"];
            assert.strictEqual(findCommonPath(winPaths, "\\"), "C:/Users/user");
        });
    
        it("should return empty string when given an empty array", () => {
            assert.strictEqual(findCommonPath([]), "");
        });
    });

    describe("normalizePath", () => {
        it("should replace backslashes with slashes", () => {
            assert.strictEqual(normalizePath("C:\\Users\\user\\Documents"), "C:/Users/user/Documents");
        });

        it("should return the path unchanged when it does not contain backslashes", () => {
            const thePath = "/home/user/Documents";
            const result = normalizePath(thePath);
            assert.strictEqual(result, "/home/user/Documents");
        });

        it("should return an empty string when given an empty string", () => {
            const thePath = "";
            const result = normalizePath(thePath);
            assert.strictEqual(result, "");
        });

        it("Handle null path", () => {
            const result = normalizePath(null);
            assert.strictEqual(result, null);
        });

        it("Handle undefined path", () => {
            const result = normalizePath(undefined);
            assert.strictEqual(result, undefined);
        });

        it("Handle empty path", () => {
            const result = normalizePath("");
            assert.strictEqual(result, "");
        });

        it("Handle whitespace path", () => {
            const result = normalizePath(" ");
            assert.strictEqual(result, " ");
        });

        it("Handle path with dot", () => {
            const result = normalizePath(".");
            assert.strictEqual(result, ".");
        });

        it("Handle path with double dot", () => {
            const result = normalizePath("..");
            assert.strictEqual(result, "..");
        });

    });

    describe("makeRelative", () => {
        it("should return a relative path", () => {
            const thePath = "/home/user/Documents";
            const result = makeRelative(thePath);
            assert.strictEqual(result, path.relative(".", "/home/user/Documents").replace(/\\/g, "/"));
        });

        it("should return an empty string when given an empty string", () => {
            const thePath = "";
            const result = makeRelative(thePath);
            assert.strictEqual(result, "");
        });
    });

    describe("makeRelativeTo", () => {
        it("should return a path relative to the given root path", () => {
            const rootPath = "/home/user";
            const thePath = "/home/user/Documents";
            const result = makeRelativeTo(rootPath, thePath);
            assert.strictEqual(result, path.relative(rootPath, path.resolve("/home/user/Documents")));
        });

        it("should return an empty string when given an empty string for the path", () => {
            const rootPath = "/home/user";
            assert.strictEqual(makeRelativeTo(rootPath, "/home"), "..");
            assert.strictEqual(makeRelativeTo(rootPath, "/home/user/Documents"), "Documents");
        });
    });

    describe("locateModulePath", () => {
        it("should return the path to the module folder when it exists in the current working directory", () => {
            const moduleFolder = "existing-folder";
            fs.mkdirSync(moduleFolder, { recursive: true });
            const result = locateModulePath(moduleFolder);
            assert.strictEqual(result, path.resolve(moduleFolder).replace(/\\/g, "/"));
            fs.rmdirSync(moduleFolder);
        });

        it("should return null when the module folder does not exist in the current working directory", () => {
            const moduleFolder = "non-existing-folder";
            assert.strictEqual(locateModulePath(moduleFolder), null);
        });
    });

    describe("findModulePath", () => {
        it("should return the path to the module folder when it exists in the current working directory", () => {
            const moduleFolder = "existing-folder";
            fs.mkdirSync(moduleFolder, { recursive: true });
            const result = findModulePath(moduleFolder);
            assert.strictEqual(result, path.resolve(moduleFolder).replace(/\\/g, "/"));
            fs.rmdirSync(moduleFolder);
        });

        it("should return the path to the module folder in the current working directory when the module folder does not exist", () => {
            const moduleFolder = "non-existing-folder";
            const result = findModulePath(moduleFolder);
            assert.strictEqual(result, path.join(".", moduleFolder).replace(/\\/g, "/"));
        });
    });

    describe("readJsonFile", () => {
        it("should return the content of the JSON file when it exists", () => {
            const filePath = path.join(os.tmpdir(), "test.json");
            try {
                const content = { key: "value" };
                fs.writeFileSync(filePath, JSON.stringify(content));
                const result = readJsonFile(filePath);
                // Using deepEqual instead of deepStrictEqual because readJsonFile parses JSON from file,
                // creating a new object instance
                assert.deepEqual(result, content);
            } finally {
                fs.unlinkSync(filePath);
            }
        });

        it("should return an empty object when the JSON file does not exist", () => {
            const filePath = path.join(os.tmpdir(), "non-existing.json");
            const result = readJsonFile(filePath);
            // Using deepEqual instead of deepStrictEqual because readJsonFile returns a new object instance
            assert.deepEqual(result, {});
        });

        it("should return the content of the JSON file without comments when it contains comments", () => {
            const filePath = path.join(os.tmpdir(), "test.json");
            try {
                const content = { key: "value" };
                fs.writeFileSync(filePath, `// This is a comment\n${JSON.stringify(content)}`);
                const result = readJsonFile(filePath);
                // Using deepEqual instead of deepStrictEqual because readJsonFile parses JSON from file,
                // creating a new object instance
                assert.deepEqual(result, content);
            } finally {
                fs.unlinkSync(filePath);
            }
        });

        it("should return the content of the JSON file without comments when it contains multi-line comments", () => {
            const filePath = path.join(os.tmpdir(), "test.json");
            try {
                const content = { key: "value" };
                fs.writeFileSync(filePath, `/* This is a comment\n*/\n${JSON.stringify(content)}`);
                const result = readJsonFile(filePath);
                // Using deepEqual instead of deepStrictEqual because readJsonFile parses JSON from file,
                // creating a new object instance
                assert.deepEqual(result, content);
            } finally {
                fs.unlinkSync(filePath);
            }
        });

        it("should return the content of the JSON file without trailing commas when it contains trailing commas", () => {
            const filePath = path.join(os.tmpdir(), "test.json");
            try {
                const content = { key: "value" };
                fs.writeFileSync(filePath, "{ \"key\": \"value\", }");
                const result = readJsonFile(filePath);
                // Using deepEqual instead of deepStrictEqual because readJsonFile parses JSON from file,
                // creating a new object instance
                assert.deepEqual(result, content);
            } finally {
                fs.unlinkSync(filePath);
            }
        });
    });
});