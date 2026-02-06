/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import * as fs from "fs";
import * as path from "path";
import { dumpObj, isArray, isNullOrUndefined } from "@nevware21/ts-utils";
import { IPromise, arrForEachAsync, createSyncPromise, doAwait } from "@nevware21/ts-async";
import {
    doExecute, getTempFile, IExecuteResponse, quoteIfRequired, findModulePath, IGruntWrapper, getTsConfigDetails, ITsConfigDetails,
    TsConfigDefinitions
} from "@nevware21/grunt-plugins-shared-utils";
import { ICompileResponse } from "./interfaces/ICompileResponse";
import { IPluginCommonOptions } from "./interfaces/ITsPluginOptions";
import { ErrorHandlerResponse } from "./interfaces/IErrorHandler";

const TsErrorRegEx = /error TS(\d+):/;

const enum CompileErrorType {
    Level1 = 0,
    Level5 = 1,
    TS7017 = 2,
    HandlerError = 3,
    NonEmit = 4,
    ExternalNonEmit = 5,
    Total = 6,
    Ignored = 7 
}

interface ICheckResponse {
    isError: boolean,
    isOnlyTypeErrors: boolean,
    isExternalTypeErrors: boolean,
    errors:  { [type: number]: number }
    messages: string[];
    failingMessages: string[];
    ignoredMessages: string[];
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

export interface ITypeScriptCompilerOptions extends IPluginCommonOptions {

    /**
     * The path to the tsConfig file to use, may be
     * - a single string
     * - an array of strings
     * - an iterable of strings
     * - an iterator of strings
     * - a single ITsOptions object
     * - an array of ITsOptions objects
     * - an iterable of ITsOptions objects
     * - an iterator of ITsOptions objects
     * - a promise that resolves to any of the above
     * - a function that returns any of the above including a promise that resolves to any of the above
     */
    tsConfigs?: TsConfigDefinitions;

    /**
     * The default options to use when not specified in the tsOptions
     */
    defaults: ITypeScriptDefaultOptions
}

export interface ITypeScriptDefaultOptions {
    /**
     * Optional out location
     */
    out?: string;

    /** 
     * Specify the output directory 
     */
    outDir?: string;

    /**
     * The override function to use to execute typescript
     * @param grunt 
     * @param args 
     * @returns 
     */
    execute?: (grunt: IGrunt, args: string[]) => IPromise<IExecuteResponse>;

    /**
     * Keep the generated temporary files (don't delete them)
     */
    keepTemp?: boolean;
}

export class TypeScriptCompiler {

    public compile: (tsFiles: string[]) => ICompileResponse[] | IPromise<ICompileResponse[]>;

    constructor(grunt: IGruntWrapper, options: ITypeScriptCompilerOptions) {
        let _self = this;

        grunt.logVerbose((" TypeScript Options: [" + dumpObj(options) + "]").cyan);

        _self.compile = (tsFiles?: string[]) => {
            if (!tsFiles) {
                tsFiles = [];
            }

            let startTime = Date.now();

            let tsc = _getTsc();
            let tscVersion = _getTscVersion();
            let tsPluginVersion = _getTsPluginVersion();
            if (tscVersion) {
                grunt.log("Using tsc version: " + tscVersion + (tsPluginVersion ? " via grunt-ts-plugin v" + tsPluginVersion : ""));
                _checkTscVersion(grunt, tscVersion)
            } else if (tsPluginVersion) {
                grunt.log("Using grunt-ts-plugin v" + tsPluginVersion);
            }

            let tsDetails: ITsConfigDetails[] = getTsConfigDetails(grunt, options.tsConfigs, !options.suppressWarnings);
            let responses: ICompileResponse[] = [];

            return createSyncPromise((resolve, reject) => {

                doAwait(arrForEachAsync(tsDetails,
                    (tsDetail, idx) => {
                        let tsCommand = _createCommandFile(idx, tsDetail, tsFiles, tsc, parseFloat(tscVersion));

                        return _execCommand(tsDetail, idx, tsCommand, (reason) => {
                            if (grunt.isDebug) {
                                grunt.logError("Ts-Plugin Error: " + dumpObj(reason));
                            }
                            _cleanupTemp(tsDetail, tsCommand);
                            reject(reason);
                        });
                    }),
                    () => {
                        // All done
                        grunt.log("Ts-Plugin All Done - " + dumpObj(responses).replace(/\n/g, " "));
                        resolve(responses);
                    },
                    (reason) => {
                        grunt.logError("Ts-Plugin Error: " + dumpObj(reason));
                        reject(reason);
                    }
                );
            });

            function _execCommand(tsDetail: ITsConfigDetails, idx: number, tsCommand: string, doReject: (reason: any) => void) {
                let execute = tsDetail.tsOption?.execute || options.defaults.execute;
                return doAwait(
                    execute ? execute(grunt.grunt, [tsc, "@" + tsCommand]) : doExecute(grunt, [tsc, "@" + tsCommand]),
                    (execResponse) => {
                        let endTime = Date.now();
            
                        if (grunt.isDebug) {
                            grunt.logDebug("Success Response: " + dumpObj(execResponse));
                        }
            
                        let chkResponse = _checkResponse(execResponse);
                        _logErrorSummary(chkResponse);
            
                        // Get the total number of parsed errors
                        let totalErrors = chkResponse.errors[CompileErrorType.Total];
            
                        // Get the total number of ignored / silented errors
                        let ignoredErrors = chkResponse.errors[CompileErrorType.Ignored];
            
                        // Consider a failure if the exit code from tsc
                        let isSuccess = !chkResponse.isError;
                        if (!isSuccess && totalErrors > 0 && totalErrors === ignoredErrors) {
                            // If tsc gave an exit response code but we processed the output, found at least 1 error but ignored all of them
                            // then ignore the exit code
                            isSuccess = true;
                        }
            
                        if (totalErrors > ignoredErrors) {
                            // We have at least 1 reported error that has not been ignored
                            isSuccess = false;
                        }
            
                        let theResponse: ICompileResponse = {
                            time: (endTime - startTime) / 1000,
                            isSuccess: isSuccess,
                            errors: chkResponse.messages
                        };
            
                        if (theResponse.isSuccess) {
                            grunt.log("");
                            let message = "TypeScript compiliation completed: " + theResponse.time.toFixed(2) + "s";
            
                            grunt.log(message.green);
                        } else {
                            // Report failure
                            grunt.log(("Error: tsc return code: [" + execResponse.code + "]").yellow);
                        }
            
                        // eslint-disable-next-line security/detect-object-injection
                        responses[idx] = theResponse;
                    }, 
                    doReject,
                    () => {
                        _cleanupTemp(tsDetail, tsCommand);
                    }
                );
            }
        }

        function _createCommandFile(idx: number, tsDetail: ITsConfigDetails, tsFiles: string[], tsc: string, tscVersion: number) {
            let keepTemp = (isNullOrUndefined(tsDetail.tsOption?.keepTemp) ? options.defaults.keepTemp : tsDetail.tsOption.keepTemp);
            if (isNullOrUndefined(keepTemp)) {
                keepTemp = options.keepTemp || false;
            }
            
            let tsCommand = getTempFile(keepTemp ? "tscommand" : "tscmd" + "-" + idx);

            if (!tsCommand) {
                throw new Error("Unable to create a temporary file");
            }

            let args: string[] = [];
            let showOverrides = false;

            if (options.additionalFlags) {
                if (isArray(options.additionalFlags)) {
                    args = args.concat(options.additionalFlags);
                } else {
                    args.push(options.additionalFlags);
                }
            }

            const tsConfigFile = tsDetail.name;
            if (tsConfigFile) {
                let compilerOptions = tsDetail.tsConfig.compilerOptions || {};
                if (tscVersion >= 5.5 && "suppressImplicitAnyIndexErrors" in compilerOptions) {
                    grunt.logWarn(("The 'suppressImplicitAnyIndexErrors' compiler option is not compatible usage within the TsConfig project file -- ignoring this option").magenta);
                    delete compilerOptions.suppressImplicitAnyIndexErrors;
                    tsDetail.modified = true;
                    showOverrides = true;
                }

                if (tsDetail.declarationDir) {
                    _addArg(args, "--declarationDir " + quoteIfRequired(tsDetail.declarationDir));
                }

                if (tsDetail.rootDirUpdated) {
                    _addArg(args, "--rootDir " + quoteIfRequired(tsDetail.rootDir));
                }

                if (grunt.isDebug) {
                    grunt.logDebug(("Ts-Plugin...").magenta);
                    grunt.logDebug(("rootDir from [cwd:" + path.resolve(".") + "]").magenta);
                    grunt.logDebug((" - TSConfig: " + tsDetail.nameRoot).magenta);
                    grunt.logDebug((" - Project : " + (tsDetail.projectRootDir ? tsDetail.projectRootDir : "<assuming tsconfig location>")).magenta);
                    grunt.logDebug((" - Actual  : " + (tsDetail.rootDir ? tsDetail.rootDir : "<undefined>")).magenta);
                }

                let outDirParam = tsDetail?.tsOption?.outDir || options.defaults?.outDir || options.outDir;
                let outParam = tsDetail?.tsOption?.out || options.defaults?.out;
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
                            tsDetail.modified = true;
                            // useTempTsConfig = true;
                        }

                        if (compilerOptions.out) {
                            delete compilerOptions.out;
                            tsDetail.modified = true;
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

                tsDetail.addFiles(tsFiles);
            }

            const theTsConfig = tsDetail.createTemp(idx);
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
            return tsCommand;
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
        
            let totalErrors = errors[CompileErrorType.Total];
            let ignoredErrors = errors[CompileErrorType.Ignored];
            let level1 = errors[CompileErrorType.Level1];
            let level5 = errors[CompileErrorType.Level5];
            let handlerErrors = errors[CompileErrorType.HandlerError];
            let nonEmit = errors[CompileErrorType.NonEmit];
            let externalNonEmit = errors[CompileErrorType.ExternalNonEmit];
        
            // Log error summary
            if (level1 + level5 + nonEmit + externalNonEmit > 0) {
                if (totalErrors - ignoredErrors > 0) {
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
        
                if (ignoredErrors > 0) {
                    if (totalErrors - ignoredErrors > 0) {
                        grunt.logWrite(ignoredErrors.toString() + " ignored error" + (ignoredErrors === 1 ? "" : "s") + "  ")
                    } else {
                        grunt.logWrite((totalErrors > 1 ? "All r" : "R") + "eported error" + (totalErrors === 1 ? "" : "s") + " ignored  ")
                    }
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
                [CompileErrorType.ExternalNonEmit]: 0,
                [CompileErrorType.Total]: 0,
                [CompileErrorType.Ignored]: 0
            };
        
            let output: string = response.stdout || response.stderr;
            let lines = output.split("\n");
            let hasPreventEmitErrors = false;
            let hasExternalTypeErrors = false;
            let theErrors: string[] = [];
            let failingErrors: string[] = [];
            let ignoredErrors: string[] = [];
        
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
                                if (!options.failOnExternalTypeErrors) {
                                    // Don't fail the build if we are ignoring this type of error
                                    processError = ErrorHandlerResponse.Silent;
                                }
                            } else {
                                errors[CompileErrorType.NonEmit] ++;
                                if (!options.failOnTypeErrors) {
                                    // Don't fail the build if we are ignoring this type of error
                                    processError = ErrorHandlerResponse.Silent;
                                }
                            }
                        }
                    }
        
                    errors[CompileErrorType.Total] ++;
                    if (processError !== ErrorHandlerResponse.Ignore) {
                        // Save all of the non-ignored messages
                        theErrors.push(value);
                    }
                    
                    if (processError == ErrorHandlerResponse.Error) {
                        failingErrors.push(value);
                    } else if (processError === ErrorHandlerResponse.Silent) {
                        ignoredErrors.push(value);
        
                        // Don't count this error as a failure
                        errors[CompileErrorType.Ignored] ++;
                    } else if (processError === ErrorHandlerResponse.Ignore) {
                        // Don't count this error as a failure
                        errors[CompileErrorType.Ignored] ++;
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
                messages: theErrors,
                failingMessages: failingErrors,
                ignoredMessages: ignoredErrors
            }
        }
        
        function _cleanupTemp(tsDetail: ITsConfigDetails, tsCommand: string) {
            let keepTemp = !!(isNullOrUndefined(tsDetail.tsOption?.keepTemp) ? options.defaults.keepTemp : tsDetail.tsOption.keepTemp);
            if (!keepTemp) {
                try {
                    tsDetail && tsDetail.cleanupTemp();
                } catch (e) {
                    grunt.logError("Failed to cleanup temporary files: " + e);
                }
        
                if (grunt.isDebug) {
                    grunt.logDebug("Cleaning up temporary file:" + tsCommand);
                }
        
                if (tsCommand && fs.existsSync(tsCommand)) {
                    try {
                        fs.unlinkSync(tsCommand);
                        if (fs.existsSync(tsCommand)) {
                            grunt.logError("Temporary files still exists: " + tsCommand);
                        }
                    } catch (e) {
                        grunt.logError("Failed to cleanup temporary files: " + e);
                    }
                }
            }
        }
    }
}
