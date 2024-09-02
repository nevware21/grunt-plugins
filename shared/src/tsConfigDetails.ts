/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import * as fs from "fs";
import * as path from "path";
import { arrForEach, isArray, isIterable, isIterator, isNullOrUndefined, isPlainObject, isString, iterForOf, objDeepCopy, objForEachKey } from "@nevware21/ts-utils";
import { ITsConfig, ITsOption, TsConfigDefinitions } from "./interfaces/ITsConfig";
import { findCommonPath, getTempFile, makeRelative, makeRelativeTo, normalizePath, readJsonFile } from "./fileHelpers";
import { IGruntWrapper } from "./interfaces/IGruntWrapper";

export interface ITsConfigDetails {
    /**
     * The filename of the loaded TsConfig
     */
    name: string;

    /**
     * The temporary name for the config
     */
    tempName?: string;

    /**
     * The root folder of the loaded name
     */
    nameRoot: string;

    /**
     * The loaded TsConfig object
     */
    tsConfig: ITsConfig;

    /**
     * The options that were used to override the loaded config
     */
    tsOption?: ITsOption;

    /**
     * Has the originally loaded config been changed
     */
    modified: boolean;

     /**
     * Use this as the rootDir (may be undefined / null)
     */
    rootDir?: string;

    /**
     * Was the rootDir updated and therefore should be explicitly set
     */
    rootDirUpdated?: boolean;
    
    /**
     *  Use this as the declarationDir (may be undefined / null) 
     */
    declarationDir?: string;

    /**
     * The value of the rootDir set within the tsconfig project file
     */
    projectRootDir?: string;

    /**
     * Add possible additional files to the loaded config
     */
    addFiles: (tsFiles: string | string[]) => boolean;

    /**
     * Get an array of all files from the tsConfig
     */
    getFiles: () => string[];

    createTemp: (idx?: number) => string;

    cleanupTemp: () => void;
}

function _resolveTsConfigFiles(tsConfigPath: string, files: string[]): string[] {
    let location = "";
    const idx = tsConfigPath.lastIndexOf("/");
    if (idx !== -1) {
        location = tsConfigPath.substring(0, idx + 1);
    }

    if (location) {
        const destFiles: string[] = [];
        if (files && files.length > 0) {
            arrForEach(files, (theFile) => {
                destFiles.push(normalizePath(location + theFile));
            });
        }

        files = destFiles;
    }

    return files;
}

/**
 * Merge the files from the merge array into the target array but only add unique values
 * 
 * @param target - The target array to merge into
 * @param merge - The array to merge into the target
 * @returns - The target array
 */
function _mergeFiles(target: string[], merge: string[]): string[] {
    if (isNullOrUndefined(target) || target.length === 0) {
        return merge;
    }

    arrForEach(merge, (val) => {
        if (target.indexOf(val) === -1) {
            target.push(val);
        }
    });

    return target;
}

function _mergeConfigs(target: any, merge: any): any {
    if (isNullOrUndefined(target)) {
        return merge;
    }

    if (isArray(target)) {
        if (isArray(merge)) {
            arrForEach(merge, (val) => {
                target.push(val);
            });
        } else {
            target.push(merge);
        }

        return target
    }

    if (isPlainObject(merge)) {
        objForEachKey(merge, (key, value) => {
            // eslint-disable-next-line security/detect-object-injection
            (target as any)[key] = _mergeConfigs((target as any)[key], value);
        });

        return target;
    }

    return merge || target;
}

function _createTsConfigDetails(grunt: IGruntWrapper, tsConfigOrOption: string | ITsOption | null, logWarnings: boolean): ITsConfigDetails {
    let tsOption: ITsOption = null;
    
    if (isString(tsConfigOrOption)) {
        tsOption = {
            name: tsConfigOrOption,
            tsconfig: null
        }
    } else {
        tsOption = tsConfigOrOption || {
            name: null,
            tsconfig: null
        };
    }
    
    // Make sure we have a filename
    tsOption.name = tsOption.name || "./tsconfig.json";

    let details: ITsConfigDetails = {
        name: tsOption.name,
        nameRoot: path.resolve(findCommonPath([tsOption.name])),
        tsConfig: null,
        tsOption: tsOption,
        modified: false,
        addFiles: null,
        getFiles: null,
        createTemp: null,
        cleanupTemp: null
    };

    let tsConfig = details.tsConfig = readJsonFile<ITsConfig>(details.name)
    let tsConfigRoot = details.nameRoot;
    let projectRootDir: string = null;
    let rootDir: string = null;

    // Override the compiler options if they are provided
    if (tsConfig && details.tsConfig) {
        // Overwrite the tsConfig with the provided additional options
        tsConfig = details.tsConfig = _mergeConfigs(objDeepCopy(tsConfig), tsOption.tsconfig);
        details.modified = true;
    }

    let compilerOptions = tsConfig.compilerOptions = tsConfig.compilerOptions || {};

    if (compilerOptions.rootDir) {
        projectRootDir = normalizePath(path.resolve(findCommonPath([details.name || "."]), compilerOptions.rootDir));

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        if (!fs.existsSync(path.resolve(projectRootDir))) {
            rootDir = path.resolve(compilerOptions.rootDir);

            // eslint-disable-next-line security/detect-non-literal-fs-filename
            if (rootDir !== tsConfigRoot && fs.existsSync(rootDir)) {
                logWarnings && grunt.logWarn(("The rootDir specified in your project file [" + details.name + "] is invalid as it assumes the current working directory.\n - [" + compilerOptions.rootDir + "] resolves to [" + projectRootDir + "]\n - Overridding to use: [" + rootDir + "]\n -- Update or remove to fix this warning").yellow);
            } else {
                logWarnings && grunt.logWarn(("The rootDir specified in your project file [" + details.name + "] is invalid.\n - [" + compilerOptions.rootDir + "] resolves to [" + projectRootDir + "]\n - Using tsconfig location: [" + tsConfigRoot + "]\n -- Update or remove to fix this warning").yellow);
                rootDir = tsConfigRoot;
            }

            // Assume the declaration folder has the same issue
            if (compilerOptions.declarationDir) {
                let projectDeclarationDir = path.resolve(rootDir, compilerOptions.declarationDir);
                let declarationDir = path.resolve(compilerOptions.declarationDir);

                // If the folders are different and the --rootDir existed based on the cwd then use the same resolution
                if (declarationDir !== projectDeclarationDir) {
                    logWarnings && grunt.logWarn(("The declarationDir specified in your project file [" + details.name + "] is invalid as it assumes the current working directory.\n - [" + compilerOptions.declarationDir + "] resolves to [" + projectDeclarationDir + "]\n - Overridding to use: [" + declarationDir + "]\n -- Update or remove to fix this warning").yellow);
                    details.declarationDir = declarationDir;
                } else {
                    logWarnings && grunt.logWarn(("The rootDir specified in your project file [" + details.name + "] is invalid.\n - [" + compilerOptions.declarationDir + "] resolves to [" + projectDeclarationDir + "]\n - Using: [" + rootDir + "]\n -- Remove to fix this warning").yellow);
                    details.declarationDir = rootDir;
                }
            }
            
            details.rootDir = rootDir;
            details.rootDirUpdated = true;
        } else {
            // The specified rootDir is correct
            details.rootDir = projectRootDir;
        }
    } else {
        // No rootDir defined in the project file
        details.rootDir = tsConfigRoot;
    }

    details.addFiles = (tsFiles: string | string[]) => {

        if (tsFiles && isString(tsFiles)) {
            tsFiles = [ tsFiles ];
        }

        if (Array.isArray(tsFiles) && tsFiles.length > 0) {
            let tsConfig = details.tsConfig;
            let tsConfigRoot = details.nameRoot;
            let fileRootDir = normalizePath(details.rootDir || tsConfigRoot || "");
            if (grunt.isDebug) {
                grunt.logDebug("");
                grunt.logDebug("Adding files from grunt config... using: " + (fileRootDir ? fileRootDir : ""));
                grunt.logDebug("-----------------------------------------------------------------------------------------------------");
            }
    
            arrForEach(tsFiles, (theFile) => {
                let excludePath = false;

                if (theFile.startsWith("!")) {
                    excludePath = true;
                    theFile = theFile.substring(1);
                }

                let theResolvedFile = theFile;
                if (theResolvedFile.endsWith("**")) {
                    theResolvedFile = theResolvedFile + "/*";
                }
    
                let fullFilePath = normalizePath(path.resolve(theResolvedFile));
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
    
                if (grunt.isDebug) {
                    grunt.logDebug(" - [" + theFile + "]\n   => [" + theResolvedFile + "]\n      => [" + relativeResolvedFile + "]")
                }

                // put globs in the include and files directly unless there are excludes already defined
                let destContainer;
                if (excludePath) {
                    destContainer = tsConfig.exclude = tsConfig.exclude || [];
                } else if (!tsConfig.exclude && theResolvedFile.indexOf("*") === -1) {
                    if (grunt.isDebug) {
                        grunt.logDebug("Using files as the container");
                    }

                    destContainer = tsConfig.files = tsConfig.files || [];
                } else {
                    if (grunt.isDebug) {
                        grunt.logDebug("Using include as the container");
                    }

                    destContainer = tsConfig.include = tsConfig.include || [];
                }
                
                destContainer.push(relativeResolvedFile);
                details.modified = true;
            });
    
            grunt.logDebug("-----------------------------------------------------------------------------------------------------");
    
            if (tsConfig.files && tsConfig.files.length === 0) {
                if (grunt.isDebug) {
                    grunt.logDebug("Removing empty files");
                }

                details.modified = true;
                delete tsConfig.files;
            }
    
            if (tsConfig.include && tsConfig.include.length === 0) {
                if (grunt.isDebug) {
                    grunt.logDebug("Removing empty include");
                }

                details.modified = true;
                delete tsConfig.include;
            }

            if (tsConfig.exclude && tsConfig.exclude.length === 0) {
                if (grunt.isDebug) {
                    grunt.logDebug("Removing empty exclude");
                }

                details.modified = true;
                delete tsConfig.exclude;
            }
        }

        return details.modified;
    }

    details.getFiles = (): string[] => {
        let tsConfigFiles: string[] = [];
        // let exclude = null;
        if (details.name) {
            let tsConfig = details.tsConfig;
            //grunt.log.writeln("Using tsconfig: " + tsProject);
            if (tsConfig.files) {
                if (grunt.isDebug) {
                    grunt.logDebug("Adding Files: " + JSON.stringify(tsConfig.files));
                }

                tsConfigFiles = _mergeFiles(tsConfigFiles, _resolveTsConfigFiles(details.name, tsConfig.files));
            } 
            
            if (tsConfig.include) {
                if (grunt.isDebug) {
                    grunt.logDebug("Adding Include: " + JSON.stringify(tsConfig.include));
                }

                tsConfigFiles = _mergeFiles(tsConfigFiles, _resolveTsConfigFiles(details.name, tsConfig.include));
            }
    
            // if (tsConfig.exclude) {
            //     exclude = _resolveTsConfigFiles(details.name, tsConfig.exclude);          
            //     //grunt.log.writeln("Excluding: " + JSON.stringify(exclude));
            // } 
        }

        if (grunt.isDebug) {
            grunt.logDebug("getFiles (" + details.name + "): " + JSON.stringify(tsConfigFiles));
        }
    
        return tsConfigFiles;
    }

    details.createTemp = (idx: number = 0) => {
        if (details.modified) {
            if (details.tempName) {
                throw new Error("Temporary tsconfig file already exists");
            }

            details.tempName = getTempFile(details.name || "tsconfig-" + idx);
            if (!details.tempName) {
                throw new Error("Unable to create temporary tsconfig file");
            }

            let tsConfigContent = JSON.stringify(details.tsConfig, null, 4);
            if (grunt.isDebug) {
                grunt.logDebug("Creating Temporary TsConfig.json [" + details.tempName + "]:\n" + tsConfigContent);
            }

            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.writeFileSync(details.tempName, tsConfigContent);
            return details.tempName;
        }

        return details.name;
    };

    details.cleanupTemp = () => {
        if (grunt.isDebug) {
            grunt.logDebug("Cleaning up temporary tsconfig file: " + details.tempName);
        }

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        if (details.tempName && fs.existsSync(details.tempName)) {
            fs.unlinkSync(details.tempName);
            if (fs.existsSync(details.tempName)) {
                grunt.logWarn("Unable to delete temporary tsconfig file: " + details.tempName);
            }
        } else if (grunt.isDebug) {
            grunt.logDebug("Temporary tsconfig file does not exist: " + details.tempName);
        }
    };

    if (details.tsOption?.src) {
        details.addFiles(details.tsOption.src);
    }

    return details;
}

export function getTsConfigDetails(
    grunt: IGruntWrapper,
    tsConfig: TsConfigDefinitions | undefined | null,
    logWarnings: boolean
): ITsConfigDetails[] {
    let details: ITsConfigDetails[] = [];

    // Collect the tsConfig files
    if (isString(tsConfig)) {
        // Just a single tsConfig file
        details.push(_createTsConfigDetails(grunt, tsConfig, logWarnings));
    } else if (isArray(tsConfig)) {
        arrForEach(tsConfig, (tsConfig) => {
            details.push(_createTsConfigDetails(grunt, tsConfig, logWarnings));
        });
    } else if (isIterable(tsConfig) || isIterator(tsConfig)) {
        iterForOf(tsConfig, (tsConfig) => {
            details.push(_createTsConfigDetails(grunt, tsConfig, logWarnings));
        });
    }

    if (details.length === 0) {
        // No tsConfig files provided, create an empty one
        details.push(_createTsConfigDetails(grunt, null, logWarnings));
    }

    return details;
}
