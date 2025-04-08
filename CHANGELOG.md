# Changelog 📝

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/Thavarshan/formlink/compare/v1.2.6...HEAD)

## [v1.2.6](https://github.com/Thavarshan/formlink/compare/v1.2.5...v1.2.6) - 2025-04-08

### Added

- **Utility Abstractions**: Introduced several utility functions to improve modularity and testability:
  
  - `createFormProxy` (moved proxy logic out of class)
  - `deepClone` (replaces internal `deepClone` method)
  - `prepareSubmissionData` (encapsulates data transformation and file handling logic)
  - `getDefaultHeaders` (extracts CSRF token header logic)
  - `createProgressObject` (standardizes upload progress structure)
  - `formatGeneralError` and `formatValidationErrors` (modular error formatting)
  - `createTimeout` (abstracts timeout creation)
  
- **Debounce Time Configuration**: Added optional `debounceTime` parameter to `submitDebounced` method for customizable delay duration.
  

### Changed

- **Proxy Creation**: Replaced inline proxy logic within the constructor with `createFormProxy()` helper.
- **Deep Cloning**: Refactored cloning logic to use the `deepClone()` utility instead of a private method.
- **Data Preparation**: Moved data transformation and file handling into `prepareSubmissionData()`.
- **Header Management**: Extracted CSRF token header logic into `getDefaultHeaders()`.
- **Progress Tracking**: Refactored `updateProgress` to use `createProgressObject()` for standardized formatting.
- **Error Handling**: Replaced inline error formatting with `formatValidationErrors()` and `formatGeneralError()` for better readability and separation of concerns.
- **Timeout Management**: Switched from `window.setTimeout` to `createTimeout()` for better control and consistency.
- **Cleaner Disposal**: Updated `dispose()` to use `Object.keys().forEach()` for better clarity and reliability when clearing object keys.

### Fixed

- **Potential Proxy Redundancy**: Improved property fallback logic by moving proxy logic out, reducing chances of conflicts or duplication.
- **Error Object Casting**: Made error response casting and fallback more robust using type-safe utilities.
- **Form Reset Edge Cases**: Fixed edge case where resetting with specific fields might not deep clone defaults properly.
- **Timeout Cleanup**: Ensured all timeouts (including debounce) are properly cleared in all scenarios, improving memory safety.

## [v1.2.5](https://github.com/Thavarshan/formlink/compare/v1.2.4...v1.2.5) - 2025-04-05

### Changed

- Strip `lodash` and use native JS/TS functions instead

## [v1.2.4](https://github.com/Thavarshan/formlink/compare/v2.0.0...v1.2.4) - 2024-11-15

### Added

- Option to install as Vue plugin

### Fixed

- Laravel validation errors set without input name as key in `errors` object (#59)

## [v2.0.0](https://github.com/Thavarshan/formlink/compare/v1.2.2...v2.0.0) - 2024-11-15

Bumping version to `2.0.0` to avoid version collisions when publishing to `npm` registry.

## [v1.2.2](https://github.com/Thavarshan/formlink/compare/v1.2.1...v1.2.2) - 2024-11-15

### Fixed

- Lodash debounce method not found (#58)

## [v1.2.1](https://github.com/Thavarshan/formlink/compare/v1.2.0...v1.2.1) - 2024-11-15

### Fixed

* Lodash debounce method not found (#58)

## [v1.2.0](https://github.com/Thavarshan/formlink/compare/v1.0.11...v1.2.0) - 2024-10-19

### Added

- **Form Validation**: Introduced a new form validation feature that validates form data based on provided rules before submission, ensuring correct data is sent.- **File Upload Progress Tracking**: Added support for tracking the progress of file uploads during form submission.
- **Debounced Form Submission**: Added support for debounced form submissions, reducing redundant network requests by delaying execution for a specified time.

### Changed

- **Improved Error Handling**: The error handling mechanism has been improved to integrate more effectively with Laravel's backend for validation errors.
- **Dependency Updates**: Project dependencies have been updated to ensure compatibility and performance improvements.

### Fixed

- **Form Error Handling**: Fixed issues where form errors were not being correctly cleared or reset upon new submissions.

## [v1.0.11](https://github.com/Thavarshan/formlink/compare/v0.0.11...v1.0.11) - 2024-10-18

### Added

- Complete code refactor and restructure
- Added support for file upload progress tracking.
- Added handling of Laravel validation error responses within the form.

### Changed

- Updated API to support all common HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- Improved error handling and validation mechanisms to integrate seamlessly with Laravel.
- Updted dependencies

### Fixed

- Fixed CSRF token management for automatic inclusion in form requests.
- Fixed issues where form errors were not being properly cleared or reset upon new submissions.

## [v0.0.11](https://github.com/Thavarshan/formlink/compare/v0.0.10...v0.0.11) - 17-10-2023

### Added

- Add `getInitial` method to Form

### Changed

- Update dependencies
- Update docblocks to option types and update `package.json`
- Update proxy instance to use lodash when checking for reserved field names

### Fixed

- Fix props being set directly on form client
- Fix all props being set inside data and initial data props of form client

## [v0.0.10](https://github.com/Thavarshan/formlink/compare/v0.0.9...v0.0.10) - 11-10-2023

### Changed

- Update import statements to use proper relative paths
- Export response types and error types from `index.ts`

## [v0.0.9](https://github.com/Thavarshan/formlink/compare/v0.0.6...v0.0.9) - 10-10-2023

### Added

- Add `extractError` private method to Form
- Add `getFirstInputFieldName` private method to Form
- Add `exception` enum
- Add `initialise` private method to Form

### Changed

- Update type hints on `Form` class
- Update http initialise method call priority
- Update README.md with CI badges
- Update error handler to extract error from response

### Fixed

- Fix typo on ErrorResponse interface name

## [v0.0.6](https://github.com/fornlinkjs/fornlink/compare/v0.0.5...v0.0.6) - 09-10-2023

### Changed

- Update set data method and error handler
- Update README.md with more information about how to use with Vue 3 Composition API

## [v0.0.5](https://github.com/fornlinkjs/fornlink/compare/v0.0.4...v0.0.5) - 09-10-2023

### Added

- Add `getIsDirty` method to Form
- Add `setIsDirty` method to Form
- Add `isDirty` property to Form

### Changed

- Update initials data setting mechanism
- Update `allErrors` method to `errors`
- Integrate Axios types into Formlink types

## [v0.0.4](https://github.com/fornlinkjs/fornlink/compare/v0.0.3...v0.0.4) - 08-10-2023

### Changed

- Create proxy instance when Form is instantiated
- Minor method refactors

## [v0.0.3](https://github.com/fornlinkjs/fornlink/compare/v0.0.2...v0.0.3) - 08-10-2023

### Changed

- Update `package.json` with more information about the project
- Update `package.json` with proper export details

## [v0.0.2](https://github.com/fornlinkjs/fornlink/compare/v0.0.1...v0.0.2) - 08-10-2023

### Changed

- Update `README.md` with more information about the project
- Update package description

## v0.0.1 - 08-10-2023

Initial release (alpha)
