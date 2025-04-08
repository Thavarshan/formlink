import { ApiValidationError } from '@/types/error';

/**
 * Formats API validation errors into a standardized error object.
 * @param {ApiValidationError} validationError - The validation error from the API.
 * @returns {Record<string, string>} The formatted errors.
 */
export function formatValidationErrors(validationError: ApiValidationError): Record<string, string> {
  return Object.entries(validationError.errors).reduce(
    (acc, [key, messages]) => ({
      ...acc,
      [key]: Array.isArray(messages) ? messages[0] : messages // Use the first error message if it's an array
    }),
    {}
  );
}

/**
 * Formats a general error into a standardized error object.
 * @param {unknown} error - The error object.
 * @returns {Record<string, string>} The formatted error.
 */
export function formatGeneralError(error: unknown): Record<string, string> {
  return {
    formError: error instanceof Error ? error.message : 'An unexpected error occurred'
  };
}
