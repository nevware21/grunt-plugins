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

        // Configuration to be run (and then tested).
        plugin_ts: {
            default_options: {
                options: {
                },
                files: {
                    'tmp/default_options': ['test/fixtures/testing', 'test/fixtures/123']
                }
            },
            custom_options: {
                options: {
                    separator: ': ',
                    punctuation: ' !!!'
                },
                files: {
                    'tmp/custom_options': ['test/fixtures/testing', 'test/fixtures/123']
                }
            }
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
            "shared_utils": {
                tsconfig: "./shared/tsconfig.json",
                src: [
                    './shared/src/**/*.ts'
                ],
            },
            "ts_plugin": {
                tsconfig: "./ts-plugin/tsconfig.json",
                // src: [
                //     './ts-plugin/src/**/*.ts'
                // ],
                //out: "ts-plugin/tasks/ts.js"
            },
            "eslint_ts_plugin": {
                tsconfig: "./eslint-ts-plugin/tsconfig.json",
                // src: [
                //     './ts-plugin/src/**/*.ts'
                // ],
                //out: "ts-plugin/tasks/ts.js"
            },
        },
        "eslint-ts": {
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
    grunt.loadTasks('tasks');
    grunt.loadNpmTasks("@nevware21/grunt-ts-plugin");
    grunt.loadNpmTasks("@nevware21/grunt-eslint-ts");

     grunt.registerTask("shared_utils", [ "ts:shared_utils" ]);
     grunt.registerTask("ts_plugin", [ "ts:ts_plugin" ]);
     grunt.registerTask("eslint_ts_plugin", [ "ts:eslint_ts_plugin" ]);
    //grunt.registerTask("shared_utils", [ "eslint-ts:shared-fix", "ts:shared_utils" ]);
    //grunt.registerTask("ts_plugin", [ "eslint-ts:ts_plugin-fix", "ts:ts_plugin" ]);
    //grunt.registerTask("eslint_ts_plugin", [ "eslint-ts:eslint_ts-fix", "ts:eslint_ts_plugin" ]);
    grunt.registerTask("lint", [ "eslint-ts:shared", "eslint-ts:ts_plugin", "eslint-ts:eslint_ts" ]);
    grunt.registerTask("lint-fix", [ "eslint-ts:shared-fix", "eslint-ts:ts_plugin-fix", "eslint-ts:eslint_ts-fix" ]);

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    // grunt.registerTask('shared_utils_test', ['clean', 'shared_utils']);
    // grunt.registerTask('ts_plugin_test', ['clean', 'ts_plugin']);
    // grunt.registerTask('eslint_ts_plugin_test', ['clean', 'eslint_ts_plugin']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);
};
