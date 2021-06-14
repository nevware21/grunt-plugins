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
                comments: true
            },
            "shared_utils": {
                tsconfig: "./shared/tsconfig.json",
                src: [
                    './shared/src/**/*.ts'
                ],
            },
            "ts_plugin": {
                tsconfig: "./ts-plugin/tsconfig.json",
                src: [
                    './ts-plugin/src/**/*.ts'
                ],
                //out: "ts-plugin/tasks/ts.js"
            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');
    grunt.loadNpmTasks("@nevware21/grunt-ts-plugin")
    // These plugins provide necessary tasks.
    //grunt.loadTasks("./localtasks/grunt-ts/tasks");
    //grunt.loadTasks("./localtasks2/ts-plugin/tasks");
    //grunt.loadTasks("./ts-plugin/tasks");

    grunt.registerTask("ts_plugin", [ "ts:ts_plugin" ]);
    grunt.registerTask("shared_utils", [ "ts:shared_utils" ]);

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('ts_plugin_test', ['clean', 'ts_plugin', 'nodeunit']);
    grunt.registerTask('shared_utils_test', ['clean', 'shared_utils', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);
};
