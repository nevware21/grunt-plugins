# v0.5.1 (Sept 2nd, 2024)

## Changelog

- #272 [BUG] TsConfig file resolution ignores include if there is also a file node present
  - Now merges `files` and `include` from the tsconfig
  - Added more debug logging

# v0.5.0 (July 21st, 2024)

## Changelog

- #44 [Feature] Add support to inlining the tsconfig.json within the grunt config
- #254 [Feature] Add Support for multiple tsconfigs
- #259 Bump @nevware21 gunt plugins to latest

# v0.4.6 (July 4th, 2024)

## Changelog

- Update build script to support release automation (#258)
- #15 [Work Item] ts-plugin: Add test coverage
- Bump @types/estree from 0.0.51 to 0.0.52
- Bump @nevware21/ts-utils from 0.1.1 to 0.2.0 (#106)
- Bump @nevware21/ts-utils from 0.1.1 to 0.2.0 in /shared; /ts-plugin and /eslint-ts-plugin (#108)
- Bump @nevware21/ts-utils from 0.2.0 to 0.3.0 (#113)
- Update ts-utils to v0.3.0 (#115)
  - Update rush to 5.75.0
  - Update npm to 8.15.0
- Update ts-utils; npm and rush versions (#124)
- Bump @rollup/plugin-node-resolve from 13.3.0 to 14.1.0 (#135)
- Update ts-utils to 0.5.0 (#151)
- Bump @nevware21/ts-utils from 0.5.0 to 0.6.0 (#174)
- Bump @rollup/plugin-commonjs from 22.0.2 to 23.0.3 (#175)
  - Bump rush to 5.86.0
  - Bump npm to 8.19.3
  - Add node 18 to CI tests
- Bump @rollup/plugin-json from 4.1.0 to 5.0.2 (#176)
- Bump @rollup/plugin-commonjs from 23.0.7 to 24.0.0 (#184)
- Bump typescript to 4.9.4 (#189)
- Bump @microsoft/rush to 5.88.0
- Bump rollup to 3.8.1
- Bump @rollup/plugin-commonjs to 24.0.0
- Bump @rollup/plugin-node-resolve to 15.0.1
- Bump @rollup/plugin-json to 6.0.0
- Bump @typescript-esline/esline-plugin to 5.47.0
- Bump @typescript-esline/parser tp 5.47.0
- Bump @types/eslint to 8.4.10
- Bump @types/estree to 1.0.0
- Bump @nevware/ts-utils to 0.7.0 (#195)
- Update img.shields.io build status URL's (#196)
- Update to use ts-async and update to latest versions (#197)
- Bump @rollup/plugin-commonjs from 24.1.0 to 25.0.0 (#207)
  - Bump @types/estree from 0.0.52 to 1.0.1
- Bump @typescript-eslint/eslint-plugin from 5.62.0 to 6.1.0 (#210)
- Bump rollup from 3.29.4 to 4.6.0 (#225)
 - Bump rush from 5.82.1 to 5.112.0
- Update actions (#227)
- [Work Item] ts-plugin: Add test coverage #15 (#226)
- Update Copyright message to conform with LLC operating agreement (#248)
  - Fix compile issues
- Bump @typescript-eslint/parser from 6.21.0 to 7.14.1 (#249)
- Bump nyc from 15.1.0 to 17.0.0 (#250)
- Bump @nevware21/ts-utils from 0.11.1 to 0.11.3 (#251)
- Bump @nevware21/ts-async from 0.5.0 to 0.5.2
- Bump @microsoft/rush from 5,112.0 to 5.129.6 (#252)
- Bump chai from 4.3.6 to 4.4.1 (#253)
- Bump mocha from 10.0.0 to 10.5.2
- Bump sinon from 15.0.0 to 18.0.0
- Fix issue with temp files not getting deleted (#256)

# v0.4.5 (May 30th, 2022)

## Changelog

- [BUG] Latest versions grunt-ts-plugin-0.4.4 and grunt-eslint-ts-0.2.3 sometimes complain about missing @nevware21/ts-utils #97

# v0.4.4

## Changelog

- Update Dependencies
- Consume @nevware21/ts-utils for common functions

# v0.4.3

## Changelog

- #51 (Fix #2) [BUG] ts-plugin v0.4.1 Failing with only external non-emit-preventing errors
  - Reworked the way that detected / parsed errors are handled and counted
  - Also fixes simular issues related to using an onError() handler that where also getting ignored.

# v0.4.2

## Changelog

- #51 [BUG] ts-plugin v0.4.1 Failing with only external non-emit-preventing errors

# v0.4.1

## Changelog

- #48 [BUG] tsplugin does not fail when both type and external type errors are detected

# v0.4.0

## Changelog

- Use updated tsconfig.json to handle (ignore) included comments and trailing comma after last element for an object
- Add ```outDir``` option on the task for setting tsc destination
- Add ```keepTemp``` option for additional debugging

# v0.3.0

## Changelog

- Rework TSConfig.Json handling
  - Add support for project containing single and multiline comments
  - Use common (Shared) handling for processing tsconfig.json for eslint-ts and ts-plugin
- Fixed bug with ```failOnTypeErrors``` and ```additionalFlags``` not getting inherited from default options
- Changed default for ```failOnTypeErrors``` to true and added exclusion for external (node_modules/) packages
- Added ```failOnExternalTypeErrors``` to handle type failures from external (node_modules/) packages, defaulting to false.
- Add ESLint tasks
- Fix linting issues
- Reworked options handling and logging
- Wrap grunt and provide common logging handling

# v0.2.2

## Changelog

- #5 [BUG] ts-plugin v0.2.1 throws with the 'src' property passed from grunt is a string
- #10 [BUG] v0.2.1 - rootDir and temp tsconfig are not being calculated correctly
  - Reworked the way files are include into the tsconfig.json file -- now using relative paths
- Updated additionalArgs logic to ensure that any passed arguments take precedence over the internally calculated versions '--out', '--outFile' etc
- Added some version checks

# v0.2.1

## Changelog

- #5 [BUG] v0.2.0 - Compile fails when the tsconfig.json contains "outFile" option

# v0.2.0

## Changelog

- Add additional features
  - Support for ```src``` and ```out``` properties on the task to assist with migrating from [grunt-ts](https://www.npmjs.com/package/grunt-ts). Note: Not all of the grunt-ts features are supported and the generation approach is slightly different.
  - Add an ```onError``` task callback to allow project driven pass / fail based on specific TypeScript errors.
  
# v0.1.0

## Changelog

- Initial Basic usable version
  - Added detection and work-around for _invalid_ ```rootDir``` and ```declarationDir``` settings in the tsconfig.json that assume the grunt working directory rather than the location of the tsconfig.conf as the real project rootDir. This was used for previous users of the ```grunt-ts``` plugin.
  
# v0.0.1

## Changelog

- Self bootstrapping version