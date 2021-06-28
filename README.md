<h1 align="center">@Nevware21 GruntJS Plugins</h1>

<p align="center">This Monorepo is aimed at providing additional GruntTS support tasks for TypeScript</p>

![GitHub Workflow Status (main)](https://img.shields.io/github/workflow/status/nevware21/grunt-plugins/NodeCI/main)

# Current Plugins

| Plugin | Description | Version
|--------|---------|------------------
| [grunt-ts-plugin](./ts-plugin) | Grunt-ts-plugin is an npm package that provides a TypeScript compilation task for GruntJS build scripts. | [Changelog](./ts-plugin/CHANGELOG.md) <br /> [![npm version](https://badge.fury.io/js/%40nevware21%2Fgrunt-ts-plugin.svg)](https://badge.fury.io/js/%40nevware21%2Fgrunt-ts-plugin) <br /> [![downloads](https://img.shields.io/npm/dm/%40nevware21/grunt-ts-plugin.svg)](https://img.shields.io/npm/dm/%40nevware21/grunt-ts-plugin)
| [grunt-eslint-ts](./eslint-ts-plugin) | Grunt-eslint-ts provides a wrapper for running `eslint` using the `@typescript-eslint` parser for processing TypeScript files. |  [Changelog](./eslint-ts-plugin/CHANGELOG.md)  <br /> [![npm version](https://badge.fury.io/js/%40nevware21%2Fgrunt-eslint-ts.svg)](https://badge.fury.io/js/%40nevware21%2Fgrunt-eslint-ts) <br /> [![downloads](https://img.shields.io/npm/dm/%40nevware21/grunt-eslint-ts.svg)](https://img.shields.io/npm/dm/%40nevware21/grunt-eslint-ts)

Note: These plugins have currently only been tested with the Grunt `1.4.0`.

# Quickstart

## [grunt-ts-plugin](./ts-plugin/README.md)

Install the npm packare: `npm install @nevware21/grunt-ts-plugin --save-dev`

### Required packages

| Package | Descriptpion
|---------|----------------------
| TypeScript | `npm install typescript --save-dev` - if you don't have TypeScript installed in your project, run
| GruntJS | `npm install grunt --save-dev` - if you don't have GruntJS installed in your project
| Grunt-Cli | `npm install grunt-cli --save-dev` - Suggested, if you have never used Grunt on your system

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      options : {
        debug: false
      },
      default: {
        tsconfig: './default/tsconfig.json'
      },
      task1: {
        // Just use the tsconfig
        tsconfig: './task1/tsconfig.json'
      },
      task2: {
        // Use the tsconfig and add the additional src files, you *could* call a function to return
        // a dynamic array with the src files. The task doesn't call the function it expects a string[].
        tsconfig: './task1/tsconfig.json',
        src: [
          './src/**/*.ts'
        ]
      },
      task3: {
        // As with task2, but also concatenate the output into a single file, this is the same as defining
        // the out or outFile paramater in the compileOptions within the tsconfig.json.
        // If you have both outDir in the tsConfig.json and this parameter -- this value will be ignored.
        tsconfig: './task1/tsconfig.json',
        src: [
          './src/**/*.ts'
        ],
        out: './out/task1-dist.js'
      }
    }
  });
  grunt.loadNpmTasks("@nevware21/grunt-ts-plugin");
  grunt.registerTask("default", ["ts"]);
  grunt.registerTask("task1", ["ts:task1"]);
  grunt.registerTask("task2", ["ts:task2"]);
  grunt.registerTask("task3", ["ts:task3"]);
};
```

## [grunt-eslint-ts](./eslint-ts-plugin/README.md)

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

```js
module.exports = function(grunt) {
  grunt.initConfig({
    "eslint-ts": {
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
  grunt.registerTask("lint", [ "eslint-ts:shared", "eslint-ts:ts_plugin", "eslint-ts:eslint_ts" ]);
  grunt.registerTask("lint-fix", [ "eslint-ts:shared-fix", "eslint-ts:ts_plugin-fix", "eslint-ts:eslint_ts-fix" ]);
};
```

## Contributing

Read our [contributing guide](./CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.
