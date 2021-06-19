/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import {
    doExecute, getTempFile, IExecuteResponse, quoteIfRequired, findCommonPath, normalizePath, findModulePath, makeRelative, makeRelativeTo
} from "@nevware21/grunt-plugins-shared-utils";
import { ICompileResponse } from "./interfaces/ICompileResponse";
import { ITsCompilerOptions, ITsConfig } from "./interfaces/ITsConfig";
import * as fs from "fs";
import * as path from "path";
import { ITsCommonOptions } from "./interfaces/ITsPluginOptions";
import { ErrorHandlerResponse } from "./interfaces/IErrorHandler";

const TsErrorRegEx = /error TS(\d+):/;

const enum CompileErrorType {
    Level1 = 0,
    Level5 = 1,
    TS7017 = 2,
    HandlerError = 3,
    NonEmit = 4
}

interface ICheckResponse {
    isError: boolean,
    isOnlyTypeErrors: boolean,
    errors:  { [type: number]: number }
    messages: string[];
}

function _hasArgument(args: string[], theArg: string) {
    if (args) {
        args.forEach((value) => {
            if (value.indexOf(theArg) !== -1) {
                return true;
            }
        });
    }

    return false;
}

function _addArg(args: string[], newArg: string) {
    let parts = newArg.split(" ", 2);
    if (!_hasArgument(args, parts[0])) {
        args.push(newArg);
    }
}

function _checkTscVersion(grunt: IGrunt, tscVersion: string) {
    if (tscVersion) {
        let versionParts = tscVersion.split(".");
        if (versionParts.length >= 2) {
            if (versionParts[0] === "1") {
                grunt.log.warn("This plugin has not been tested and does not support this version of tsc -- please upgrade to a later version of TypeScript or use a different plugin!!!");

                if (+(versionParts[1]) < 5) {
                    grunt.log.warn("This plugin uses features that are not supported with this version of tsc -- expect failures!!!");
                }
            }
        }
    }
}

export interface ITypeScriptCompilerOptions extends ITsCommonOptions {

    /**
     * The path to the tsConfig file to use
     */
    tsconfig?: string;

     /**
     * Optional out location
     */
    out?: string

    execute?: (grunt: IGrunt, args: string[]) => Promise<IExecuteResponse>;
}

export class TypeScriptCompiler {

    public compile: (tsFiles: string[]) => Promise<ICompileResponse>;

    constructor(grunt: IGrunt, options: ITypeScriptCompilerOptions) {
        let _self = this;

        _self.compile = async (tsFiles?: string[]) => {
            if (!tsFiles) {
                tsFiles = [];
            }

            let startTime = Date.now();
            let args: string[] = [];
            let showOverrides = false;

            let tsc = _getTsc();
            let tscVersion = _getTscVersion();
            let tsPluginVersion = _getTsPluginVersion();
            if (tscVersion) {
                grunt.log.writeln("Using tsc version: " + tscVersion + (tsPluginVersion ? " via grunt-ts-plugin v" + tsPluginVersion : ""));
                _checkTscVersion(grunt, tscVersion)
            } else if (tsPluginVersion) {
                grunt.log.writeln("Using grunt-ts-plugin v" + tsPluginVersion);
            }

            let useTempTsConfig = false;
            let tmpTsConfig: string = null;
            let tsCommand = getTempFile("tscommand");
            let tsConfig: ITsConfig = {};

            if (!tsCommand) {
                throw new Error("Unable to create a temporary file");
            }

            if (options.additionalFlags) {
                if (Array.isArray(options.additionalFlags)) {
                    args = args.concat(options.additionalFlags);
                } else {
                    args.push(options.additionalFlags);
                }
            }

            let compilerOptions: ITsCompilerOptions = {} as ITsCompilerOptions;
            const tsConfigFile = options.tsconfig;
            if (tsConfigFile) {
                tsConfig = _readTsConfig(tsConfigFile)
                compilerOptions = tsConfig.compilerOptions || compilerOptions;
                let tsConfigRoot = path.resolve(findCommonPath([tsConfigFile]));
                let projectRootDir: string = null;
                let rootDir: string = null;  

                if (compilerOptions.rootDir) {
                    projectRootDir = path.resolve(findCommonPath([tsConfigFile]), compilerOptions.rootDir);

                    if (!fs.existsSync(path.resolve(projectRootDir))) {
                        rootDir = path.resolve(compilerOptions.rootDir);

                        if (rootDir !== tsConfigRoot && fs.existsSync(rootDir)) {
                            grunt.log.warn(("The rootDir specified in your project file [" + tsConfigFile + "] is invalid as it assumes the current working directory.\n - [" + compilerOptions.rootDir + "] resolves to [" + projectRootDir + "]\n - Overridding to use: [" + rootDir + "]\n -- Update or remove to fix this warning").yellow);
                        } else {
                            grunt.log.warn(("The rootDir specified in your project file [" + tsConfigFile + "] is invalid.\n - [" + compilerOptions.rootDir + "] resolves to [" + projectRootDir + "]\n - Using tsconfig location: [" + tsConfigRoot + "]\n -- Update or remove to fix this warning").yellow);
                            rootDir = tsConfigRoot;
                        }

                        // Assume the declaration folder has the same issue
                        if (compilerOptions.declarationDir) {
                            let projectDeclarationDir = path.resolve(rootDir, compilerOptions.declarationDir);
                            let declarationDir = path.resolve(compilerOptions.declarationDir);

                            // If the folders are different and the --rootDir existed based on the cwd then use the same resolution
                            if (declarationDir !== projectDeclarationDir) {
                                grunt.log.warn(("The declarationDir specified in your project file [" + tsConfigFile + "] is invalid as it assumes the current working directory.\n - [" + compilerOptions.declarationDir + "] resolves to [" + projectDeclarationDir + "]\n - Overridding to use: [" + declarationDir + "]\n -- Update or remove to fix this warning").yellow);
                                _addArg(args, "--declarationDir " + quoteIfRequired(declarationDir));
                            } else {
                                grunt.log.warn(("The rootDir specified in your project file [" + tsConfigFile + "] is invalid.\n - [" + compilerOptions.declarationDir + "] resolves to [" + projectDeclarationDir + "]\n - Using: [" + rootDir + "]\n -- Remove to fix this warning").yellow);
                                _addArg(args, "--declarationDir " + quoteIfRequired(rootDir));
                            }
                        }
                        
                        _addArg(args, "--rootDir " + quoteIfRequired(rootDir));
                    } else {
                        // The specified rootDir is correct
                        rootDir = projectRootDir;
                    }
                } else {
                    // No rootDir defined in the project file
                    rootDir = tsConfigRoot;
                    //_addArg(args, "--rootDir " + quoteIfRequired(rootDir));
                }

                if (options.debug) {
                    grunt.log.writeln(("Ts-Plugin...").magenta);
                    grunt.log.writeln(("rootDir from [cwd:" + path.resolve(".") + "]").magenta);
                    grunt.log.writeln((" - TSConfig: " + tsConfigRoot).magenta);
                    grunt.log.writeln((" - Project : " + (projectRootDir ? projectRootDir : "<assuming tsconfig location>")).magenta);
                    grunt.log.writeln((" - Actual  : " + (rootDir ? rootDir : "<undefined>")).magenta);
                }

                let outParam = options.out;
                if (outParam) {
                    if (compilerOptions.outDir) {
                        grunt.log.warn(("The 'out' parameter is not compatible usage of 'outDir' within the TsConfig project file -- ignoring the out parameter").magenta);
                        outParam = undefined;
                    } else {
                        //let outFile = rootDir ? path.resolve(rootDir, outParam) : path.resolve(outParam);
                        let outFile = path.resolve(outParam);
                        _addArg(args, "--out " + quoteIfRequired(outFile));

                        if (compilerOptions.outFile) {
                            delete compilerOptions.outFile;
                            useTempTsConfig = true;
                        }
                        
                        if (compilerOptions.out) {
                            delete compilerOptions.out;
                            useTempTsConfig = true;
                        }
                    }
                } else if (compilerOptions.outFile || compilerOptions.out) {
                    let outFile = compilerOptions.outFile || compilerOptions.out;
                    //outFile = rootDir ? path.resolve(rootDir, outFile) : path.resolve(outFile);
                    _addArg(args, "--out " + quoteIfRequired(outFile));
                }

                if (tsFiles && tsFiles.length > 0) {
                    let fullTsConfigPath = path.resolve(tsConfigFile);
                    tsConfig.files = tsConfig.files || [];
                    tsConfig.include = tsConfig.include || [];

                    let fileRootDir = normalizePath(rootDir || fullTsConfigPath || "");
                    if (options.debug) {
                        grunt.log.writeln("");
                        grunt.log.writeln("Adding files from grunt config... using: " + (fileRootDir ? fileRootDir : ""));
                        grunt.log.writeln("-----------------------------------------------------------------------------------------------------");
                    }


                    tsFiles.forEach((theFile) => {
                        let theResolvedFile = theFile;
                        if (theResolvedFile.endsWith("**")) {
                            theResolvedFile = theResolvedFile + "/*";
                        }

                        let fullFilePath = normalizePath(path.resolve(theResolvedFile));

                        // put globs in the include and files directly unless there are excludes already defined
                        let destContainer = (!tsConfig.exclude && theResolvedFile.indexOf("*") === -1 ? tsConfig.files : tsConfig.include);
                        if (fileRootDir && fullFilePath.startsWith(fileRootDir)) {
                            //theResolvedFile = "." + fullFilePath.substring(fileRootDir.length);
                            theResolvedFile = fullFilePath;
                        }

                        // Files should be listed based on the relative location to the tsconfig
                        // As per the TsConfig Reference...
                        // > rootDir does not affect which files become part of the compilation.
                        // > It has no interaction with the include, exclude, or files tsconfig.json settings.
                        // > https://www.typescriptlang.org/tsconfig#rootDir
                        let relativeResolvedFile: string;
                        if (tsConfigRoot) {
                            relativeResolvedFile = makeRelativeTo(tsConfigRoot, theResolvedFile);
                        } else {
                            relativeResolvedFile = makeRelative(theResolvedFile);
                        }

                        if (options.debug) {
                            grunt.log.writeln(" - [" + theFile + "] => [" + theResolvedFile + "] => [" + relativeResolvedFile + "]")
                        }

                        destContainer.push(relativeResolvedFile);
                    });
                    if (options.debug) {
                        grunt.log.writeln("-----------------------------------------------------------------------------------------------------");
                    }

                    if (tsConfig.files && tsConfig.files.length === 0) {
                        delete tsConfig.files;
                    }

                    if (tsConfig.include && tsConfig.include.length === 0) {
                        delete tsConfig.include;
                    }

                    useTempTsConfig = true;
                }

                if (useTempTsConfig) {
                    tmpTsConfig = getTempFile(tsConfigFile || "tsconfig");
                    if (!tmpTsConfig) {
                        throw new Error("Unable to create temporary tsconfig file");
                    }

                    let tsConfigContent = JSON.stringify(tsConfig, null, 4);
                    if (options.debug) {
                        grunt.log.writeln("Using TsConfig.json [" + tmpTsConfig+ "]:\n" + tsConfigContent);
                    }

                    fs.writeFileSync(tmpTsConfig, tsConfigContent);
                    _addArg(args, "--project " + tmpTsConfig);
                } else {
                    _addArg(args, "--project " + tsConfigFile);
                }
            }
            
            // // Quote any source files if required
            // for (let lp = 0; lp < tsFiles.length; lp++) {
            //     tsFiles[lp] = quoteIfRequired(tsFiles[lp]);
            // }

            try {
                // Create the temporary commands
                if (showOverrides || options.debug) {
                    grunt.log.writeln("Ts-Plugin Invoking: " + tsc + " @" + tsCommand + "\n Contents...\n    " + args.join("\n    ") + "\n");
                } else {
                    grunt.log.writeln("Ts-Plugin Invoking: " + tsc + " @" + tsCommand);
                }
                fs.writeFileSync(tsCommand, args.join(" "));

                let runCmd = options.execute || doExecute;
                let execResponse = await runCmd(grunt, [tsc, "@" + tsCommand]);
                let endTime = Date.now();
    
                let chkResponse = _checkResponse(execResponse);
                _logErrorSummary(chkResponse);
    
                let response: ICompileResponse = {
                    time: (endTime - startTime) / 1000,
                    isSuccess: !chkResponse.isError || (chkResponse.isOnlyTypeErrors && !options.failOnTypeErrors),
                    errors: chkResponse.messages
                }
        
                if (response.isSuccess) {
                    grunt.log.writeln("");
                    let message = "TypeScript compiliation completed: " + response.time.toFixed(2) + "s";
    
                    grunt.log.writeln(message.green);
                } else {
                    // Report failure
                    grunt.log.writeln(("Error: tsc return code: [" + execResponse.code + "]").yellow);
                }

                return response;
            } finally {
                tmpTsConfig && fs.unlinkSync(tmpTsConfig);
                tsCommand && fs.unlinkSync(tsCommand);
            }
        }

        function _logDebug(message: string) {
            if (options.debug) {
                grunt.log.verbose.writeln(message.cyan);
            }
        }

        function _readTsConfig(tsConfig: string): ITsConfig {
            if (tsConfig && fs.existsSync(tsConfig)) {
                var fileContent = fs.readFileSync(tsConfig, 'utf8').toString();
                return JSON.parse(fileContent);
            }

            return {};
        }

        function _findTypeScriptPath() {
            _logDebug("Locating TypeScript compiler...");
            let tsFolder = "node_modules/typescript/bin";
            let tscPath = options.tscPath;
            if (tscPath) {
                _logDebug("  - Checking [" + tscPath + "]");
                if (fs.existsSync(path.resolve(tscPath, tsFolder))) {
                    return path.resolve(tscPath, tsFolder);
                } else if (fs.existsSync(tscPath)) {
                    return tscPath;
                }

                grunt.log.writeln(("Invalid tscPath [" + tscPath + "] -- searching").yellow)
            }

            return findModulePath(tsFolder, _logDebug);
        }

        function _getTscVersion(binPath?: string) {
            if (options.compiler) {
                // Unknown
                return "";
            }

            let thePath = path.join(binPath || _findTypeScriptPath(), "../package.json");
            if (fs.existsSync(thePath)) {
                const packageJson = JSON.parse(fs.readFileSync(thePath).toString());
                return packageJson.version;
            }

            return "";
        }

        function _getTsc(binPath?: string) {
            if (options.compiler) {
                return options.compiler;
            }

            return path.join(binPath || _findTypeScriptPath(), "tsc");
        }

        function _getTsPluginVersion() {
            let modulePath = findModulePath("node_modules/@nevware21/grunt-ts-plugin", _logDebug);
            grunt.log.writeln("Module Path: " + modulePath);
            let thePath = path.join(modulePath, "./package.json");
            if (fs.existsSync(thePath)) {
                const packageJson = JSON.parse(fs.readFileSync(thePath).toString());
                return packageJson.version;
            }

            return "";
        }

        function _logErrorSummary(resp: ICheckResponse) {
            let errors = resp.errors;
            if (errors[CompileErrorType.TS7017]) {
                grunt.log.writeln(("Note:  You may wish to enable the suppressImplicitAnyIndexErrors" +
                    " grunt-ts option to allow dynamic property access by index.  This will" +
                    " suppress TypeScript error TS7017.").magenta);
            }

            let level1 = errors[CompileErrorType.Level1];
            let level5 = errors[CompileErrorType.Level5];
            let handlerErrors = errors[CompileErrorType.HandlerError];
            let nonEmit = errors[CompileErrorType.NonEmit];

            // Log error summary
            if (level1 + level5 + nonEmit > 0) {
                if ((level1 + level5 > 0) || options.failOnTypeErrors) {
                    grunt.log.write(('>> ').red);
                } else {
                    grunt.log.write(('>> ').green);
                }

                if (level5 > 0) {
                    grunt.log.write(level5.toString() + ' compiler flag error' +
                        (level5 === 1 ? '' : 's') + '  ');
                }
                if (level1 > 0) {
                    grunt.log.write(level1.toString() + ' syntax error' +
                        (level1 === 1 ? '' : 's') + '  ');
                }
                if (handlerErrors > 0) {
                    grunt.log.write(handlerErrors.toString() + ' handler error' +
                        (handlerErrors === 1 ? '' : 's') + '  ');
                }
                if (nonEmit > 0) {
                    grunt.log.write(nonEmit.toString() + ' non-emit-preventing type warning' + (nonEmit === 1 ? '' : 's') + '  ');
                }

                grunt.log.writeln('');
                if (resp.isOnlyTypeErrors && !options.failOnTypeErrors) {
                    grunt.log.write(('>> ').green);
                    grunt.log.writeln('Type errors only.');
                }
            }
        }

        function _checkResponse(response: IExecuteResponse): ICheckResponse {
            // In TypeScript 1.3 and above, the result code corresponds to the ExitCode enum in
            //   TypeScript/src/compiler/sys.ts
            let isError = response.code !== 0;

            // If the compilation errors contain only type errors, JS files are still
            //   generated. If tsc finds type errors, it will return an error code, even
            //   if JS files are generated. We should check this for this,
            //   only type errors, and call this a successful compilation.
            // Assumptions:
            //   Level 1 errors = syntax errors - prevent JS emit.
            //   Level 2 errors = semantic errors - *not* prevents JS emit.
            //   Level 5 errors = compiler flag misuse - prevents JS emit.
            let errors: { [type: number]: number } = {
                [CompileErrorType.Level1]: 0,
                [CompileErrorType.Level5]: 0,
                [CompileErrorType.TS7017]: 0,
                [CompileErrorType.NonEmit]: 0
            };

            let output: string = response.stdout || response.stderr;
            let lines = output.split("\n");
            let hasPreventEmitErrors = false;
            let theErrors: string[] = [];

            lines.forEach((value) => {
                let errorMatch = value.match(TsErrorRegEx);
                if (errorMatch && errorMatch.length > 1) {
                    // We have an error match
                    let errorNumber = errorMatch[1];
                    let processError = ErrorHandlerResponse.Undefined;

                    if (options.onError) {
                        processError = options.onError(errorNumber, value);
                        if (processError === ErrorHandlerResponse.Error) {
                            errors[CompileErrorType.HandlerError] ++;
                            hasPreventEmitErrors = true;
                        }
                    }

                    if (!processError) {
                        processError = ErrorHandlerResponse.Error;

                        // Do default Handling
                        if (errorNumber === "7017") {
                            errors[CompileErrorType.TS7017]++;
                        } else if (errorNumber[0] === "1") {
                            errors[CompileErrorType.Level1] ++;
                            hasPreventEmitErrors = true;
                        } else if (errorNumber[0] === "5") {
                            errors[CompileErrorType.Level5] ++;
                            hasPreventEmitErrors = true;
                        } else {
                            errors[CompileErrorType.NonEmit] ++;
                            processError = ErrorHandlerResponse.Silent;
                        }
                    }

                    if (processError !== ErrorHandlerResponse.Ignore) {
                        theErrors.push(value);
                    }
                }
            });

            if (options.logOutput) {
                if (response.stdout) {
                    grunt.log.writeln("StdOut:\n" + response.stdout);
                }

                if (response.stderr) {
                    grunt.log.writeln("StdErr:\n" + response.stderr);
                }
            }
            return {
                isError: isError,
                isOnlyTypeErrors: !hasPreventEmitErrors,
                errors: errors,
                messages: theErrors
            }
        }
    }
}