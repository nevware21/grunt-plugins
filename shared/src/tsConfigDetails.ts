/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import * as fs from "fs";
import * as path from "path";
import { isString } from "@nevware21/ts-utils";
import { ITsConfig, ITsCompilerOptions } from "./interfaces/ITsConfig";
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
     * A reference to the compilerOptions from the tsConfig or an empty object if the tsConfig was not loaded
     */
    compilerOptions: ITsCompilerOptions;

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

    createTemp: () => string;

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
            files.forEach((theFile) => {
                destFiles.push(location + theFile);
            });
        }

        files = destFiles;
    }

    return files;
}

export function getTsConfigDetails(grunt: IGruntWrapper, tsConfigFile: string, logWarnings: boolean): ITsConfigDetails[] {
    let details: ITsConfigDetails = {
        name: tsConfigFile,
        nameRoot: tsConfigFile ? path.resolve(findCommonPath([tsConfigFile])) : null,
        tsConfig: null,
        compilerOptions: {} as ITsCompilerOptions,
        modified: false,
        addFiles: null,
        getFiles: null,
        createTemp: null,
        cleanupTemp: null
    }

    if (tsConfigFile) {
        let tsConfig = details.tsConfig = readJsonFile<ITsConfig>(tsConfigFile)
        let compilerOptions = details.compilerOptions = tsConfig.compilerOptions || details.compilerOptions;
        let tsConfigRoot = details.nameRoot;
        let projectRootDir: string = null;
        let rootDir: string = null;  

        if (compilerOptions.rootDir) {
            projectRootDir = path.resolve(findCommonPath([tsConfigFile]), compilerOptions.rootDir);

            // eslint-disable-next-line security/detect-non-literal-fs-filename
            if (!fs.existsSync(path.resolve(projectRootDir))) {
                rootDir = path.resolve(compilerOptions.rootDir);

            // eslint-disable-next-line security/detect-non-literal-fs-filename
            if (rootDir !== tsConfigRoot && fs.existsSync(rootDir)) {
                    logWarnings && grunt.logWarn(("The rootDir specified in your project file [" + tsConfigFile + "] is invalid as it assumes the current working directory.\n - [" + compilerOptions.rootDir + "] resolves to [" + projectRootDir + "]\n - Overridding to use: [" + rootDir + "]\n -- Update or remove to fix this warning").yellow);
                } else {
                    logWarnings && grunt.logWarn(("The rootDir specified in your project file [" + tsConfigFile + "] is invalid.\n - [" + compilerOptions.rootDir + "] resolves to [" + projectRootDir + "]\n - Using tsconfig location: [" + tsConfigRoot + "]\n -- Update or remove to fix this warning").yellow);
                    rootDir = tsConfigRoot;
                }

                // Assume the declaration folder has the same issue
                if (compilerOptions.declarationDir) {
                    let projectDeclarationDir = path.resolve(rootDir, compilerOptions.declarationDir);
                    let declarationDir = path.resolve(compilerOptions.declarationDir);

                    // If the folders are different and the --rootDir existed based on the cwd then use the same resolution
                    if (declarationDir !== projectDeclarationDir) {
                        logWarnings && grunt.logWarn(("The declarationDir specified in your project file [" + tsConfigFile + "] is invalid as it assumes the current working directory.\n - [" + compilerOptions.declarationDir + "] resolves to [" + projectDeclarationDir + "]\n - Overridding to use: [" + declarationDir + "]\n -- Update or remove to fix this warning").yellow);
                        details.declarationDir = declarationDir;
                    } else {
                        logWarnings && grunt.logWarn(("The rootDir specified in your project file [" + tsConfigFile + "] is invalid.\n - [" + compilerOptions.declarationDir + "] resolves to [" + projectDeclarationDir + "]\n - Using: [" + rootDir + "]\n -- Remove to fix this warning").yellow);
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
    
            tsFiles.forEach((theFile) => {
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
                    destContainer = tsConfig.files = tsConfig.files || [];
                } else {
                    destContainer = tsConfig.include = tsConfig.include || [];
                }
                
                destContainer.push(relativeResolvedFile);
                details.modified = true;
            });
    
            grunt.logDebug("-----------------------------------------------------------------------------------------------------");
    
            if (tsConfig.files && tsConfig.files.length === 0) {
                details.modified = true;
                delete tsConfig.files;
            }
    
            if (tsConfig.include && tsConfig.include.length === 0) {
                details.modified = true;
                delete tsConfig.include;
            }

            if (tsConfig.exclude && tsConfig.exclude.length === 0) {
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
                tsConfigFiles = _resolveTsConfigFiles(details.name, tsConfig.files);
            } else if (tsConfig.include) {
                tsConfigFiles = _resolveTsConfigFiles(details.name, tsConfig.include);
            }
    
            // if (tsConfig.exclude) {
            //     exclude = _resolveTsConfigFiles(details.name, tsConfig.exclude);          
            //     //grunt.log.writeln("Excluding: " + JSON.stringify(exclude));
            // } 
        }
    
        return tsConfigFiles;
    }

    details.createTemp = () => {
        if (details.modified) {
            details.tempName = getTempFile(details.name || "tsconfig");
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
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        details.tempName && fs.unlinkSync(details.tempName);
    };

    return [ details ];
}
