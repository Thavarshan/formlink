import axios, { AxiosInstance, AxiosProgressEvent, AxiosResponse, CancelTokenSource, AxiosError } from 'axios';
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
import { FormState } from './enum/form';
import { TimeoutManager } from './timeout-manager';

/**
 * The Form class provides a comprehensive solution for managing form state, validation, and submission in a TypeScript application.
 * It supports dirty field tracking, error handling, progress tracking, and integrates with Axios for HTTP requests.
 *
 * @template TForm - The type of the form data, extending NestedFormData for deep structure support.
 */
export class Form<TForm extends NestedFormData<TForm>> implements IForm<TForm> {
  /**
   * The current form data.
   */
  public data: TForm;
  /**
   * Errors for each field or the form as a whole.
   */
  public errors: Partial<Record<keyof TForm | 'formError', string>> = {};
  /**
   * Indicates if the form is currently processing a submission.
   */
  public processing = false;
  /**
   * Progress information for file uploads or long requests.
   */
  public progress: Progress | null = null;
  /**
   * Indicates if the last submission was successful.
   */
  public wasSuccessful = false;
  /**
   * Indicates if the form was recently successful (for UI feedback).
   */
  public recentlySuccessful = false;
  /**
   * Indicates if any field in the form has been modified.
   */
  public isDirty = false;
  /**
   * Validation rules for each field.
   */
  public rules: ValidationRules<TForm> = {} as ValidationRules<TForm>;
  /**
   * The current state of the form (idle, processing, error, etc.).
   */
  public state: FormState = FormState.IDLE;

  /**
   * Default values for the form, used for resetting.
   */
  protected defaults: TForm;
  /**
   * Optional callback to transform data before submission.
   */
  protected transformCallback: ((data: TForm) => object) | null = null;
  /**
   * Axios cancel token for aborting requests.
   */
  protected cancelTokenSource: CancelTokenSource | null = null;
  /**
   * Axios instance used for HTTP requests.
   */
  protected axiosInstance: AxiosInstance;
  /**
   * Timeout manager for debouncing and UI feedback.
   */
  protected timeoutManager = new TimeoutManager();
  /**
   * Tracks which fields have been modified (dirty).
   */
  private dirtyFields = new Set<keyof TForm>();

  /**
   * Type guard to check if a value is a File.
   */
  private isFile(value: unknown): value is File {
    return typeof File !== 'undefined' && value instanceof File;
  }

  /**
   * Type guard to check if a value is a Blob.
   */
  private isBlob(value: unknown): value is Blob {
    return typeof Blob !== 'undefined' && value instanceof Blob;
  }

  /**
   * Create a new form instance.
   * @param {TForm} initialData - The initial form data.
   * @param {AxiosInstance} [axiosInstance=axios] - The Axios instance to use for requests.
   * @returns {Form<TForm>} A proxied form instance for reactivity.
   */
  constructor(initialData: TForm, axiosInstance: AxiosInstance = axios) {
    if (!initialData || typeof initialData !== 'object') {
      throw new Error('initialData must be a valid object');
    }
    this.data = initialData;
    this.defaults = this.deepCloneData(initialData);
    this.axiosInstance = axiosInstance;

    // Return a proxy to enable reactivity and field tracking
    return createFormProxy(this);
  }

  /**
   * Deep clone data using structuredClone if available, fallback to deepClone utility
   * @param {TForm} data - The data to clone
   * @returns {TForm} The cloned data
   */
  private deepCloneData(data: TForm): TForm {
    // Use structuredClone if available and is a function
    if (typeof globalThis.structuredClone === 'function') {
      try {
        return globalThis.structuredClone(data);
      } catch {
        // Fallback to utility function
        return deepClone(data);
      }
    }
    return deepClone(data);
  }

  /**
   * Mark a field as dirty (modified).
   * @param {keyof TForm} field - The field to mark as dirty
   * @returns {void}
   */
  public markFieldDirty(field: keyof TForm): void {
    this.dirtyFields.add(field);
    this.isDirty = true;
  }

  /**
   * Check if a field is dirty (has been modified).
   * @param {keyof TForm} field - The field to check
   * @returns {boolean} Whether the field is dirty
   */
  public isFieldDirty(field: keyof TForm): boolean {
    return this.dirtyFields.has(field);
  }

  /**
   * Get all dirty fields.
   * @returns {Set<keyof TForm>} Set of dirty fields
   */
  public getDirtyFields(): Set<keyof TForm> {
    return new Set(this.dirtyFields);
  }

  /**
   * Clear dirty field tracking.
   * @returns {void}
   */
  public clearDirtyFields(): void {
    this.dirtyFields.clear();
    this.isDirty = false;
  }

  /**
   * Set a specific error for a form field or the form as a whole.
   * @param {keyof TForm | 'formError'} field - The form field or 'formError'.
   * @param {string} message - The error message.
   * @returns {void}
   */
  public setError(field: keyof TForm | 'formError', message: string): void {
    this.errors[field] = message;
  }

  /**
   * Set multiple errors for the form.
   * @param {Partial<Record<keyof TForm | 'formError', string>>} errors - The form errors.
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
   * Clear error for a specific field.
   * @param {keyof TForm | 'formError'} field - The field to clear error for.
   * @returns {void}
   */
  public clearError(field: keyof TForm | 'formError'): void {
    delete this.errors[field];
  }

  /**
   * Check if the form has any errors.
   * @returns {boolean} Whether the form has errors
   */
  public hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  /**
   * Check if a specific field has an error.
   * @param {keyof TForm | 'formError'} field - The field to check.
   * @returns {boolean} Whether the field has an error
   */
  public hasError(field: keyof TForm | 'formError'): boolean {
    return field in this.errors && !!this.errors[field];
  }

  /**
   * Get error message for a specific field.
   * @param {keyof TForm | 'formError'} field - The field to get error for.
   * @returns {string | undefined} The error message
   */
  public getError(field: keyof TForm | 'formError'): string | undefined {
    return this.errors[field];
  }

  /**
   * Reset form data to defaults. You can optionally reset specific fields.
   * @param {...(keyof TForm)[]} fields - The fields to reset.
   * @returns {void}
   */
  public reset(...fields: (keyof TForm)[]): void {
    if (fields.length === 0) {
      // Replace the data object reference for full reset
      this.data = this.deepCloneData(this.defaults);
      this.clearDirtyFields();
    } else {
      fields.forEach((field) => {
        // Use deepClone for field-level (single value) clone
        this.data[field] = deepClone(this.defaults[field]);
        this.dirtyFields.delete(field);
      });
      this.isDirty = this.dirtyFields.size > 0;
    }
    this.clearErrors();
    this.state = FormState.IDLE;
    this.wasSuccessful = false;
    this.recentlySuccessful = false;
  }

  /**
   * Set new default values for the form.
   * @param {keyof TForm | Partial<TForm>} [fieldOrFields] - The field or fields to set as defaults.
   * @param {FormDataConvertible} [value] - The value to set for the field.
   * @returns {void}
   */
  public setDefaults(fieldOrFields?: keyof TForm | Partial<TForm>, value?: FormDataConvertible): void {
    if (typeof fieldOrFields === 'undefined') {
      this.defaults = this.deepCloneData(this.data);
    } else if (typeof fieldOrFields === 'string') {
      // Use deepClone for field-level (single value) clone
      this.defaults = { ...this.defaults, [fieldOrFields]: deepClone(value as TForm[keyof TForm]) };
    } else {
      // Use deepClone for partials
      const partial = deepClone(fieldOrFields) as Partial<TForm>;
      this.defaults = { ...this.deepCloneData(this.defaults), ...partial };
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
   * Handles progress, error, and success callbacks.
   * @param {Method} method - The HTTP method.
   * @param {string} url - The URL to submit to.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {Promise<void>} A promise that resolves when the form is submitted.
   */
  public async submit(method: Method, url: string, options?: Partial<FormOptions<TForm>>): Promise<void> {
    this.processing = true;
    this.state = FormState.PROCESSING;
    this.clearErrors();

    this.cancelTokenSource = axios.CancelToken.source();

    try {
      if (options?.onBefore) options.onBefore();

      // Prepare data for submission, applying any transformation
      const dataToSubmit = prepareSubmissionData(this.data, this.transformCallback);

      interface SubmitRequestConfig {
        method: Method;
        url: string;
        data: object | FormData;
        cancelToken: CancelTokenSource['token'];
        headers: Record<string, string>;
        onUploadProgress: (event: AxiosProgressEvent) => void;
      }

      const requestConfig: SubmitRequestConfig = {
        method,
        url,
        data: dataToSubmit,
        cancelToken: this.cancelTokenSource.token,
        headers: getDefaultHeaders(),
        onUploadProgress: (event: AxiosProgressEvent): void => {
          if (event.total) {
            this.updateProgress(event, options);
          }
        }
      };

      // Perform the HTTP request
      const response: AxiosResponse = await this.axiosInstance(requestConfig);

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
   * @param {AxiosProgressEvent} event - The Axios progress event.
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
    this.state = FormState.SUCCESS;
    this.clearDirtyFields();
    this.markRecentlySuccessful();

    if (options?.onSuccess) {
      options.onSuccess(response);
    }
  }

  /**
   * Handle an error response from an Axios request.
   * Sets appropriate error messages based on error type and status code.
   * @param {unknown} error - The error object.
   * @param {Partial<FormOptions<TForm>>} [options] - The form options.
   * @returns {void}
   */
  protected handleError(error: unknown, options?: Partial<FormOptions<TForm>>): void {
    if (axios.isCancel(error)) {
      this.state = FormState.CANCELLED;
      return;
    }

    this.state = FormState.ERROR;

    // DRY up error assignment
    const setFormError = (msg: string) => {
      this.errors = { formError: msg } as Partial<Record<keyof TForm | 'formError', string>>;
    };

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      if (!axiosError.response) {
        setFormError('Network error. Please check your connection and try again.');
      } else if (status === 422) {
        const validationError = axiosError.response.data as ApiValidationError;
        this.errors = formatValidationErrors(validationError) as Partial<Record<keyof TForm | 'formError', string>>;
      } else if (status === 404) {
        setFormError('The requested resource was not found.');
      } else if (status === 403) {
        setFormError('You do not have permission to perform this action.');
      } else if (status === 401) {
        setFormError('Authentication required. Please log in and try again.');
      } else if (status && status >= 500) {
        setFormError('Server error. Please try again later.');
      } else {
        setFormError(`Server returned an error (${status ?? 'unknown'}). Please try again.`);
      }
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
   * Useful for autosave or live validation scenarios.
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
    this.timeoutManager.set(
      'debounce',
      () => {
        this.submit(method, url, options);
      },
      debounceTime
    );
  }

  /**
   * Validate a specific field against its defined rules.
   * @param {keyof TForm} field - The field to validate.
   * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the field is valid.
   */
  public async validateField(field: keyof TForm): Promise<boolean> {
    const rules = this.rules[field];
    if (!rules?.length) return true;

    // Clear existing error for this field
    this.clearError(field);

    const value = this.data[field];
    for (const rule of rules) {
      try {
        const isValid = await rule.validate(value);
        if (!isValid) {
          this.setError(field, rule.message);
          return false;
        }
      } catch {
        this.setError(field, 'Validation error occurred');
        return false;
      }
    }
    return true;
  }

  /**
   * Validate only the dirty fields against their defined rules.
   * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if all dirty fields are valid.
   */
  public async validateDirtyFields(): Promise<boolean> {
    let isValid = true;

    for (const field of this.dirtyFields) {
      const fieldValid = await this.validateField(field);
      if (!fieldValid) {
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Validate the form data against the defined rules.
   * @param {boolean} [onlyDirty=false] - Whether to validate only dirty fields.
   * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the form is valid.
   */
  public async validate(onlyDirty: boolean = false): Promise<boolean> {
    if (onlyDirty) {
      return this.validateDirtyFields();
    }

    this.clearErrors();
    let isValid = true;

    for (const [field, rules] of Object.entries(this.rules)) {
      if (!rules || rules.length === 0) continue;

      const fieldValid = await this.validateField(field as keyof TForm);
      if (!fieldValid) {
        isValid = false;
      }
    }

    return isValid;
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
    this.state = FormState.CANCELLED;
  }

  /**
   * Mark the form as recently successful for a short duration (for UI feedback).
   * @param {number} [timeout=2000] - The duration in milliseconds.
   * @returns {void}
   */
  protected markRecentlySuccessful(timeout: number = 2000): void {
    this.recentlySuccessful = true;
    this.timeoutManager.set(
      'recentlySuccessful',
      () => {
        this.recentlySuccessful = false;
      },
      timeout
    );
  }

  /**
   * Serialize form data to JSON string.
   * @param {boolean} [includeDefaults=false] - Whether to include default values.
   * @returns {string} JSON string representation of form data.
   */
  public toJSON(includeDefaults: boolean = false): string {
    const data = includeDefaults ? { data: this.data, defaults: this.defaults } : this.data;
    return JSON.stringify(data);
  }

  /**
   * Convert form data to FormData object for file uploads.
   * Handles nested objects and arrays.
   * @returns {FormData} FormData object containing form data.
   */
  public toFormData(): FormData {
    const formData = new FormData();

    // Recursively append data to FormData
    const appendToFormData = (data: any, parentKey: string = ''): void => {
      if (data === undefined || data === null) return; // skip undefined/null
      if (this.isFile(data) || this.isBlob(data)) {
        if (parentKey) formData.append(parentKey, data);
      } else if (Array.isArray(data)) {
        data.forEach((item, index) => {
          appendToFormData(item, `${parentKey}[${index}]`);
        });
      } else if (typeof data === 'object' && data !== null) {
        Object.keys(data).forEach((key) => {
          const value = data[key];
          const formKey = parentKey ? `${parentKey}[${key}]` : key;
          appendToFormData(value, formKey);
        });
      } else if (parentKey) {
        formData.append(parentKey, String(data));
      }
    };

    appendToFormData(this.data);
    return formData;
  }

  /**
   * Load form data from JSON string.
   * Optionally set as defaults.
   * @param {string} json - JSON string to parse.
   * @param {boolean} [setAsDefaults=false] - Whether to also set as default values.
   * @returns {void}
   */
  public fromJSON(json: string, setAsDefaults: boolean = false): void {
    try {
      const parsed = JSON.parse(json);
      this.data = parsed.data || parsed;

      if (setAsDefaults) {
        this.defaults = this.deepCloneData(this.data);
      }

      this.clearDirtyFields();
      this.clearErrors();
    } catch {
      throw new Error('Invalid JSON provided to fromJSON method');
    }
  }

  /**
   * Check if the form is in a specific state.
   * @param {FormState} state - The state to check.
   * @returns {boolean} Whether the form is in the specified state.
   */
  public isState(state: FormState): boolean {
    return this.state === state;
  }

  /**
   * Get a summary of the form's current state for UI or debugging.
   * @returns {object} Form state summary.
   */
  public getStateSummary(): {
    state: FormState;
    hasErrors: boolean;
    errorCount: number;
    isDirty: boolean;
    dirtyFieldCount: number;
    processing: boolean;
    wasSuccessful: boolean;
    recentlySuccessful: boolean;
    } {
    return {
      state: this.state,
      hasErrors: this.hasErrors(),
      errorCount: Object.keys(this.errors).length,
      isDirty: this.isDirty,
      dirtyFieldCount: this.dirtyFields.size,
      processing: this.processing,
      wasSuccessful: this.wasSuccessful,
      recentlySuccessful: this.recentlySuccessful
    };
  }

  /**
   * Clean up and dispose of the form instance.
   * Cancels any pending requests and resets all state.
   * @returns {void}
   */
  public dispose(): void {
    this.cancel();
    this.clearErrors();
    this.timeoutManager.clearAll();

    // Reset to clean state instead of deleting properties
    this.data = {} as TForm;
    this.defaults = {} as TForm;
    this.transformCallback = null;
    this.dirtyFields.clear();
    this.rules = {} as ValidationRules<TForm>;
    this.state = FormState.IDLE;
    this.processing = false;
    this.wasSuccessful = false;
    this.recentlySuccessful = false;
    this.isDirty = false;
    this.progress = null;
  }
}
// End of Form class implementation
