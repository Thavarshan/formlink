import { FormDataConvertible } from '../types/form-data-convertible';

/**
 * Checks if the given value is an instance of FormData.
 * @param value - The value to check.
 * @returns True if the value is FormData, otherwise false.
 */
export const isFormData = (value: unknown): value is FormData => value instanceof FormData;

/**
 * Converts an object to FormData.
 * @param source - The source object to convert.
 * @param form - The FormData instance to append to.
 * @param parentKey - The parent key for nested objects.
 * @returns The FormData instance with appended values.
 */
export function objectToFormData(
  source: Record<string, FormDataConvertible> = {},
  form: FormData = new FormData(),
  parentKey: string | null = null,
): FormData {
  for (const [key, value] of Object.entries(source)) {
    append(form, composeKey(parentKey, key), value);
  }
  return form;
}

/**
 * Composes a key for nested objects.
 * @param parent - The parent key.
 * @param key - The current key.
 * @returns The composed key.
 */
function composeKey(parent: string | null, key: string): string {
  return parent ? `${parent}[${key}]` : key;
}

/**
 * Appends a value to the FormData instance.
 * @param form - The FormData instance.
 * @param key - The key to append.
 * @param value - The value to append.
 */
function append(form: FormData, key: string, value: FormDataConvertible): void {
  switch (true) {
    case Array.isArray(value):
      value.forEach((item, index) => append(form, composeKey(key, index.toString()), item));
      break;
    case value instanceof Date:
      form.append(key, value.toISOString());
      break;
    case value instanceof File:
      form.append(key, value, value.name);
      break;
    case value instanceof Blob:
      form.append(key, value);
      break;
    case typeof value === 'boolean':
      form.append(key, value ? '1' : '0');
      break;
    case typeof value === 'string' || typeof value === 'number':
      form.append(key, value.toString());
      break;
    case value === null || value === undefined:
      form.append(key, '');
      break;
    case typeof value === 'object':
      objectToFormData(value, form, key);
      break;
    default:
      throw new TypeError(`Unsupported value type: ${typeof value} for key: ${key}`);
  }
}
