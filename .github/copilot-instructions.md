# @Nevware21 GruntJS Plugins Monorepo

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

@Nevware21 GruntJS Plugins is a Rush monorepo containing TypeScript/GruntJS plugins for TypeScript compilation and ESLint integration. The repository uses Microsoft Rush for monorepo management with 3 packages: shared utilities, grunt-ts-plugin, and grunt-eslint-ts.

## Working Effectively

### Bootstrap and Setup
- Clone repository: `git clone https://github.com/nevware21/grunt-plugins.git`
- Navigate to repository: `cd grunt-plugins`
- Install dependencies: `npm install` -- takes 2-3 minutes. NEVER CANCEL. Set timeout to 5+ minutes.
  - The initial `npm install` may show SHA-256 signature warnings due to local versions in shrink-wrap
  - Post-install automatically runs `rush update --full` which takes additional time
  - Rush will show "phantom node_modules folder" warnings - this is expected
- Verify setup: `npm run check` -- takes seconds, verifies dependency consistency

### Key Commands  
- Check dependencies: `npm run check` -- fast validation (seconds)
- Update dependencies: `npm run rupdate` or `rush update --recheck --purge --full` -- takes 1-2 minutes
- Clean rebuild: `npm run clean` -- removes all artifacts and reinstalls, takes 3-4 minutes total
- Build attempt: `npm run build` -- **CURRENTLY FAILS due to TypeScript compilation errors**
- Test attempt: `npm run test` -- **CURRENTLY FAILS due to grunt dependency issues**
- Lint attempt: `npm run lint` -- **CURRENTLY FAILS due to missing tslint dependency**

### Important Limitations  
- **BUILD CURRENTLY BROKEN**: `npm run build` fails with TypeScript errors related to Node.js disposable symbols and @types/node compatibility
- **TESTS NOT WORKING**: Both npm and CONTRIBUTING.md confirm tests are currently not working  
- **LINTING BROKEN**: `npm run lint` fails because tslint is not found (tslint is deprecated, repository needs migration to ESLint)
- **Phantom node_modules warnings**: Rush consistently warns about phantom node_modules folder - this is a known issue
- **Grunt dependency issues**: Individual packages cannot run grunt commands independently due to Rush monorepo structure

### Working Around Build Issues
- Use `npm run check` to verify dependency health before making changes
- Use `npm run lint` to check code style
- Build failures are expected - focus on TypeScript compilation fixes if attempting to resolve
- The CI workflow in `.github/workflows/ci.yml` expects 10-minute build timeouts, indicating builds are slow when working

## Repository Structure

### Monorepo Organization
```
├── shared/                    # @nevware21/grunt-plugins-shared-utils
├── ts-plugin/                # @nevware21/grunt-ts-plugin  
├── eslint-ts-plugin/         # @nevware21/grunt-eslint-ts
├── common/                   # Rush configuration and scripts
├── gruntfile.js              # Root Grunt configuration
└── .github/workflows/        # CI/CD workflows
```

### Key Files
- `rush.json` - Rush monorepo configuration
- `gruntfile.js` - Grunt tasks for shared_utils, ts_plugin, eslint_ts_plugin
- `common/config/rush/command-line.json` - Rush custom commands
- `CONTRIBUTING.md` - Setup instructions (with known issues noted)
- `README.md` - Plugin usage examples

### Package Dependencies
- **shared**: Common utilities used by both plugins
- **ts-plugin**: Depends on shared, provides TypeScript compilation for Grunt
- **eslint-ts-plugin**: Depends on shared, provides ESLint TypeScript integration

## Development Workflow

### Making Changes
1. Always run `npm run check` before starting work
2. Make changes in the appropriate package directory (shared/, ts-plugin/, eslint-ts-plugin/)
3. Run `npm run lint` to check code style
4. **Note**: Full build validation is currently not possible due to build issues
5. For dependency changes: run `npm run rupdate` before building

### Validation Commands
- **CRITICAL**: Build, test, and lint are all currently broken due to dependency issues
- **ONLY WORKING VALIDATION**: `npm run check` - Dependency consistency check (seconds)
- `npm run lint` - **FAILS**: tslint not found (tslint deprecated, needs ESLint migration)
- `npm run test` - **FAILS**: grunt dependency issues  
- `npm run build` - **FAILS**: TypeScript compilation errors

### Working Around Current Issues
- Use `npm run check` to verify dependency health before making changes
- For code validation, use external tools like `npx eslint .` or `npx tsc --noEmit` if needed
- Focus on dependency management rather than build validation
- The repository needs significant maintenance to resolve grunt/tslint/TypeScript compatibility issues

### CI/CD Information
- GitHub Actions CI runs on Node.js 16, 18, 20
- CI timeout for builds: 10 minutes (indicating expected long build times)
- CI follows pattern: `rush update --full` → `npm install` → `npm run check` → `npm run build --verbose`

## Common Tasks

### Repository Root Contents
```
.eslintrc
.git/
.github/
.gitignore
.jshintrc
CHANGELOG.md
CONTRIBUTING.md
LICENSE
README.md
common/
eslint-ts-plugin/
gruntfile.js
package.json
rush.json
shared/
ts-plugin/
```

### Package.json Scripts (Root)
```json
{
  "build": "node common/scripts/install-run-rush.js rebuild --verbose",
  "test": "node common/scripts/install-run-rush.js test --verbose", 
  "lint": "node common/scripts/install-run-rush.js dolint --verbose",
  "check": "node common/scripts/install-run-rush.js check",
  "rupdate": "rush update --recheck --full",
  "clean": "git clean -xdf && npm install"
}
```

### Known Working vs Broken Commands
**WORKING:**
- `npm install` (2-3 minutes) 
- `npm run check` (seconds)
- `npm run rupdate` (1-2 minutes)
- `npm run clean` (3-4 minutes)

**BROKEN/LIMITED:**
- `npm run build` - TypeScript compilation errors with Node.js disposable symbols
- `npm run test` - Grunt dependency path issues, confirmed "Currently not working"
- `npm run lint` - Missing tslint dependency (tslint is deprecated)
- Individual grunt commands in subdirectories - Rush manages dependencies, paths not configured correctly

### Timing Expectations
- **Initial setup**: 2-3 minutes for `npm install`
- **Dependency updates**: 1-2 minutes for `npm run rupdate`
- **Clean rebuild**: 3-4 minutes for `npm run clean`
- **Validation**: Seconds for `npm run check`
- **Build attempts**: Expect failures due to current TypeScript issues

## Important Notes
- **NEVER CANCEL** long-running npm install or rush update commands - they take 2-5 minutes
- Always remove phantom node_modules folder if Rush warns about it: `rm -rf node_modules`
- The repository has significant maintenance debt with TypeScript/Node.js types, tslint deprecation, and grunt path issues
- **For coding agents**: Focus on dependency validation (`npm run check`) rather than builds
- Check `.github/workflows/ci.yml` for the CI build process which may work in different environments
- When making changes, validate TypeScript syntax with external tools: `npx tsc --noEmit`
- Consider using external linting: `npx eslint . --ext .ts,.js` 

## Manual Validation Scenarios
Since automated build/test/lint are broken, use these manual validation approaches:

### After Making TypeScript Changes:
1. Run `npm run check` to verify dependencies
2. Use `npx tsc --noEmit` to check TypeScript compilation 
3. Use `npx eslint . --ext .ts` for code style validation
4. Test plugin functionality by creating a minimal test Gruntfile

### After Dependency Changes:
1. Run `npm run rupdate` to update Rush dependencies
2. Run `npm run check` to verify consistency
3. Check if `common/config/rush/npm-shrinkwrap.json` updated correctly

### For Plugin Development:
1. Test grunt-ts-plugin: Create a test project with tsconfig.json and verify compilation
2. Test grunt-eslint-ts: Create a test project with .eslintrc and verify linting
3. Both plugins should work independently even though the monorepo build is broken

## Release Process

All releases follow a standard process. **The commit/PR title must always follow this format**:

```
[Release] Increase version to X.Y.Z
```

### Files to Update for a Release

When creating a release for version `X.Y.Z`, update **all** of the following files:

1. **`package.json`** (root) — bump the `"version"` field to `X.Y.Z`
2. **`shared/package.json`** — bump the `"version"` field to `X.Y.Z`
3. **`ts-plugin/package.json`** — bump the `"version"` field to `X.Y.Z` **and** update the `"@nevware21/grunt-plugins-shared-utils"` devDependency to `X.Y.Z`
4. **`eslint-ts-plugin/package.json`** — bump the `"version"` field to `X.Y.Z` **and** update the `"@nevware21/grunt-plugins-shared-utils"` devDependency to `X.Y.Z`
5. **`ts-plugin/CHANGELOG.md`** — add a new version section (see format below)
6. **`eslint-ts-plugin/CHANGELOG.md`** — add a new version section (see format below)
7. **`README.md`** (root) — update any reference to the recommended/tested plugin version to `X.Y.Z`
8. **`common/config/rush/npm-shrinkwrap.json`** — run `npm run rupdate` after version bumps so Rush regenerates this file

### CHANGELOG Format

Each CHANGELOG file (`ts-plugin/CHANGELOG.md`, `eslint-ts-plugin/CHANGELOG.md`) follows this structure:

```markdown
# Unreleased

## Changelog

(items added here after the release for the next version)

# vX.Y.Z (Month Dth, YYYY)

## Changelog

- <significant change 1>
- <significant change 2>
- ...

[Full Release Details](https://github.com/nevware21/grunt-plugins/releases/tag/vX.Y.Z)

# vX.Y.(Z-1) ...
```

**Rules for updating the CHANGELOG:**

- **Prepend** the new version section above all existing version sections
- **Include only significant changes** in the new version section — you do not need to list every minor dependency bump. Group minor dependency bumps into a single summary line (e.g., `Multiple dependency updates (@types/node, @rollup components, and others)`)
- **Always add a `[Full Release Details]` link** at the bottom of the new version's changelog section, pointing to the GitHub release tag: `https://github.com/nevware21/grunt-plugins/releases/tag/vX.Y.Z`
- **Preserve the `# Unreleased` section** — if the CHANGELOG already has a `# Unreleased` section with listed items, include those items as-is in the new version's section. Do **not** remove or reduce them. After the release, leave a fresh empty `# Unreleased` section at the top for future changes.

### Release Tags

GitHub releases are tagged separately for each publishable package:
- `ts-plugin-X.Y.Z` for `@nevware21/grunt-ts-plugin` (e.g., `ts-plugin-0.5.2`)
- `eslint-ts-X.Y.Z` for `@nevware21/grunt-eslint-ts` (e.g., `eslint-ts-0.5.2`)

The `[Full Release Details]` link added to each package CHANGELOG conventionally uses the `vX.Y.Z` format (e.g., `https://github.com/nevware21/grunt-plugins/releases/tag/v0.5.2`) as a shared reference for the version, even though the per-package GitHub release tags use the `ts-plugin-X.Y.Z` / `eslint-ts-X.Y.Z` naming scheme.

### Packages Published

Only two packages are published to npm (per `rush.json` `shouldPublish: true`):
- `@nevware21/grunt-ts-plugin` (`ts-plugin/`)
- `@nevware21/grunt-eslint-ts` (`eslint-ts-plugin/`)

The shared utils package (`shared/`) has `shouldPublish: false` and is not published independently.
