import axios, { AxiosInstance, AxiosProgressEvent, AxiosResponse, CancelTokenSource } from 'axios';
import { Form as IForm } from './types/form';
import { NestedFormData } from './types/form-data';
import { FormDataConvertible } from './types/form-data-convertible';
import { FormOptions } from './types/form-options';
import { Method } from './types/method';
import { Progress } from './types/progress';
import { ValidationRules } from './types/validation';
import { ApiValidationError } from './types/error';
import { createFormProxy } from './utils/form-proxy';
import { deepClone } from './utils/deep-clone';
import { getDefaultHeaders, prepareSubmissionData } from './utils/http-helpers';
import { createProgressObject } from './utils/progress-tracker';
import { formatGeneralError, formatValidationErrors } from './utils/error-formatter';
import { createTimeout } from './utils/timeout';

/**
 * The Form class provides a simple way to manage form state and submission.
 * @template TForm - The type of form data.
 */
export class Form<TForm extends NestedFormData<TForm>> implements IForm<TForm> {
  [key: string]: any;
  public data: TForm;
  public errors: Partial<Record<keyof TForm | 'formError', string>> = {};
  public processing = false;
  public progress: Progress | null = null;
  public wasSuccessful = false;
  public recentlySuccessful = false;
  public isDirty = false;
  public rules: ValidationRules<TForm> = {} as ValidationRules<TForm>;

  protected defaults: TForm;
  protected transformCallback: ((data: TForm) => object) | null = null;
  protected cancelTokenSource: CancelTokenSource | null = null;
  protected axiosInstance: AxiosInstance;
  protected timeouts: number[] = [];
  private debounceTimeout: number | null = null;

  /**
   * Create a new form instance.
   * @param {TForm} initialData - The initial form data.
   * @param {AxiosInstance} [axiosInstance=axios] - The Axios instance to use for requests.
   */
  constructor (initialData: TForm, axiosInstance: AxiosInstance = axios) {
    this.data = initialData;
    this.defaults = { ...initialData };
    this.axiosInstance = axiosInstance;

    return createFormProxy(this);
  }

  /**
   * Set a specific error for a form field.
   * @param {keyof TForm} field - The form field.
   * @param {string} message - The error message.
   * @returns {void}
   */
  public setError(field: keyof TForm, message: string): void {
    this.errors[field] = message;
  }

  /**
   * Set multiple errors for the form.
   * @param {Partial<Record<keyof TForm, string>>} errors - The form errors.
   * @returns {void}
   */
  public setErrors(errors: Partial<Record<keyof TForm | 'formError', string>>): void {
    this.errors = errors;
  }

  /**
   * Clear all form errors.
   * @returns {void}
   */
  public clearErrors(): void {
    this.errors = {};
  }

  /**
   * Reset form data to defaults. You can optionally reset specific fields.
   * @param {...(keyof TForm)[]} fields - The fields to reset.
   * @returns {void}
   */
  public reset(...fields: (keyof TForm)[]): void {
    if (fields.length === 0) {
      Object.assign(this.data, deepClone(this.defaults));
    } else {
      fields.forEach((field) => {
        this.data[field] = deepClone(this.defaults[field]);
      });
    }
    this.isDirty = false;
    this.clearErrors();
  }

  /**
   * Set new default values for the form.
   * @param {keyof TForm | Partial<TForm>} [fieldOrFields] - The field or fields to set as defaults.
   * @param {FormDataConvertible} [value] - The value to set for the field.
   * @returns {void}
   */
  public setDefaults(fieldOrFields?: keyof TForm | Partial<TForm>, value?: FormDataConvertible): void {
    if (typeof fieldOrFields === 'undefined') {
      this.defaults = deepClone(this.data);
    } else if (typeof fieldOrFields === 'string') {
      this.defaults = { ...this.defaults, [fieldOrFields]: deepClone(value as TForm[keyof TForm]) };
    } else {
      this.defaults = Object.assign(deepClone(this.defaults), fieldOrFields);
    }
  }

  /**
   * Apply a transformation to the form data before submission.
   * @param {(data: TForm) => object} callback - The transformation callback.
   * @returns {this} The form instance.
   */
  public transform(callback: (data: TForm) => object): this {
    this.transformCallback = callback;
    return this;
  }

  /**
   * Submit the form with the specified method and URL using Axios.
   * @param {Method} method - The HTTP method.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  public async submit(method: Method, url: string, options?: Partial<FormOptions<TForm>>): Promise<void> {
    this.processing = true;
    this.clearErrors();

    this.cancelTokenSource = axios.CancelToken.source();

    try {
      if (options?.onBefore) options.onBefore();

      const dataToSubmit = prepareSubmissionData(this.data, this.transformCallback);

      const response: AxiosResponse = await this.axiosInstance({
        method,
        url,
        data: dataToSubmit,
        cancelToken: this.cancelTokenSource.token,
        headers: getDefaultHeaders(),
        onUploadProgress: (event) => {
          if (event.total) {
            this.updateProgress(event, options);
          }
        }
      });

      this.handleSuccess(response, options);
    } catch (error: unknown) {
      this.handleError(error, options);
    } finally {
      this.processing = false;
      if (options?.onFinish) options.onFinish();
    }
  }

  /**
   * Update the progress based on the Axios progress event.
   * @param {ProgressEvent} event - The Axios progress event.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {void}
   */
  protected updateProgress(event: AxiosProgressEvent, options?: Partial<FormOptions<TForm>>): void {
    if (event.total) {
      this.progress = createProgressObject(event);

      if (options?.onProgress && this.progress) {
        options.onProgress(this.progress);
      }
    }
  }

  /**
   * Handle the success response from the Axios request.
   * @param {AxiosResponse} response - The Axios response object.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {void}
   */
  protected handleSuccess(response: AxiosResponse, options?: Partial<FormOptions<TForm>>): void {
    this.wasSuccessful = true;
    this.isDirty = false;
    this.markRecentlySuccessful();

    if (options?.onSuccess) {
      options.onSuccess(response);
    }
  }

  /**
   * Handle an error response from an Axios request.
   * @param {unknown} error - The error object.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {void}
   */
  protected handleError(error: unknown, options?: Partial<FormOptions<TForm>>): void {
    if (axios.isCancel(error)) {
      // Do not treat cancellation as an error
      return;
    }

    if (axios.isAxiosError(error) && error.response?.status === 422) {
      const validationError = error.response.data as ApiValidationError;
      this.errors = formatValidationErrors(validationError) as Partial<Record<keyof TForm | 'formError', string>>;
    } else {
      this.errors = formatGeneralError(error) as Partial<Record<keyof TForm | 'formError', string>>;
    }

    if (options?.onError) {
      options.onError(this.errors);
    }
  }

  // HTTP method helpers
  /**
   * Submit the form with a GET request.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  public get(url: string, options?: Partial<FormOptions<TForm>>): Promise<void> {
    return this.submit('get', url, options);
  }

  /**
   * Submit the form with a POST request.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  public post(url: string, options?: Partial<FormOptions<TForm>>): Promise<void> {
    return this.submit('post', url, options);
  }

  /**
   * Submit the form with a PUT request.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  public put(url: string, options?: Partial<FormOptions<TForm>>): Promise<void> {
    return this.submit('put', url, options);
  }

  /**
   * Submit the form with a PATCH request.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  public patch(url: string, options?: Partial<FormOptions<TForm>>): Promise<void> {
    return this.submit('patch', url, options);
  }

  /**
   * Submit the form with a DELETE request.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  public delete(url: string, options?: Partial<FormOptions<TForm>>): Promise<void> {
    return this.submit('delete', url, options);
  }

  /**
   * Submit the form with an OPTIONS request.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  public options(url: string, options?: Partial<FormOptions<TForm>>): Promise<void> {
    return this.submit('options', url, options);
  }

  /**
   * Submit the form with the specified method and URL using Axios, debounced.
   * @param {Method} method - The HTTP method.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @param {number} [debounceTime=300] - The debounce time in milliseconds.
   * @returns {void}
   */
  public submitDebounced(
    method: Method,
    url: string,
    options?: Partial<FormOptions<TForm>>,
    debounceTime: number = 300
  ): void {
    if (this.debounceTimeout !== null) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = createTimeout(() => {
      this.submit(method, url, options);
      this.debounceTimeout = null;
    }, debounceTime);
  }

  /**
   * Validate the form data against the defined rules.
   * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the form is valid.
   */
  public async validate(): Promise<boolean> {
    this.clearErrors();

    for (const [field, rules] of Object.entries(this.rules)) {
      if (!rules || rules.length === 0) continue; // Skip fields with no rules

      const value = this.data[field as keyof TForm];

      for (const rule of rules) {
        const isValid = await rule.validate(value);
        if (!isValid) {
          this.errors[field as keyof TForm] = rule.message;
          break;
        }
      }
    }

    return Object.keys(this.errors).length === 0;
  }

  /**
   * Cancel a form submission in progress.
   * @returns {void}
   */
  public cancel(): void {
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel('Form submission canceled.');
    }
    this.processing = false;
    this.progress = null;
  }

  /**
   * Clear all timeouts set by the form.
   * @returns {void}
   */
  protected clearTimeouts(): void {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];

    if (this.debounceTimeout !== null) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
  }

  /**
   * Mark the form as recently successful for a short duration.
   * @param {number} [timeout=2000] - The duration in milliseconds.
   * @returns {void}
   */
  protected markRecentlySuccessful(timeout: number = 2000): void {
    this.recentlySuccessful = true;
    const timeoutId = createTimeout(() => {
      this.recentlySuccessful = false;
    }, timeout);
    this.timeouts.push(timeoutId);
  }

  /**
   * Clear all timeouts and reset the form instance.
   * @returns {void}
   */
  public dispose(): void {
    this.cancel();
    this.clearErrors();
    this.clearTimeouts();

    // Clear all data
    Object.keys(this.data).forEach(key => {
      delete this.data[key as keyof TForm];
    });

    Object.keys(this.defaults).forEach(key => {
      delete this.defaults[key as keyof TForm];
    });

    Object.keys(this).forEach(key => {
      delete this[key];
    });
  }
}
