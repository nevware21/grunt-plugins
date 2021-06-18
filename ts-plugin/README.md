<h1 align="center">@Nevware21 grunt-ts-plugin</h1>


Grunt-ts-plugin is an npm package that handles TypeScript compilation work in GruntJS build scripts.

Grunt-ts-plugin provides a Grunt-compatible wrapper for the `tsc` command-line compiler using the ```--project``` switch to compile existing TypeScript projects files (tsconfig.json), and provides some [additional functionality](#grunt-ts-gruntfilejs-options) that improves the TypeScript development workflow.

The plugin itself is both written and compiled using [TypeScript](./ts-plugin/src/ts-plugin.ts) and it also uses itself to compile via grunt.

Unlike other plugins (such as [grunt-ts](https://www.npmjs.com/package/grunt-ts), this plugin focuses on providing support for using your existing TypeScript project files (tsconfig.json) rather than exposing all of the command-line options of the tsc compiler. However, it does provide the capability to pass additional command-line options via the [additionalFlags](#additionalflags) option.

 As a consequence of this it does NOT support the use of all standard GruntJS functionality such as the use of the `files` object, etc.

## Grunt-ts-plugin Features

 * Supports TypeScript Projects via [tsconfig.json](#tsconfig) via the ```tsc --project``` option and therefore all features of the TypeScript ```tsc``` compiler.
 * Allows the developer to [select a custom TypeScript compiler version](#compiler) for their project, or even use a custom (in-house) version.
 * Dynamically process the tsc errors to pass or fail the build
 * Add "extra" files to an existing tsconfig.json via the ```src``` properties, these are dynamically added to the tsconfig.json ```files``` or ```include``` properties.

### Unsupported Grunt features

 * Identifying files to be compiled (*.ts) via the use of the `files` object or globbing, etc.
 * [Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping) feature as it is not supported by `tsc` from the command-line

### Support for tsc Switches

Grunt-ts provides explicit support for most `tsc` switches.  Any arbitrary switches can be passed to `tsc` via the [additionalFlags](#additionalflags) feature.

### Quickstart

`npm install @nevware21/grunt-ts-plugin --save-dev`

As this is a development only tool if only needs to be intalled into your root project (if you have a mono-repo) and only as a ```devDependency```

To install @nevware21/grunt-ts-plugin, you must already have installed TypeScript and GruntJS.
 * If you don't have TypeScript installed in your project, run `npm install typescript --save-dev`.
 * If you don't have GruntJS installed in your project, run `npm install grunt --save-dev`.
 * If you have never used Grunt on your system, install the grunt-cli: `npm install grunt-cli`.

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

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
| out | string |  Concatenate the output into a single file using the tsc --out parameter. If the tscConfig also includes an ```outDir``` this value will be ignored

#### __Common options:__ Global and Task

| Name | Type | Description
|------|------|------------
| src | string | string[] | A single string or an array of source files to included in each task.
| additionalFlags | String<br />Default: Empty String | Pass in additional flags to the tsc compiler (added to the end of the command line)
| failOnTypeErrors | Boolean<br/>Defaults: false | Should the compile run fail when type errors are identified
| tscPath | String<br>Defaults: reverse scan from project path for node_modules/typescript/bin folder | Identify the root path of the version of the TypeScript is installed, this may include be either the root folder of where the node_modules/typescript/bin folder is located or the location of the command-line version of tsc.
| compiler | String<br/ >Defaults: to "tsc" within the located or defined tscPath | Identify the complete path to the command line version of tsc
| onError | ErrorHandlerResponse<br />| This callback function will be called when an error matching "error: TS\d+:" is found, the errorNumber is the detected value and line is the entire line containing the error message.
| debug | Boolean<br/>Defaults: false | Log additional debug messages during the build, you can also enable grunt --verbose mode.
| logOutput | Boolean<br/>Defaults: false | Log the output of the execute response



```js
module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
        options: { // Shared options for all projects
            debug: true,
            comments: true
        },
        "shared_utils": {
            tsconfig: "./shared/tsconfig.json"
        },
        "ts_plugin": {
            debug: false,   // Override the default defined in the options
            tsconfig: "./ts-plugin/tsconfig.json"
        }
    }
  });

  grunt.loadNpmTasks("@nevware21/grunt-ts-plugin");
  grunt.registerTask("ts_plugin", [ "ts:ts_plugin" ]);
  grunt.registerTask("shared_utils", [ "ts:shared_utils" ]);
};
```

### OnErrorHandler

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
      return 2;
    }

    return 0;
  }

  grunt.initConfig({
    ts: {
        options: { // Shared options for all projects
            debug: true,
            comments: true,
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

## Contributing

Thank you for your interest in contributing!

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

See [The ChangeLog](https://github.com/nevware21/grunt-plugins/tree/main/ts-plugin/CHANGELOG.md)

