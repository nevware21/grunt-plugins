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