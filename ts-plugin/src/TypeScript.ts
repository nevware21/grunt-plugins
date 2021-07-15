/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import {
    doExecute, getTempFile, IExecuteResponse, quoteIfRequired, findModulePath, dumpObj, IGruntWrapper, getTsConfigDetails, ITsConfigDetails
} from "@nevware21/grunt-plugins-shared-utils";
import { ICompileResponse } from "./interfaces/ICompileResponse";
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
    NonEmit = 4,
    ExternalNonEmit = 5
}

interface ICheckResponse {
    isError: boolean,
    isOnlyTypeErrors: boolean,
    isExternalTypeErrors: boolean,
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

function _checkTscVersion(grunt: IGruntWrapper, tscVersion: string) {
    if (tscVersion) {
        let versionParts = tscVersion.split(".");
        if (versionParts.length >= 2) {
            if (versionParts[0] === "1") {
                grunt.logWarn("This plugin has not been tested and does not support this version of tsc -- please upgrade to a later version of TypeScript or use a different plugin!!!");

                if (+(versionParts[1]) < 5) {
                    grunt.logWarn("This plugin uses features that are not supported with this version of tsc -- expect failures!!!");
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
    out?: string;

    /** 
     * Specify the output directory 
     */
    outDir?: string;

    execute?: (grunt: IGrunt, args: string[]) => Promise<IExecuteResponse>;

    /**
     * Keep the generated temporary files (don't delete them)
     */
    keepTemp?: boolean;
}

export class TypeScriptCompiler {

    public compile: (tsFiles: string[]) => Promise<ICompileResponse>;

    constructor(grunt: IGruntWrapper, options: ITypeScriptCompilerOptions) {
        let _self = this;

        grunt.logVerbose((" TypeScript Options: [" + dumpObj(options) + "]").cyan);

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
                grunt.log("Using tsc version: " + tscVersion + (tsPluginVersion ? " via grunt-ts-plugin v" + tsPluginVersion : ""));
                _checkTscVersion(grunt, tscVersion)
            } else if (tsPluginVersion) {
                grunt.log("Using grunt-ts-plugin v" + tsPluginVersion);
            }

            let tsDetails: ITsConfigDetails = null;
            let tsCommand = getTempFile("tscommand");

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

            const tsConfigFile = options.tsconfig;
            if (tsConfigFile) {
                tsDetails = getTsConfigDetails(grunt, options.tsconfig, true);
                let compilerOptions = tsDetails.compilerOptions;
                if (tsDetails.declarationDir) {
                    _addArg(args, "--declarationDir " + quoteIfRequired(tsDetails.declarationDir));
                }

                if (tsDetails.rootDirUpdated) {
                    _addArg(args, "--rootDir " + quoteIfRequired(tsDetails.rootDir));
                }

                if (grunt.isDebug) {
                    grunt.logDebug(("Ts-Plugin...").magenta);
                    grunt.logDebug(("rootDir from [cwd:" + path.resolve(".") + "]").magenta);
                    grunt.logDebug((" - TSConfig: " + tsDetails.nameRoot).magenta);
                    grunt.logDebug((" - Project : " + (tsDetails.projectRootDir ? tsDetails.projectRootDir : "<assuming tsconfig location>")).magenta);
                    grunt.logDebug((" - Actual  : " + (tsDetails.rootDir ? tsDetails.rootDir : "<undefined>")).magenta);
                }

                let outDirParam = options.outDir;
                let outParam = options.out;
                if (outParam) {
                    if (compilerOptions.outDir) {
                        grunt.logWarn(("The 'out' parameter is not compatible usage of 'outDir' within the TsConfig project file -- ignoring the out parameter").magenta);
                        outParam = undefined;
                    } else {
                        if (outDirParam) {
                            grunt.logWarn(("The 'out' parameter is not compatible usage of 'outDir' parameter -- ignoring the outDir parameter").magenta);
                            outDirParam = undefined;
                        }

                        //let outFile = rootDir ? path.resolve(rootDir, outParam) : path.resolve(outParam);
                        let outFile = path.resolve(outParam);
                        _addArg(args, "--out " + quoteIfRequired(outFile));

                        if (compilerOptions.outFile) {
                            delete compilerOptions.outFile;
                            tsDetails.modified = true;
                            // useTempTsConfig = true;
                        }
                        
                        if (compilerOptions.out) {
                            delete compilerOptions.out;
                            tsDetails.modified = true;
                            // useTempTsConfig = true;
                        }
                    }
                } else if (compilerOptions.outFile || compilerOptions.out) {
                    if (outDirParam) {
                        grunt.logWarn(("The 'outDir' parameter is not compatible usage of 'out' or 'outFile' within the TsConfig project file -- ignoring the outDir parameter").magenta);
                        outDirParam = undefined;
                    }

                    let outFile = compilerOptions.outFile || compilerOptions.out;
                    //outFile = rootDir ? path.resolve(rootDir, outFile) : path.resolve(outFile);
                    _addArg(args, "--out " + quoteIfRequired(outFile));
                } else if (outDirParam) {
                    let outDir = path.resolve(outDirParam);
                    _addArg(args, "--outDir " + quoteIfRequired(outDir));
                }

                tsDetails.addFiles(tsFiles);
            }
            
            try {

                const theTsConfig = tsDetails.createTemp();
                if (theTsConfig) {
                    _addArg(args, "--project " + theTsConfig);
                }

                // Create the temporary commands
                if (showOverrides || grunt.isDebug) {
                    grunt.log("Ts-Plugin Invoking: " + tsc + " @" + tsCommand + "\n Contents...\n    " + args.join("\n    ") + "\n");
                } else {
                    grunt.log("Ts-Plugin Invoking: " + tsc + " @" + tsCommand);
                }
                fs.writeFileSync(tsCommand, args.join(" "));

                let execResponse;
                if (options.execute) {
                    execResponse = await options.execute(grunt.grunt, [tsc, "@" + tsCommand]);
                } else {
                    execResponse = await doExecute(grunt, [tsc, "@" + tsCommand]);
                }
                let endTime = Date.now();
    
                let chkResponse = _checkResponse(execResponse);
                _logErrorSummary(chkResponse);
    
                let isSuccess = !chkResponse.isError;
                if (chkResponse.isOnlyTypeErrors && options.failOnTypeErrors) {
                    isSuccess = false;
                }

                if (chkResponse.isExternalTypeErrors && options.failOnExternalTypeErrors) {
                    isSuccess = false;
                }

                let response: ICompileResponse = {
                    time: (endTime - startTime) / 1000,
                    isSuccess: isSuccess,
                    errors: chkResponse.messages
                }
        
                if (response.isSuccess) {
                    grunt.log("");
                    let message = "TypeScript compiliation completed: " + response.time.toFixed(2) + "s";
    
                    grunt.log(message.green);
                } else {
                    // Report failure
                    grunt.log(("Error: tsc return code: [" + execResponse.code + "]").yellow);
                }

                return response;
            } finally {
                if (!options.keepTemp) {
                    tsDetails.cleanupTemp();
                    // tmpTsConfig && fs.unlinkSync(tmpTsConfig);
                    tsCommand && fs.unlinkSync(tsCommand);
                }
            }
        }

        function _logDebug(message: string) {
            if (grunt.isDebug) {
                grunt.logVerbose(message.cyan);
            }
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

                grunt.logWarn(("Invalid tscPath [" + tscPath + "] -- searching").yellow)
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
            grunt.log("Module Path: " + modulePath);
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
                grunt.log(("Note:  You may wish to enable the suppressImplicitAnyIndexErrors" +
                    " grunt-ts option to allow dynamic property access by index.  This will" +
                    " suppress TypeScript error TS7017.").magenta);
            }

            let level1 = errors[CompileErrorType.Level1];
            let level5 = errors[CompileErrorType.Level5];
            let handlerErrors = errors[CompileErrorType.HandlerError];
            let nonEmit = errors[CompileErrorType.NonEmit];
            let externalNonEmit = errors[CompileErrorType.ExternalNonEmit];

            // Log error summary
            if (level1 + level5 + nonEmit + externalNonEmit > 0) {
                if ((level1 + level5 > 0) || options.failOnTypeErrors || options.failOnExternalTypeErrors) {
                    grunt.logWrite((">> ").red);
                } else {
                    grunt.logWrite((">> ").green);
                }

                if (level5 > 0) {
                    grunt.logWrite(level5.toString() + " compiler flag error" +
                        (level5 === 1 ? "" : "s") + "  ");
                }

                if (level1 > 0) {
                    grunt.logWrite(level1.toString() + " syntax error" +
                        (level1 === 1 ? "" : "s") + "  ");
                }

                if (handlerErrors > 0) {
                    grunt.logWrite(handlerErrors.toString() + " handler error" +
                        (handlerErrors === 1 ? "" : "s") + "  ");
                }

                if (nonEmit > 0) {
                    grunt.logWrite(nonEmit.toString() + " non-emit-preventing type warning" + (nonEmit === 1 ? "" : "s") + "  ");
                }

                if (externalNonEmit > 0) {
                    grunt.logWrite(externalNonEmit.toString() + " external non-emit-preventing type warning" + (externalNonEmit === 1 ? "" : "s") + "  ");
                }

                grunt.log("");
                if (resp.isOnlyTypeErrors) {
                    if (!options.failOnTypeErrors) {
                        grunt.log((">> ").green + "Type errors only.");
                    } else {
                        grunt.log((">> ").red + "Type only errors detected -- If you want to not fail the build on these type of errors set the 'failOnTypeErrors' option to false (defaults to true)");
                    }
                }

                if (resp.isExternalTypeErrors) {
                    if (!options.failOnExternalTypeErrors) {
                        grunt.log((">> ").green + "External Type errors identified.");
                    } else {
                        grunt.log((">> ").red + "External Type errors detected -- If you want to not fail the build on these type of errors set the 'failOnExternalTypeErrors' option to false (defaults to false)");
                    }
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
                [CompileErrorType.NonEmit]: 0,
                [CompileErrorType.ExternalNonEmit]: 0
            };

            let output: string = response.stdout || response.stderr;
            let lines = output.split("\n");
            let hasPreventEmitErrors = false;
            let hasExternalTypeErrors = false;
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
                            if (value.indexOf("node_modules/") !== -1) {
                                errors[CompileErrorType.ExternalNonEmit] ++;
                                hasExternalTypeErrors = true;
                            } else {
                                errors[CompileErrorType.NonEmit] ++;
                            }

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
                    grunt.log("StdOut:\n" + response.stdout);
                }

                if (response.stderr) {
                    grunt.log("StdErr:\n" + response.stderr);
                }
            }
            return {
                isError: isError,
                isOnlyTypeErrors: !hasPreventEmitErrors && (errors[CompileErrorType.NonEmit] > 0),
                isExternalTypeErrors: hasExternalTypeErrors,
                errors: errors,
                messages: theErrors
            }
        }
    }
}