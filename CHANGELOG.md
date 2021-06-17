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