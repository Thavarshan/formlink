# Release Notes

## [Unreleased](https://github.com/Thavarshan/formlink/compare/v1.3.0...HEAD)

## [v1.3.0](https://github.com/Thavarshan/formlink/compare/v1.2.6...v1.3.0) - 2025-05-23

### Added

- **Debug Mode**: Added development-friendly debug mode with automatic detection based on `NODE_ENV`
  
  - Safe environment checks for browser/Node.js compatibility
  - Prefixed debug messages with `[Form Debug]` for easy identification
  - Optional data parameter for detailed debugging output
  
- **Type Guards**: Implemented robust type safety improvements
  
  - `isFile()` type guard with environment safety checks
  - `isBlob()` type guard for better file handling
  - Enhanced cross-platform compatibility for browser and Node.js environments
  
- **Advanced State Management**: Comprehensive form state tracking and reporting
  
  - `getStateSummary()` method for complete form state overview
  - `isState()` method for checking specific form states
  - Enhanced dirty field tracking with granular control
  - Form state enumeration (`FormState.IDLE`, `PROCESSING`, `SUCCESS`, `ERROR`, `CANCELLED`)
  
- **Enhanced Validation System**: Improved validation capabilities
  
  - `validateField()` for individual field validation
  - `validateDirtyFields()` for validating only modified fields
  - Async validation support with proper error handling
  - Better validation error reporting and management
  
- **Input Validation**: Added constructor input validation for better error prevention
  
  - Validates `initialData` parameter to ensure it's a valid object
  - Throws descriptive errors for invalid input
  - Prevents runtime errors from malformed initialization
  
- **Cross-Platform Improvements**: Enhanced compatibility across different environments
  
  - Safe `process` existence checks for browser compatibility
  - Graceful fallbacks for environment-specific APIs
  - Better error handling for different runtime environments
  

### Changed

- **Enhanced Data Cloning**: Improved cloning strategy with performance optimizations
  
  - Uses `structuredClone` when available for better performance
  - Graceful fallback to utility `deepClone` function
  - Separate methods for full data cloning vs. field-level cloning
  - Better handling of complex nested objects and circular references
  
- **FormData Generation**: Enhanced file handling in `toFormData()` method
  
  - Uses new type guards for safer File/Blob detection
  - Better handling of nested objects and arrays
  - Improved FormData key generation for complex structures
  - Enhanced null/undefined value handling
  
- **Form Reset Logic**: Improved reset functionality with better state management
  
  - Enhanced field-specific reset with proper dirty field cleanup
  - Better default value handling and restoration
  - Improved state cleanup after reset operations
  - More reliable form state restoration
  
- **Error Handling**: Significantly improved error management
  
  - DRY error assignment with helper functions
  - Better HTTP status code handling (401, 403, 404, 422, 5xx)
  - Enhanced network error detection and reporting
  - Improved validation error formatting and display
  
- **Resource Management**: Enhanced cleanup and disposal mechanisms
  
  - Better timeout management and cleanup
  - Improved request cancellation handling
  - More thorough resource disposal in `dispose()` method
  - Enhanced memory management for long-running applications
  

### Fixed

- **Constructor Safety**: Fixed potential runtime errors from invalid initialization data
  
  - Added comprehensive input validation
  - Better error messages for debugging
  - Prevents crashes from malformed initial data
  
- **Environment Compatibility**: Resolved cross-platform compatibility issues
  
  - Fixed `process` access in browser environments
  - Better handling of Node.js vs. browser APIs
  - Improved error handling for missing environment features
  
- **File Upload Reliability**: Enhanced file handling robustness
  
  - Better type checking for File and Blob objects
  - Improved error handling for unsupported file types
  - Enhanced FormData generation for complex file structures
  
- **State Consistency**: Fixed various state management edge cases
  
  - Better dirty field tracking consistency
  - Improved form state transitions
  - Enhanced error state management
  - More reliable success/failure state handling
  
- **Memory Leaks**: Addressed potential memory leaks and resource cleanup
  
  - Better timeout cleanup in all scenarios
  - Improved request cancellation handling
  - Enhanced disposal of event listeners and callbacks
  - More thorough cleanup of internal state
  

### Developer Experience

- **Enhanced Documentation**: Comprehensive JSDoc improvements
  
  - Detailed parameter descriptions for all methods
  - Better return type documentation
  - Enhanced usage examples in comments
  - Improved TypeScript intellisense support
  
- **Better Debugging**: Improved development experience
  
  - Debug mode for development environments
  - Better error messages with context
  - Enhanced logging for troubleshooting
  - More descriptive validation error messages
  
- **Improved Tooling**: Enhanced development and build tooling
  
  - Better TypeScript integration
  - Improved linting rules and fixes
  - Enhanced testing capabilities
  - Better IDE support and autocomplete
  

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

- Lodash debounce method not found (#58)

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
