import { FormDataConvertible } from '@/types/form-data-convertible';
import { RequestPayload } from '@/types/request-payload';
import { hasFiles } from './file';
import { objectToFormData } from './form-data';

/**
 * Retrieves the CSRF token from the document meta tag.
 * @returns {string} The CSRF token.
 */
export function getCsrfToken(): string {
  return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
}

/**
 * Gets default headers for HTTP requests.
 * @returns {Record<string, string>} The headers.
 */
export function getDefaultHeaders(): Record<string, string> {
  return {
    'X-CSRF-TOKEN': getCsrfToken()
  };
}

/**
 * Prepares data for submission based on content type.
 * @param {TForm} data - The form data.
 * @param {((data: TForm) => object) | null} transformCallback - Optional data transformation.
 * @returns {object | FormData} The prepared data for submission.
 */
export function prepareSubmissionData<TForm>(
  data: TForm,
  transformCallback: ((data: TForm) => object) | null
): object | FormData {
  const preprocessedData = transformCallback ? transformCallback(data) : data;

  return hasFiles(data as FormDataConvertible | RequestPayload)
    ? objectToFormData(data as Record<string, FormDataConvertible>)
    : (preprocessedData as object | FormData);
}
