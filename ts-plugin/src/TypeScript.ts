/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

import { doExecute, getTempFile, IExecuteResponse, quoteIfRequired, findCommonPath } from "@nevware21/grunt-plugins-shared-utils";
import { ICompileResponse } from "./interfaces/ICompileResponse";
import { ITsCompilerOptions, ITsConfig } from "./interfaces/ITsConfig";
import * as fs from "fs";
import * as path from "path";

const enum CompileErrorType {
    Level1 = 0,
    Level5 = 1,
    TS7017 = 2,
    NonEmit = 3
}

interface ICheckResponse {
    isError: boolean,
    isOnlyTypeErrors: boolean,
    errors:  { [type: number]: number }
}

export interface ITypeScriptCompilerOptions {
    /**
     * The path to the tsConfig file to use
     */
    tsconfig?: string;

    /**
     * Log additional debug messages as verbose grunt messages
     */
    debug?: boolean;

    /**
     * Identify the root path of the version of the TypeScript is installed, this may include be either
     * the root folder of where the node_modules/typescript/bin folder is located or the location of
     * the command-line version of tsc.
     */
    tscPath?: string;

    /**
     * Identify the complete path to the command line version of tsc
     */
    compiler?: string;

    /**
     * If specified, outDir files are located relative to this location
     */
    baseDir?: string;

    /**
     * Should the compile run fail when type errors are identified
     */
    failOnTypeErrors?: boolean;

    /**
     * Pass in additional flags to the tsc compiler (added to the end of the command line)
     */
    additionalFlags?: string | string[];

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

            let tsCommand = getTempFile("tscommand");
            if (!tsCommand) {
                throw new Error("Unable to create a temporary file");
            }

            let compilerOptions: ITsCompilerOptions = {} as ITsCompilerOptions;
            const tsConfigFile = options.tsconfig;
            if (tsConfigFile) {
                let tsConfig = _readTsConfig(tsConfigFile)
                args.push("--project " + tsConfigFile);
                compilerOptions = tsConfig.compilerOptions || compilerOptions;
                let tsConfigRoot = path.resolve(findCommonPath([tsConfigFile]));

                if (compilerOptions.rootDir) {
                    let projectRootDir = path.resolve(findCommonPath([tsConfigFile]), compilerOptions.rootDir);
                    if (options.debug) {
                        grunt.log.writeln(("Ts-Plugin...").magenta);
                        grunt.log.writeln((" - TSConfig rootDir: " + tsConfigRoot).magenta)
                        grunt.log.writeln((" - Project rootDir: " + projectRootDir).magenta)
                    }
                    if (!fs.existsSync(path.resolve(projectRootDir))) {
                        showOverrides = true;
                        let rootDir = path.resolve(compilerOptions.rootDir);
                        if (rootDir !== tsConfigRoot && fs.existsSync(rootDir)) {
                            grunt.log.warn(("The rootDir specified in your project file [" + tsConfigFile + "] is invalid as it assumes the current working directory.\n - [" + compilerOptions.rootDir + "] resolves to [" + projectRootDir + "]\n - Overridding to use: [" + rootDir + "]").yellow);
                            args.push("--rootDir " + quoteIfRequired(rootDir));
                        } else {
                            grunt.log.warn(("The rootDir specified in your project file [" + tsConfigFile + "] is invalid.\n - [" + compilerOptions.rootDir + "] resolves to [" + projectRootDir + "]\n - Using tsconfig location: [" + tsConfigRoot + "]").yellow);
                            args.push("--rootDir " + quoteIfRequired(tsConfigRoot));
                            //throw new Error("The rootDir specified in your project file [" + tsConfigFile + "] is invalid. [" + compilerOptions.rootDir + "] resolves to [" + projectRootDir + "]")
                        }

                        // Assume the declaration folder has the same issue
                        if (compilerOptions.declarationDir) {
                            let projectDeclarationDir = path.resolve(findCommonPath([tsConfigFile]), compilerOptions.declarationDir);
                            let declarationDir = path.resolve(compilerOptions.declarationDir);
                            // If the folders are different and the --rootDir existed based on the cwd then use the same resolution
                            if (declarationDir !== projectDeclarationDir && fs.existsSync(rootDir)) {
                                grunt.log.warn(("The declarationDir specified in your project file [" + tsConfigFile + "] is invalid as it assumes the current working directory.\n - [" + compilerOptions.declarationDir + "] resolves to [" + projectDeclarationDir + "]\n - Overridding to use: [" + declarationDir + "]").yellow);
                                args.push("--declarationDir " + quoteIfRequired(declarationDir));
                            } else {
                                grunt.log.warn(("The rootDir specified in your project file [" + tsConfigFile + "] is invalid.\n - [" + compilerOptions.rootDir + "] resolves to [" + projectRootDir + "]\n - Using: [" + tsConfigRoot + "]").yellow);
                                args.push("--declarationDir " + quoteIfRequired(rootDir));
                                //throw new Error("The rootDir specified in your project file [" + tsConfigFile + "] is invalid. [" + compilerOptions.rootDir + "] resolves to [" + projectRootDir + "]")
                            }
                        }
                    }
                }
                
                if (compilerOptions.out) {
                    let outFile = path.resolve(compilerOptions.out);

                    args.push("--outfile " + quoteIfRequired(outFile));
                }

                // if (compilerOptions.outDir) {
                //     if (!options.baseDir) {
                //         let files: string[] = [];
                //         // files.push(path.resolve("."));
                //         files.push(path.resolve(tsConfigFile));
                //         if (compilerOptions.rootDir) {
                //             files.push(path.resolve(compilerOptions.rootDir));
                //         }

                //         options.baseDir = findCommonPath(files)
                //     } else if (compilerOptions.rootDir) {
                //         args.push("--rootDir " + quoteIfRequired(options.baseDir));
                //     }
                // }
            }

            // let baseDirFile: string = '.baseDir.ts';
            // let baseDirFilePath: string;
            // if (compilerOptions.outDir && options.baseDir) {
            //     baseDirFilePath = path.join(options.baseDir, baseDirFile);
            //     if (!fs.existsSync(baseDirFilePath)) {
            //         grunt.file.write(baseDirFilePath, '// Ignore this file. See https://github.com/microsoft/TypeScript/issues/287');
            //     }

            //     tsFiles.push(baseDirFilePath);
            // }            
            
            // Quote any source files if required
            for (let lp = 0; lp < tsFiles.length; lp++) {
                tsFiles[lp] = quoteIfRequired(tsFiles[lp]);
            }

            try {
                if (options.additionalFlags) {
                    if (Array.isArray(options.additionalFlags)) {
                        args = args.concat(options.additionalFlags);
                    } else {
                        args.push(options.additionalFlags);
                    }
                }

                // Create the temporary commands
                let theArgs = tsFiles.concat(args);
                if (showOverrides || options.debug) {
                    grunt.log.writeln("Ts-Plugin Invoking: " + tsc + " @" + tsCommand + "\n Contents...\n    " + theArgs.join("\n    ") + "\n");
                } else {
                    grunt.log.writeln("Ts-Plugin Invoking: " + tsc + " @" + tsCommand);
                }
                fs.writeFileSync(tsCommand, theArgs.join(" "));

                let runCmd = options.execute || doExecute;
                let execResponse = await runCmd(grunt, [tsc, "@" + tsCommand]);
                let endTime = Date.now();
    
                let chkResponse = _checkResponse(execResponse);
                _logErrorSummary(chkResponse);
    
                let response: ICompileResponse = {
                    time: (endTime - startTime) / 1000,
                    isSuccess: !chkResponse.isError || (chkResponse.isOnlyTypeErrors && !options.failOnTypeErrors)
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
                fs.unlinkSync(tsCommand);
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

            let rootPath = path.resolve(path.dirname(module.filename), "../..");
            let currentPath = rootPath;
            while (currentPath && currentPath.length > 3) {
                let thePath = path.join(currentPath, tsFolder);
                _logDebug("  - Checking [" + thePath + "]");
                if (fs.existsSync(path.join(currentPath, tsFolder))) {
                    return thePath;
                }

                currentPath = path.resolve(currentPath, "..");
            }

            grunt.log.writeln(("Typescript path not found").yellow);

            return path.join(rootPath, tsFolder);
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

        function _logErrorSummary(resp: ICheckResponse) {
            let errors = resp.errors;
            if (errors[CompileErrorType.TS7017]) {
                grunt.log.writeln(("Note:  You may wish to enable the suppressImplicitAnyIndexErrors" +
                    " grunt-ts option to allow dynamic property access by index.  This will" +
                    " suppress TypeScript error TS7017.").magenta);
            }

            let level1 = errors[CompileErrorType.Level1];
            let level5 = errors[CompileErrorType.Level5];
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

            let output = response.stdout || response.stderr;
            let lines = output.split("\n");
            let hasPreventEmitErrors = false;

            lines.forEach((value) => {
                if (value.search(/error TS7017:/g) >= 0) {
                    errors[CompileErrorType.TS7017]++;
                }

                if (value.search(/error TS1\d+:/g) >= 0) {
                    errors[CompileErrorType.Level1] ++;
                    hasPreventEmitErrors = true;
                } else if (value.search(/error TS5\d+:/) >= 0) {
                    errors[CompileErrorType.Level5] ++;
                    hasPreventEmitErrors = true;
                } else if (value.search(/error TS\d+:/) >= 0) {
                    errors[CompileErrorType.NonEmit] ++;
                }
            });

            let isOnlyTypeErrors = !hasPreventEmitErrors;

            return {
                isError: isError,
                isOnlyTypeErrors: !hasPreventEmitErrors,
                errors: errors
            }
        }
    }
}