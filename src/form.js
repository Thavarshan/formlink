import { cloneDeep } from 'lodash';
import axios from 'axios';
import { reactive } from 'vue';
/**
 * The Form class provides a simple way to manage form state and submission.
 * @template TForm - The type of form data.
 */
export class Form {
    /**
     * Create a form.
     * @param {TForm} initialData - The initial form data.
     */
    constructor(initialData) {
        this.errors = {};
        this.processing = false;
        this.progress = null;
        this.wasSuccessful = false;
        this.recentlySuccessful = false;
        this.isDirty = false;
        this.transformCallback = null;
        this.cancelTokenSource = null;
        this.defaults = cloneDeep(initialData);
        // Make form state reactive to fit the Vue ecosystem
        this.data = reactive(cloneDeep(initialData));
    }
    /**
     * Set a specific error for a form field.
     * @param {keyof TForm} field - The form field.
     * @param {string} message - The error message.
     * @returns {void}
     */
    setError(field, message) {
        this.errors[field] = message;
    }
    /**
     * Set multiple errors for the form.
     * @param {Partial<Record<keyof TForm, string>>} errors - The form errors.
     * @returns {void}
     */
    setErrors(errors) {
        this.errors = errors;
    }
    /**
     * Clear all form errors.
     * @returns {void}
     */
    clearErrors() {
        this.errors = {};
    }
    /**
     * Reset form data to defaults. You can optionally reset specific fields.
     * @param {...(keyof TForm)[]} fields - The fields to reset.
     * @returns {void}
     */
    reset(...fields) {
        if (fields.length === 0) {
            Object.assign(this.data, cloneDeep(this.defaults));
        }
        else {
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
    setDefaults(fieldOrFields, value) {
        if (typeof fieldOrFields === 'undefined') {
            this.defaults = cloneDeep(this.data);
        }
        else if (typeof fieldOrFields === 'string') {
            this.defaults = { ...this.defaults, [fieldOrFields]: cloneDeep(value) };
        }
        else {
            this.defaults = Object.assign(cloneDeep(this.defaults), fieldOrFields);
        }
    }
    /**
     * Apply a transformation to the form data before submission.
     * @param {(data: TForm) => object} callback - The transformation callback.
     * @returns {this} The form instance.
     */
    transform(callback) {
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
    async submit(method, url, options) {
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
            // Make an Axios request (supports file uploads with FormData)
            const response = await axios({
                method,
                url,
                data: submitData,
                cancelToken: this.cancelTokenSource.token, // Attach the cancel token
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                onUploadProgress: (event) => {
                    if (event.total) {
                        this.progress = {
                            total: event.total,
                            loaded: event.loaded,
                            percentage: Math.round((event.loaded / event.total) * 100),
                            bytes: event.loaded,
                            lengthComputable: event.lengthComputable,
                        };
                        if (options?.onProgress && this.progress) {
                            options.onProgress(this.progress);
                        }
                    }
                },
            });
            // Handle success
            this.wasSuccessful = true;
            this.isDirty = false;
            this.markRecentlySuccessful();
            // Call onSuccess hook if provided
            if (options?.onSuccess) {
                options.onSuccess(response);
            }
        }
        catch (error) {
            if (axios.isCancel(error)) {
                console.log('Form submission canceled');
            }
            else {
                // If it's a Laravel validation error (422), handle it
                if (error.response && error.response.status === 422) {
                    this.errors = error.response.data.errors || {};
                }
                else {
                    this.errors = { formError: 'Submission failed' };
                }
                // Call onError hook if provided
                if (options?.onError) {
                    options.onError(this.errors);
                }
            }
        }
        finally {
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
    get(url, options) {
        return this.submit('get', url, options);
    }
    /**
     * Submit the form with a POST request.
     * @param {string} url - The URL to submit to.
     * @param {Partial<FormOptions<TForm>>} [options] - The form options.
     * @returns {Promise<void>} A promise that resolves when the form is submitted.
     */
    post(url, options) {
        return this.submit('post', url, options);
    }
    /**
     * Submit the form with a PUT request.
     * @param {string} url - The URL to submit to.
     * @param {Partial<FormOptions<TForm>>} [options] - The form options.
     * @returns {Promise<void>} A promise that resolves when the form is submitted.
     */
    put(url, options) {
        return this.submit('put', url, options);
    }
    /**
     * Submit the form with a PATCH request.
     * @param {string} url - The URL to submit to.
     * @param {Partial<FormOptions<TForm>>} [options] - The form options.
     * @returns {Promise<void>} A promise that resolves when the form is submitted.
     */
    patch(url, options) {
        return this.submit('patch', url, options);
    }
    /**
     * Submit the form with a DELETE request.
     * @param {string} url - The URL to submit to.
     * @param {Partial<FormOptions<TForm>>} [options] - The form options.
     * @returns {Promise<void>} A promise that resolves when the form is submitted.
     */
    delete(url, options) {
        return this.submit('delete', url, options);
    }
    /**
     * Submit the form with an OPTIONS request.
     * @param {string} url - The URL to submit to.
     * @param {Partial<FormOptions<TForm>>} [options] - The form options.
     * @returns {Promise<void>} A promise that resolves when the form is submitted.
     */
    options(url, options) {
        return this.submit('options', url, options);
    }
    /**
     * Cancel a form submission in progress.
     * @returns {void}
     */
    cancel() {
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
    markRecentlySuccessful(timeout = 2000) {
        this.recentlySuccessful = true;
        setTimeout(() => {
            this.recentlySuccessful = false;
        }, timeout);
    }
}
