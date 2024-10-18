import { FormDataConvertible } from '../types/form-data-convertible';
import { RequestPayload } from '../types/request-payload';

/**
 * Checks if the provided data contains any files.
 * @param {RequestPayload | FormDataConvertible} data - The data to check.
 * @returns {boolean} True if the data contains files, otherwise false.
 */
export function hasFiles(data: RequestPayload | FormDataConvertible): boolean {
  if (data instanceof File || data instanceof Blob) {
    return true;
  }

  if (data instanceof FileList) {
    return data.length > 0;
  }

  if (data instanceof FormData) {
    for (const [, value] of (data as any).entries()) {
      if (hasFiles(value)) {
        return true;
      }
    }
    return false;
  }

  if (typeof data === 'object' && data !== null) {
    for (const value of Object.values(data)) {
      if (hasFiles(value)) {
        return true;
      }
    }
    return false;
  }

  return false;
}
