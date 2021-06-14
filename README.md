<h1 align="center">@Nevware21 GruntJS Plugins</h1>

<p align="center">This Monorepo is aimed at providing additional GruntTS support tasks for TypeScript</p>

## Getting Started

These plugins have currently only been tested with the Grunt `1.4.0`.

# TypeScript Compilation Task for GruntJS

## grunt-ts-plugin

Grunt-ts-plugin is an npm package that handles TypeScript compilation work in GruntJS build scripts.

Grunt-ts-plugin provides a Grunt-compatible wrapper for the `tsc` command-line compiler using the ```--project``` switch to compile existing TypeScript projects files (tsconfig.json), and provides some [additional functionality](#grunt-ts-gruntfilejs-options) that improves the TypeScript development workflow.

The plugin itself is both written and compiled using [TypeScript](./ts-plugin/src/ts-plugin.ts) and it also uses itself to compile via grunt.

Unlike other plugins (such as [grunt-ts](https://www.npmjs.com/package/grunt-ts), this plugin focuses on providing support for using your existing TypeScript project files (tsconfig.json) rather than exposing all of the command-line options of the tsc compiler. However, it does provide the capability to pass additional command-line options via the [additionalFlags](#additionalflags) option.

 As a consequence of this it does NOT support the use of all standard GruntJS functionality such as the use of the `files` object, etc.

## Grunt-ts-plugin Features

 * Supports TypeScript Projects via [tsconfig.json](#tsconfig) via the ```tsc --project``` option.
 * Allows the developer to [select a custom TypeScript compiler version](#compiler) for their project, or even use a custom (in-house) version.

### Unsupported Grunt features

 * Identifying files to be compiled (*.ts) via the use of the `files` object or globbing, etc.
 * [Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping) feature as it is not supported by `tsc` from the command-line

### Support for tsc Switches

Grunt-ts provides explicit support for most `tsc` switches.  Any arbitrary switches can be passed to `tsc` via the [additionalFlags](#additionalflags) feature.

### Quickstart

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
  grunt.loadNpmTasks("grunt-ts-plugin");
  grunt.registerTask("default", ["ts"]);
};
```

### Options

| Name | Type | Description
|------|------|------------
| debug | Boolean<br/>Defaults: False | Log additional debug messages as verbose grunt messages
| additionalFlags | String<br />Default: Empty String | Pass in additional flags to the tsc compiler (added to the end of the command line)
| failOnTypeErrors | Boolean<br/>Defaults: False | Should the compile run fail when type errors are identified
| tscPath | String<br>Defaults: reverse scan from project path for node_modules/typescript/bin folder | Identify the root path of the version of the TypeScript is installed, this may include be either the root folder of where the node_modules/typescript/bin folder is located or the location of the command-line version of tsc.
| [compiler](#compiler) | String<br/ >Defaults: to "tsc" within the located or defined tscPath | Identify the complete path to the command line version of tsc


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
            debug:false,   // Override the default defined in the options
            tsconfig: "./ts-plugin/tsconfig.json"
        }
    }
  });

  grunt.loadNpmTasks("grunt-ts-plugin");
  grunt.registerTask("ts_plugin", [ "ts:ts_plugin" ]);
  grunt.registerTask("shared_utils", [ "ts:shared_utils" ]);
};
```

## Contributing

Thank you for your interest in contributing!

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
