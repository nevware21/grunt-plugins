/*
 * grunt-plugin-ts
 * https://github.com/nevware21/grunt-plugin-ts
 *
 * Copyright (c) 2021 Nevware21
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        },
        ts: {
            options: {
                debug: true,
                logOutput: true,
                additionalFlags: "--removeComments"
            },
            "shared": {
                tsconfig: "./shared/tsconfig.json",
                src: [
                    './shared/src/**/*.ts'
                ],
            },
            "shared-test": {
                tsconfig: "./shared/test/tsconfig.test.json",
                src: [
                    './shared/test/src/**/*.ts'
                ],
            },
            "ts_plugin": {
                tsconfig: "./ts-plugin/tsconfig.json",
                outDir: "ts-plugin/dist-esm"
            },
            "eslint_ts_plugin": {
                tsconfig: "./eslint-ts-plugin/tsconfig.json",
                // src: [
                //     './ts-plugin/src/**/*.ts'
                // ],
                //out: "ts-plugin/tasks/ts.js"
            },
        },
        "lint": {
            options: {
                format: "codeframe",
                suppressWarnings: false
            },
            "shared": {
                tsconfig: "./shared/tsconfig.json",
                ignoreFailures: true,
                src: [
                    './shared/src/**/*.ts'
                ]
            },
            "shared-test": {
                tsconfig: "./shared/test/tsconfig.test.json",
                ignoreFailures: true
            },
            "shared-test-fix": {
                options: {
                    tsconfig: "./shared/test/tsconfig.test.json",
                    fix: true
                }
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

    // Actually load this plugin's task(s).
    grunt.loadNpmTasks("@nevware21/grunt-ts-plugin");
    grunt.loadNpmTasks("@nevware21/grunt-eslint-ts");

    grunt.registerTask("shared_utils", [ "lint:shared-fix", "ts:shared" ]);
    grunt.registerTask("ts_plugin", [ "lint:ts_plugin-fix", "ts:ts_plugin" ]);
    grunt.registerTask("eslint_ts_plugin", [ "lint:eslint_ts-fix", "ts:eslint_ts_plugin" ]);
    grunt.registerTask("dolint", [ "lint:shared", "lint:ts_plugin", "lint:eslint_ts" ]);
    grunt.registerTask("lint-fix", [ "lint:shared-fix", "lint:ts_plugin-fix", "lint:eslint_ts-fix" ]);

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('shared_utils-test', [ "lint:shared-test-fix", "ts:shared-test" ]);
    // grunt.registerTask('ts_plugin_test', ['clean', 'ts_plugin']);
    // grunt.registerTask('eslint_ts_plugin_test', ['clean', 'eslint_ts_plugin']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);
};
