import { FormDataType } from './form-data';
import { FormDataConvertible } from './form-data-convertible';
import { FormOptions } from './form-options';
import { Method } from './method';
import { Progress } from './progress';

/**
 * Interface for the Form class.
 * @template TForm - The type of form data.
 */
export interface Form<TForm extends FormDataType> extends Record<string, unknown> {
  /**
   * The current form data.
   */
  [key: string]: any;
  readonly data: TForm;

  /**
   * The form errors.
   */
  errors: Partial<Record<keyof TForm | 'formError', string>>;

  /**
   * Indicates if the form is being processed.
   */
  processing: boolean;

  /**
   * The progress of the form submission.
   */
  progress: Progress | null;

  /**
   * Indicates if the form was successful.
   */
  wasSuccessful: boolean;

  /**
   * Indicates if the form was recently successful.
   */
  recentlySuccessful: boolean;

  /**
   * Indicates if the form is dirty (has unsaved changes).
   */
  isDirty: boolean;

  /**
   * Set a specific error for a form field.
   * @param {keyof TForm} field - The form field.
   * @param {string} message - The error message.
   * @returns {void}
   */
  setError(field: keyof TForm, message: string): void;

  /**
   * Set multiple errors for the form.
   * @param {Partial<Record<keyof TForm, string>>} errors - The form errors.
   * @returns {void}
   */
  setErrors(errors: Partial<Record<keyof TForm, string>>): void;

  /**
   * Clear all form errors.
   * @returns {void}
   */
  clearErrors(): void;

  /**
   * Reset form data to defaults. Optionally reset specific fields.
   * @param {...(keyof TForm)[]} fields - The fields to reset.
   * @returns {void}
   */
  reset(...fields: (keyof TForm)[]): void;

  /**
   * Set new default values for the form.
   * @param {keyof TForm | Partial<TForm>} [fieldOrFields] - The field or fields to set as defaults.
   * @param {FormDataConvertible} [value] - The value to set for the field.
   * @returns {void}
   */
  setDefaults(fieldOrFields?: keyof TForm | Partial<TForm>, value?: FormDataConvertible): void;

  /**
   * Apply a transformation to the form data before submission.
   * @param {(data: TForm) => object} callback - The transformation callback.
   * @returns {this} The form instance.
   */
  transform(callback: (data: TForm) => object): this;

  /**
   * Submit the form with the specified method and URL using Axios.
   * @param {Method} method - The HTTP method.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  submit(method: Method, url: string, options?: Partial<FormOptions<TForm>>): Promise<void>;

  /**
   * Submit the form with a GET request.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  get(url: string, options?: Partial<FormOptions<TForm>>): Promise<void>;

  /**
   * Submit the form with a POST request.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  post(url: string, options?: Partial<FormOptions<TForm>>): Promise<void>;

  /**
   * Submit the form with a PUT request.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  put(url: string, options?: Partial<FormOptions<TForm>>): Promise<void>;

  /**
   * Submit the form with a PATCH request.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  patch(url: string, options?: Partial<FormOptions<TForm>>): Promise<void>;

  /**
   * Submit the form with a DELETE request.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  delete(url: string, options?: Partial<FormOptions<TForm>>): Promise<void>;

  /**
   * Submit the form with an OPTIONS request.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  options(url: string, options?: Partial<FormOptions<TForm>>): Promise<void>;

  /**
   * Cancel a form submission in progress.
   * @returns {void}
   */
  cancel(): void;
}
