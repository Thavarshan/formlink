import axios, { AxiosInstance, AxiosResponse, CancelTokenSource } from 'axios';
import { cloneDeep, has, includes, set } from 'lodash';
import { Form as IForm } from './types/form';
import { FormDataType } from './types/form-data';
import { FormDataConvertible } from './types/form-data-convertible';
import { FormOptions } from './types/form-options';
import { Method } from './types/method';
import { Progress } from './types/progress';
import { objectToFormData } from './utils/form-data';
import { hasFiles } from './utils/file';
import { reservedFieldNames, guardAgainstReservedFieldName } from './utils/field-name-validator';

/**
 * The Form class provides a simple way to manage form state and submission.
 * @template TForm - The type of form data.
 */
export class Form<TForm extends FormDataType> implements IForm<TForm> {
  [key: string]: any;
  public data: TForm;
  public errors: Partial<Record<keyof TForm | 'formError', string>> = {};
  public processing = false;
  public progress: Progress | null = null;
  public wasSuccessful = false;
  public recentlySuccessful = false;
  public isDirty = false;

  protected defaults: TForm;
  protected transformCallback: ((data: TForm) => object) | null = null;
  protected cancelTokenSource: CancelTokenSource | null = null;
  protected axiosInstance: AxiosInstance;

  /**
   * Create a new form instance.
   * @param {TForm} initialData - The initial form data.
   * @param {AxiosInstance} [axiosInstance=axios] - The Axios instance to use for requests.
   */
  constructor(initialData: TForm, axiosInstance: AxiosInstance = axios) {
    this.data = initialData;
    this.defaults = { ...initialData };
    this.axiosInstance = axiosInstance;

    return new Proxy(this, {
      get(target, key: string) {
        // Check if the property is a method in the class prototype
        const value = Reflect.get(target, key, target);

        if (typeof value === 'function') {
          return value.bind(target);
        }

        // Check if the key exists on the instance
        if (has(target, key)) {
          return target[key];
        }

        // Check if the key exists in the form data
        if (has(target.data, key)) {
          return target.data[key];
        }

        return undefined;
      },
      set(target, key, value) {
        guardAgainstReservedFieldName(key as string);

        if (has(target.data, key) && target.data[key] !== value && !includes(reservedFieldNames, key)) {
          // Store the previous value in defaults before updating
          set(target.defaults, key, target.data[key]);
          // Update the data property
          set(target.data, key, value);
          // Set the isDirty property to true
          target.isDirty = true;
          return true;
        }
        return false;
      }
    });
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
  public setErrors(errors: Partial<Record<keyof TForm, string>>): void {
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
      Object.assign(this.data, cloneDeep(this.defaults));
    } else {
      fields.forEach((field) => {
        this.data[field] = cloneDeep(this.defaults[field]);
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
      this.defaults = cloneDeep(this.data);
    } else if (typeof fieldOrFields === 'string') {
      this.defaults = { ...this.defaults, [fieldOrFields]: cloneDeep(value as TForm[keyof TForm]) };
    } else {
      this.defaults = Object.assign(cloneDeep(this.defaults), fieldOrFields);
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
    const submitData = this.transformCallback ? this.transformCallback(this.data) : this.data;

    // Create a cancel token for the request
    this.cancelTokenSource = axios.CancelToken.source();

    try {
      // Call onBefore hook if provided
      if (options?.onBefore) {
        options.onBefore();
      }

      // Check if the form data contains files
      const dataToSubmit = hasFiles(this.data)
        ? objectToFormData(this.data as Record<string, FormDataConvertible>)
        : submitData;

      // Make an Axios request (supports file uploads with FormData)
      const response: AxiosResponse = await axios({
        method,
        url,
        data: dataToSubmit,
        cancelToken: this.cancelTokenSource.token, // Attach the cancel token
        headers: {
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        },
        onUploadProgress: (event) => {
          if (event.total) {
            this.progress = {
              total: event.total,
              loaded: event.loaded,
              percentage: Math.round((event.loaded / event.total) * 100),
              bytes: event.loaded,
              lengthComputable: event.lengthComputable
            };
            if (options?.onProgress && this.progress) {
              options.onProgress(this.progress);
            }
          }
        }
      });

      // Handle success
      this.wasSuccessful = true;
      this.isDirty = false;
      this.markRecentlySuccessful();

      // Call onSuccess hook if provided
      if (options?.onSuccess) {
        options.onSuccess(response);
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        // Handle cancellation
      } else {
        // If it's a Laravel validation error (422), handle it
        if (error.response && error.response.status === 422) {
          this.errors = error.response.data.errors || {};
        } else {
          this.errors = { formError: 'Submission failed' } as Partial<Record<keyof TForm, string>>;
        }

        // Call onError hook if provided
        if (options?.onError) {
          options.onError(this.errors);
        }
      }
    } finally {
      this.processing = false;

      // Call onFinish hook if provided
      if (options?.onFinish) {
        options.onFinish();
      }
    }
  }

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
   * Mark the form as recently successful for a short duration (e.g., 2 seconds).
   * @param {number} [timeout=2000] - The duration in milliseconds.
   * @returns {void}
   */
  protected markRecentlySuccessful(timeout: number = 2000): void {
    this.recentlySuccessful = true;
    setTimeout(() => {
      this.recentlySuccessful = false;
    }, timeout);
  }
}
