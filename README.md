<h1 align="center">@Nevware21 GruntJS Plugins</h1>

<p align="center">This Monorepo is aimed at providing additional GruntTS support tasks for TypeScript</p>

# Current Plugins

| Plugin | Description
|--------|------------------
| [grunt-ts-plugin](https://github.com/nevware21/grunt-plugins/tree/main/ts-plugin) | Grunt-ts-plugin is an npm package that provides a TypeScript compilation task for GruntJS build scripts.
| grunt-eslint-ts-plugin | Coming soon


Note: These plugins have currently only been tested with the Grunt `1.4.0`.

# Quickstart

## grunt-ts-plugin

`npm install @nevware21/grunt-ts-plugin --save-dev`

As this is a development only tool if only needs to be intalled into your root project (if you have a mono-repo) and only as a ```devDependency```

To install `@nevware21/grunt-ts-plugin`, you must already have installed TypeScript and GruntJS.
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

## grunt-eslint-ts-plugin

... Coming Soon ...

## Contributing

Thank you for your interest in contributing!

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

_(Nothing yet)_
