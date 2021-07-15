<h1 align="center">@Nevware21 grunt-eslint-ts</h1>

![GitHub Workflow Status (main)](https://img.shields.io/github/workflow/status/nevware21/grunt-plugins/NodeCI/main)
[![npm version](https://badge.fury.io/js/%40nevware21%2Fgrunt-eslint-ts.svg)](https://badge.fury.io/js/%40nevware21%2Fgrunt-eslint-ts)
[![downloads](https://img.shields.io/npm/dm/%40nevware21/grunt-eslint-ts.svg)](https://img.shields.io/npm/dm/%40nevware21/grunt-eslint-ts)

Grunt-eslint-ts provides a Grunt-compatible wrapper for running `eslint` using the `@typescript-eslint` parser for processing TypeScript files, and provides some additional options that improves the TypeScript development workflow.

## Grunt-eslint-ts-plugin Features

TBD...

### Unsupported Grunt features

 * [Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping) feature as it is not supported by `tsc` from the command-line
 * Grunt `dest` target property, use the `src` options instead.
 * Grunt `files` property for identifying files to be compiled (*.ts), planned future feature (#18 - [Feature] Add support for Grunt files object)

### Quickstart

Install the npm packare: `npm install @nevware21/grunt-eslint-ts --save-dev`

| Package | Descriptpion
|---------|----------------------
| ESLint | `npm install eslint --save-dev` - if you don't have ESLint installed in your project, run
| @typescript-eslint/eslint-plugin | `npm install @typescript-eslint/eslint-plugin --save-dev` - if you don't have the @typescript plugin installed
| @typescript-eslint/parser | `npm install @typescript-eslint/parser --save-dev` - if you dont have the parser installed
| eslint-plugin-security (Optional) | `npm install eslint-plugin-security --save-dev` - If you want to auto inject the extra security plugin
| TypeScript | `npm install typescript --save-dev` - if you don't have TypeScript installed in your project, run
| GruntJS | `npm install grunt --save-dev` - if you don't have GruntJS installed in your project
| Grunt-Cli | `npm install grunt-cli --save-dev` - Suggested, if you have never used Grunt on your system

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

### Mininimal 

```js
module.exports = function(grunt) {
  grunt.initConfig({
    lint: {
      default : {
        tsconfig: './tsconfig.json'
      }
    }
  });
  grunt.loadNpmTasks("@nevware21/grunt-eslint-ts");
  grunt.registerTask("default", ["lint"]);
};
```

### Options

The options can be specified at the global ```options```, ```task options``` or directly on the ```task``` level, with the task level values overridding any value defined in the global options

#### __Task only level options__

| Name | Type | Description
|------|------|------------
| ignoreFailures | boolean | Ignore failures and continue, useful for initial linting runs for mono-repo's


#### __Common options:__ Global and Task

| Name | Type | Description
|------|------|------------
| parser | IESLintParser | Override the parser and plugin to use, defaults to { plugin: "@typescript-eslint"; name: "@typescript-eslint/parser" }, set to null to block the defaults from getting injected
| additionalConfig | Linter.Config | Additional Config that will be used to override the base Configuration, any additionalConfig will override any defaults
| rules | Linter.RulesRecord | Additional specific rules to pass as overrides
| logOutput | boolean | Log the output (stdout, stderr) of the execute command `eslint` response
| suppressWarnings | boolean | Only include errors in the output
| fix | boolean | Fix all `fixable` errors and warnings
| debug | boolean | Log additional debug messages some are only display with grunt verbose messages enabled
| quiet | boolean | Don't output the report to the console / grunt output
| outputFile | string | Output the results to the provided file
| format | string | Specify the `format` of the eslint report, defaults to `codeframe`
| tsconfig | string | The path to the tsConfig file to use, when specified
| maxWarnings | number | If more than this number of warnings are reported failed the task
| src | string | string[] | A single string or an array of source files to be "added" to the tsconfig as either files or include. When a string it assumes a single entry, there is not encoded list etc.


#### IEsLintParser

| Name | Type | Description
|------|------|------------
| name | string | The name of the parser to use for the eslint configuration, defaults to `@typescript-eslint/parser` if the `@typescript-eslint/parser` package exists in the `node_modules`
| plugins | string \| string[] | The plugin(s) to include for the eslint configuration, defaults to `@typescript-eslint` if the `@typescript-eslint` parser / plugin package exists in the `node_modules`, when the plugin is detected this also injects the `plugin:@typescript-eslint/recommended` rules extension (This may change in a future release to be a configuration).
| parserOptions | Linter.ParserOptions | Additional parser options to apply for the eslint configuration


### eslint-plugin-security

When the `eslint-plugin-security` package is detected in the `node_modules` this will be automatically injected into the eslint configuration during linting with the `plugin:security/recommended` rules.
(This may change in a future release to be a configuration)


**Example showing some option combinations**

```js
module.exports = function(grunt) {
  grunt.initConfig({
    "lint": {
        options: {
            format: "codeframe",
            suppressWarnings: false
        },
        "shared": {
            tsconfig: "./shared/tsconfig.json",
            ignoreFailures: true,
            src: [
                // Adds extra source files above those listed in the tsconfig.json
                './shared/src/**/*.ts'
            ]
        },
        "ts_plugin": {
            tsconfig: "./ts-plugin/tsconfig.json",
            ignoreFailures: true
        },
        "eslint_ts": {
            tsconfig: "./eslint-ts-plugin/tsconfig.json",
            ignoreFailures: true
        },
        "shared-fix": {
            // You can specify the options, either in an options object like there or directly in the task
            // definition like those above
            options: {
                tsconfig: "./shared/tsconfig.json",
                fix: true,
                src: [
                    './shared/src/**/*.ts'
                ]                
            }
        },
        "ts_plugin-fix": {
            options: {
                tsconfig: "./ts-plugin/tsconfig.json",
                fix: true
            }
        },
        "eslint_ts-fix": {
            options: {
                tsconfig: "./eslint-ts-plugin/tsconfig.json",
                fix: true,
            }
        }
    }
  });

  grunt.loadNpmTasks("@nevware21/grunt-eslint-ts");
  grunt.registerTask("dolint", [ "lint:shared", "lint:ts_plugin", "lint:eslint_ts" ]);
  grunt.registerTask("lint-fix", [ "lint:shared-fix", "lint:ts_plugin-fix", "lint:eslint_ts-fix" ]);
};
```

Version 0.1.0 used a taskname of ```eslint-ts```, while 0.2.0 changes the primary taskname to ```lint``` but includes an alias task ```eslint-ts``` for backward compatibility. Will likely be removed prior to v1.0.0.

## Contributing

Read our [contributing guide](https://github.com/nevware21/grunt-plugins/blob/main/CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.

## Release History

See [The ChangeLog](https://github.com/nevware21/grunt-plugins/tree/main/eslint-ts-plugin/CHANGELOG.md)
