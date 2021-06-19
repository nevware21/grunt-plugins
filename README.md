<h1 align="center">@Nevware21 GruntJS Plugins</h1>

<p align="center">This Monorepo is aimed at providing additional GruntTS support tasks for TypeScript</p>

# Current Plugins

| Plugin | Description
|--------|------------------
| [grunt-ts-plugin](https://github.com/nevware21/grunt-plugins/tree/main/ts-plugin) | Grunt-ts-plugin is an npm package that provides a TypeScript compilation task for GruntJS build scripts.
| grunt-eslint-ts-plugin | Coming soon


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

## grunt-eslint-ts-plugin

... Coming Soon ...

## Contributing

Read our [contributing guide](./CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.

## Release History

_(Nothing yet)_
