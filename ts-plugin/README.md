<h1 align="center">@Nevware21 grunt-ts-plugin</h1>

![GitHub Workflow Status (main)](https://img.shields.io/github/workflow/status/nevware21/grunt-plugins/NodeCI/main)
[![npm version](https://badge.fury.io/js/%40nevware21%2Fgrunt-ts-plugin.svg)](https://badge.fury.io/js/%40nevware21%2Fgrunt-ts-plugin)
[![downloads](https://img.shields.io/npm/dm/%40nevware21/grunt-ts-plugin.svg)](https://img.shields.io/npm/dm/%40nevware21/grunt-ts-plugin)

Grunt-ts-plugin is an npm package that handles TypeScript compilation work in GruntJS build scripts.

Grunt-ts-plugin provides a Grunt-compatible wrapper for the `tsc` command-line compiler using the ```--project``` switch to compile existing TypeScript projects files (tsconfig.json), and provides some [additional options](#options) that improves the TypeScript development workflow.

The plugin itself is both written and compiled using TypeScript and it also uses itself to compile via grunt.

Unlike other plugins (such as [grunt-ts](https://www.npmjs.com/package/grunt-ts), this plugin focuses on providing support for using your existing project files (tsconfig.json) rather than exposing all of the command-line options of the tsc compiler. However, it does provide the capability to pass additional command-line options via the additionalFlags option.

 As a consequence of this it does NOT support the use of all standard GruntJS functionality such as `dest` or the use of the `files` object, etc.

## Grunt-ts-plugin Features

 * Supports TypeScript Projects via [tsconfig.json](#tsconfig) via the ```tsc --project``` option and therefore all features of the TypeScript ```tsc``` compiler.
 * Allows the developer to provide a custom TypeScript compiler version for their project, or even use a custom (in-house) version.
 * Dynamically process the tsc errors to pass or fail the build via the ```onError``` option
 * Add "extra" files to an existing tsconfig.json via the ```src``` properties, these are dynamically added to the tsconfig.json ```files``` or ```include``` properties.
 * Allows passing of ```additionalFlags``` to the `tsc` command-line.

### Unsupported Grunt features

 * [Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping) feature as it is not supported by `tsc` from the command-line
 * Grunt `dest` target property, use the `src` options instead.
 * Grunt `files` property for identifying files to be compiled (*.ts), planned future feature (#18 - [Feature] Add support for Grunt files object)

### Support for tsc Switches

Any arbitrary switches can be passed to `tsc` via the [additionalFlags](#additionalflags) feature. Any passed additionalFlags will take precedence over switches that are used by the plugin (`--out`, `--project`, `--declarationDir`, `--rootDir`)

### Quickstart

Install the npm packare: `npm install @nevware21/grunt-ts-plugin --save-dev`

| Package | Descriptpion
|---------|----------------------
| TypeScript | `npm install typescript --save-dev` - if you don't have TypeScript installed in your project, run
| GruntJS | `npm install grunt --save-dev` - if you don't have GruntJS installed in your project
| Grunt-Cli | `npm install grunt-cli --save-dev` - Suggested, if you have never used Grunt on your system

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

### Mininimal 

```js
module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      default : {
        tsconfig: './tsconfig.json'
      }
    }
  });
  grunt.loadNpmTasks("@nevware21/grunt-ts-plugin");
  grunt.registerTask("default", ["ts"]);
};
```

### Options

The options can be specified at the global ```options``` or ```task``` level, with the task level values overridding any value defined in the global options

#### __Task only level options__

| Name | Type | Description
|------|------|------------
| tsconfig | string | The path to the tsConfig file to use, when specified
| src | string | string[] | A single string or an array of source files to be "added" to the tsconfig as either files or include. When a string it assumes a single entry, there is not encoded list etc.
| out | string | Concatenate the output into a single file using the tsc --out parameter. If the tscConfig also includes an ```outDir``` this value will be ignored.
| outDir | string | Use the tsc --outDir parameter. If the tscConfig also includes an ```out``` or ```outFile``` the value will be ignored.

#### __Common options:__ Global and Task

| Name | Type | Description
|------|------|------------
| src | string | string[] | A single string or an array of source files to included in each task.
| additionalFlags | string \| string[]<br />Default: Empty String | Pass in additional flags to the tsc compiler (added to the end of the command line)
| failOnTypeErrors | Boolean<br/>Defaults: true | Should the compile run fail when type errors are identified, ignores failures from imported node_module/** packages
| failOnExternalTypeErrors | Boolean<br/>Defaults: false | Should the compile run fail when type errors are identified as originating from an external packages (node_modules/)
| tscPath | String<br>Defaults: reverse scan from project path for node_modules/typescript/bin folder | Identify the root path of the version of the TypeScript is installed, this may include be either the root folder of where the node_modules/typescript/bin folder is located or the location of the command-line version of tsc.
| compiler | String <br />Defaults: to "tsc" within the located or defined tscPath | Identify the complete path to the command line version of tsc
| onError | ErrorHandlerResponse<br />| This callback function will be called when an error matching "error: TS\d+:" is found, the errorNumber is the detected value and line is the entire line containing the error message.
| debug | Boolean<br/>Defaults: false | Log additional debug messages during the build, you can also enable grunt --verbose mode.
| logOutput | Boolean<br/>Defaults: false | Log the output of the execute response
| keepTemp | Boolean<br/>Defaults: false | Additional debugging switch that will not cleanup (delete) the temporary files used for building, use this flag to review the generated temporary tsconfig.json if one is required.

**Example showing some option combinations**

```js
module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
        options: { // Shared options for all projects
            debug: true,
            //logOutput: true,
            //tscPath: "../tools/localtscpath",
            //compiler: "tsc"
            onError: myErrorHandler,
            //src: [ "Commonfiles/**/*.ts" ]
            additionalFlags: [
              "--clean"
            ],
            //failOnTypeErrors: false

        },
        "shared_utils": {
            tsconfig: "./shared/tsconfig.json"
        },
        "ts_plugin": {
            debug: false,   // Override the default defined in the options
            tsconfig: "./ts-plugin/tsconfig.json"
        },
        "file_options" {
            debug: true,
            //logOutput: true,
            //tscPath: "../tools/localtscpath",
            //compiler: "tsc"
            onError: myErrorHandler,
            //src: [ "Commonfiles/**/*.ts" ]
            additionalFlags: [
              "--clean"
            ],
            //failOnTypeErrors: false
            tsconfig: "./sample/tsconfig.json",
            src: [
              "./tests/*.ts",
              "./framework/**/*.ts",
              "./common/polyfills.ts",
            ],
            out: "../tests/my-test-output.ts",
            onError: myExtraErrorHandler
        },
        "shared_utils_esnext": {
            tsconfig: "./shared/tsconfig.json",
            additionalFlags: [
              "--target esnext",
              "--outDir ../dist/esnext"
            ]
        }
    }
  });

  grunt.loadNpmTasks("@nevware21/grunt-ts-plugin");
  grunt.registerTask("ts_plugin", [ "ts:ts_plugin" ]);
  grunt.registerTask("shared_utils", [ "ts:shared_utils" ]);
};
```

### OnError Handler

The onError callback allows you to re-classify errors that are emitted by the tsc compiler to cause them to be Ignored, just logged or cause a build failure.


This error handler is called for every tsc output line that contains an error matching the ```error: TS(\d+):``` regular expression where the (\d+) group identifies the error number.

```OnErrorHandler = (errorNumber: string, line?: string) => ErrorHandlerResponse;```

| Param | Description
|-------|-------------------
| errorNumber | The identified error number
| line | The full line containing the error

Example Error line: ```error TS6059: File 'xxxx' is not under 'rootDir' 'xxx'. 'rootDir' is expected to contain all source files.```

> Note:
>
> Even if you qualify an error to be ignored, if the tsc compiler returns a non-zero value this will still be treated as a failure. To "avoid" that scenario you will need to provide a compiler option and wrap the tsc compiler to change any returned value.

#### ErrorHandlerResponse

| Name | Value | Description
|------|-------|------------
| Undefined | 0 | The handler did not identify whether this should be treated as an error, warning or ignore. So follow normal built in handling. Null and undefined responses are treated the same as this value.
| Ignore | 1 | Ignore this error with no logging
| Silent | 2 | Include the error in the log, but don't treat as an error or warning
| Error | 3 | Treat as an error and fail the build

```js
module.exports = function(grunt) {

  // A simple onError handler which ignores error 6082
  function tsErrorHandler(errorNo, line) {
    if (errorNo === "6082") {
      // Explicitly log this in the error output, but continue
      return 2;
    }

    // Use the default internal categorization of output errors
    return 0;
  }

  grunt.initConfig({
    ts: {
        options: { // Shared options for all projects
            debug: true,
            onError: tsErrorHandler
        },
        "shared_utils": {
            tsconfig: "./shared/tsconfig.json"
        },
        "ts_plugin": {
            debug:false,   // Override the default defined in the options
            tsconfig: "./ts-plugin/tsconfig.json"
        }
    }
  });

  grunt.loadNpmTasks("@nevware21/grunt-ts-plugin");
  grunt.registerTask("ts_plugin", [ "ts:ts_plugin" ]);
  grunt.registerTask("shared_utils", [ "ts:shared_utils" ]);
};
```
## Basic Upgrading from grunt-ts

This plugin does not support all of the features of `grunt-ts` but it does provide and support basic ts compilation.

The primary difference in the way `grunt-ts` compiles `*.ts` files and this plugin, is that `grunt-ts` compiles files by passing them on the command-line, while this plugin always uses the `--project` switch to pass the provided project or a temporary created version with additional files included as `files` or `include` extensions.

### Supported Configuration / differences

| grunt-ts | @nevware21/<br/>grunt-ts-plugin | Type | Notes
| ---------|----------------------------|------|-------
| additionalFlags | additionalFlags | string \| string[] | Supports both a string or an array. When an array is passed the additionalFlags will be included on the `tsc` command-line space seperated.
| compiler | compiler | string | Same: Path to customer compiler
| out | out | string | Same: instruct `tsc` to concenate output to this file, uses passed with `--out` switch if `outDir` is not already in the tsconfig.json
| src | src | string \| string[] | Mostly Same: File or glob of TypeScript files to compile. This plugin does not expand the glob it will include any glob (containing a `*`) into the `include` section of the tsconfig.json.
| tsconfig | tsconfig | string (only) |  Only supports the `string` variant, this will be used either directly or as a template (if other files are include) and passed as the `--project` switch
| verbose | debug | boolean | Causes additional `debug` and `tsc` command-line options to be echo'd to the grunt log / console.

Most of the `grunt-ts` options are related to command-line switches used by `tsc`, as stated above if you want to use these switches you should either include them in the `tsconfig.json` file passed in the `tsconfig` option or pass in the `additionalFlags`, any `additionalFlags` switch added will never be overwritten by the internally added flags.

### Simple upgrade instructions

- Change the `grunt.loadNpmTasks("grunt-ts");` => `grunt.loadNpmTasks("@nevware21/grunt-ts-plugin");`

## Contributing

Read our [contributing guide](https://github.com/nevware21/grunt-plugins/blob/main/CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.

## Release History

See [The ChangeLog](https://github.com/nevware21/grunt-plugins/tree/main/ts-plugin/CHANGELOG.md)

