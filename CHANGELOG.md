# Changelog 📝

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/Thavarshan/formlink/compare/v0.0.11...v1.x.x)

## [v0.0.11](https://github.com/Thavarshan/formlink/compare/v0.0.10...v0.0.11) - 17-10-2023

### Added

* Add `getInitial` method to Form

### Changed

* Update dependencies
* Update docblocks to option types and update `package.json`
* Update proxy instance to use lodash when checking for reserved field names

### Fixed

* Fix props being set directly on form client
* Fix all props being set inside data and initial data props of form client

## [v0.0.10](https://github.com/Thavarshan/formlink/compare/v0.0.9...v0.0.10) - 11-10-2023

### Changed

* Update import statements to use proper relative paths
* Export response types and error types from `index.ts`

## [v0.0.9](https://github.com/Thavarshan/formlink/compare/v0.0.6...v0.0.9) - 10-10-2023

### Added

* Add `extractError` private method to Form
* Add `getFirstInputFieldName` private method to Form
* Add `exception` enum
* Add `initialise` private method to Form

### Changed

* Update type hints on `Form` class
* Update http initialise method call priority
* Update README.md with CI badges
* Update error handler to extract error from response

### Fixed

* Fix typo on ErrorResponse interface name

## [v0.0.6](https://github.com/fornlinkjs/fornlink/compare/v0.0.5...v0.0.6) - 09-10-2023

### Changed

* Update set data method and error handler
* Update README.md with more information about how to use with Vue 3 Composition API

## [v0.0.5](https://github.com/fornlinkjs/fornlink/compare/v0.0.4...v0.0.5) - 09-10-2023

### Added

* Add `getIsDirty` method to Form
* Add `setIsDirty` method to Form
* Add `isDirty` property to Form

### Changed

* Update initials data setting mechanism
* Update `allErrors` method to `errors`
* Integrate Axios types into Formlink types

## [v0.0.4](https://github.com/fornlinkjs/fornlink/compare/v0.0.3...v0.0.4) - 08-10-2023

### Changed

* Create proxy instance when Form is instantiated
* Minor method refactors

## [v0.0.3](https://github.com/fornlinkjs/fornlink/compare/v0.0.2...v0.0.3) - 08-10-2023

### Changed

* Update `package.json` with more information about the project
* Update `package.json` with proper export details

## [v0.0.2](https://github.com/fornlinkjs/fornlink/compare/v0.0.1...v0.0.2) - 08-10-2023

### Changed

* Update `README.md` with more information about the project
* Update package description

## v0.0.1 - 08-10-2023

Initial release (alpha)
