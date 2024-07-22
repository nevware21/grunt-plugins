/*
 * @nevware21/grunt-ts-plugins
 * https://github.com/nevware21/grunt-plugins
 *
 * Copyright (c) 2021 NevWare21 Solutions LLC
 * Licensed under the MIT license.
 */

import { IPromise } from "@nevware21/ts-async";
import { IExecuteResponse } from "./IExecuteResponse";

export interface ITsConfig {
    /**
     * The path to the tsconfig file which this file extends
     */
    extends?: string;
    compilerOptions?: ITsCompilerOptions;
    files?: string[];
    exclude?: string[];
    include?: string[];
    filesGlob?: string[];
}

// NOTE: This is from tsconfig.ts in atom-typescript
export interface ITsCompilerOptions {
    allowJs?: boolean;
    allowSyntheticDefaultImports?: boolean;
    allowUmdGlobalAccess?: boolean;
    allowUnreachableCode?: boolean;
    allowUnusedLabels?: boolean;
    alwaysStrict?: boolean;  // Always combine with strict property
    baseUrl?: string;
    charset?: string;
    checkJs?: boolean;
    declaration?: boolean;
    declarationMap?: boolean;
    emitDeclarationOnly?: boolean;
    declarationDir?: string;
    disableSizeLimit?: boolean;
    disableSourceOfProjectReferenceRedirect?: boolean;
    disableSolutionSearching?: boolean;
    disableReferencedProjectLoad?: boolean;
    downlevelIteration?: boolean;
    emitBOM?: boolean;
    emitDecoratorMetadata?: boolean;
    exactOptionalPropertyTypes?: boolean;
    experimentalDecorators?: boolean;
    forceConsistentCasingInFileNames?: boolean;
    importHelpers?: boolean;
    importsNotUsedAsValues?: "remove" | "preserve" | "error";
    inlineSourceMap?: boolean;
    inlineSources?: boolean;
    isolatedModules?: boolean;
    jsx?: "preserve" | "react-native" | "react" | "react-jsx" | "react-jsxdev" | "react-jsxself" | "react-jsxsource";
    keyofStringsOnly?: boolean;
    lib?: string[];
    locale?: string;
    mapRoot?: string;
    maxNodeModuleJsDepth?: number;
    module?: "none" | "commonjs" | "amd" | "umd" | "system" | "es6" | "es2015" | "esnext";
    moduleResolution?: "node" | "classic";
    newLine?: "crlf" | "lf";
    noEmit?: boolean;
    noEmitHelpers?: boolean;
    noEmitOnError?: boolean;
    noErrorTruncation?: boolean;
    noFallthroughCasesInSwitch?: boolean;
    noImplicitAny?: boolean;  // Always combine with strict property
    noImplicitReturns?: boolean;
    noImplicitThis?: boolean;  // Always combine with strict property
    noStrictGenericChecks?: boolean;
    noUnusedLocals?: boolean;
    noUnusedParameters?: boolean;
    noImplicitUseStrict?: boolean;
    noPropertyAccessFromIndexSignature?: boolean;
    assumeChangesOnlyAffectDirectDependencies?: boolean;
    noLib?: boolean;
    noResolve?: boolean;
    noUncheckedIndexedAccess?: boolean;
    out?: string;
    outDir?: string;
    outFile?: string;
    paths?: { [key:string]: string[] };
    preserveConstEnums?: boolean;
    noImplicitOverride?: boolean;
    preserveSymlinks?: boolean;
    project?: string;
    reactNamespace?: string;
    jsxFactory?: string;
    jsxFragmentFactory?: string;
    jsxImportSource?: string;
    composite?: boolean;
    incremental?: boolean;
    tsBuildInfoFile?: string;
    removeComments?: boolean;
    rootDir?: string;
    rootDirs?: string[];
    skipLibCheck?: boolean;
    skipDefaultLibCheck?: boolean;
    sourceMap?: boolean;
    sourceRoot?: string;
    strict?: boolean;
    strictFunctionTypes?: boolean;  // Always combine with strict property
    strictBindCallApply?: boolean;  // Always combine with strict property
    strictNullChecks?: boolean;  // Always combine with strict property
    strictPropertyInitialization?: boolean;  // Always combine with strict property
    stripInternal?: boolean;
    suppressExcessPropertyErrors?: boolean;
    suppressImplicitAnyIndexErrors?: boolean;
    target?: "es3" | "es5" | "es6" | "es2015" | "es2016" | "es2017" | "es2018" | "es2019" | "es2020" | "es2021" | "esnext" | "json" | "latest";
    traceResolution?: boolean;
    useUnknownInCatchVariables?: boolean;
    resolveJsonModule?: boolean;
    types?: string[];
    /** Paths used to compute primary types search locations */
    typeRoots?: string[];
    esModuleInterop?: boolean;
    useDefineForClassFields?: boolean;
    emitDeclarationMetadata?: boolean;
}

/**
 * Identifies the input types for specifying tsconfig files
 */
export type TsConfigDefinitions = string | ITsOption | Array<string | ITsOption> | Iterable<string | ITsOption> | Iterator<string | ITsOption>;

/**
 * Identifies the input types for specifying tsconfig files
 */
// export type TsConfigFilenames = string | string[] | Iterable<string> | Iterator<string>;


/**
 * Identifies optional variants which may be used to override any provided
 * base configurations.
 */
export interface ITsOption {
    /**
     * Identifies the filename and location of the tsConfig that will be loaded and used
     * as the primary configuration settings unless the values are overriden by the values
     * within the `tsconfig` property. When not filename is provided `./tsconfig.json` will
     * be used.
     */
    name?: string;

    /**
     * Identifies an inlined tsConfig file which is to be merged with any
     * defined / loaded tsConfig file loaded from the `name` property.
     */
    tsconfig: ITsConfig;

    /**
     * An array of source files to be "added" to all tasks as either files or include for each task tsconfig
     */
    src?: string | string[];

    /**
     * Optional out location
     */
    out?: string;

    /** 
     * Specify the output directory 
     */
    outDir?: string;

    /**
     * The function to execute when the variant is selected
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

/**
 * Identifies the input types for specifying variant definitions
 */
export type ITsOptions = ITsOption | ITsOption[] | Iterable<ITsOption> | Iterator<ITsOption>;