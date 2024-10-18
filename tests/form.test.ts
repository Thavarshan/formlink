import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Form } from '../src/form';
import { FormDataType } from '../src/types/form-data';
import { Method } from '../src/types/method';

interface TestFormData extends FormDataType {
  name: string;
  email: string;
}

describe('Form', () => {
  let form: Form<TestFormData>;
  let mock: MockAdapter;

  beforeEach(() => {
    form = new Form<TestFormData>({ name: '', email: '' });
    mock = new MockAdapter(axios);
    // Mock the CSRF token meta tag
    document.head.innerHTML = '<meta name="csrf-token" content="test-csrf-token">';
  });

  afterEach(() => {
    mock.restore();
    document.head.innerHTML = ''; // Clean up the mocked CSRF token
  });

  it('should initialize with default values', () => {
    expect(form.name).toBe('');
    expect(form.email).toBe('');
    expect(form.errors).toEqual({});
    expect(form.processing).toBe(false);
    expect(form.progress).toBeNull();
    expect(form.recentlySuccessful).toBe(false);
    expect(form.isDirty).toBe(false); // Updated expectation
  });

  it('should set and get form data', () => {
    form.name = 'John Doe';
    form.email = 'john@example.com';
    expect(form.name).toBe('John Doe');
    expect(form.email).toBe('john@example.com');
    expect(form.data).toEqual({ name: 'John Doe', email: 'john@example.com' });
  });

  it('should set and get form errors', () => {
    form.setError('name', 'Name is required');
    expect(form.errors).toEqual({ name: 'Name is required' });
    form.setErrors({ email: 'Email is invalid' });
    expect(form.errors).toEqual({ email: 'Email is invalid' });
  });

  it('should clear form errors', () => {
    form.setErrors({ name: 'Name is required', email: 'Email is invalid' });
    form.clearErrors();
    expect(form.errors).toEqual({});
  });

  it('should reset form data to defaults', () => {
    form.name = 'John Doe';
    form.email = 'john@example.com';
    form.reset();
    expect(form.name).toBe('');
    expect(form.email).toBe('');
  });

  it('should reset specific fields to defaults', () => {
    form.name = 'John Doe';
    form.email = 'john@example.com';
    form.reset('name');
    expect(form.name).toBe('');
    expect(form.email).toBe('john@example.com');
  });

  it('should set new default values', () => {
    form.name = 'John Doe';
    form.setDefaults();
    form.reset();
    expect(form.name).toBe('John Doe');
  });

  it('should apply a transformation to the form data before submission', () => {
    form.transform((data) => ({ ...data, name: data.name.toUpperCase() }));
    form.name = 'John Doe';
    expect(form.name).toBe('John Doe');
    expect(form['transformCallback']!(form.data)).toEqual({ name: 'JOHN DOE', email: '' });
  });

  it('should submit the form successfully', async () => {
    const response = { data: 'success' };
    mock.onPost('/submit').reply(200, response);

    const onBefore = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onFinish = vi.fn();

    await form.submit('post' as Method, '/submit', { onBefore, onSuccess, onError, onFinish });

    expect(onBefore).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        data: response,
      }),
    );
    expect(onError).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
    expect(form.recentlySuccessful).toBe(true);
  });

  it('should handle form submission errors', async () => {
    const errorResponse = { errors: { name: 'Name is required' } };
    mock.onPost('/submit').reply(422, errorResponse);

    const onBefore = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onFinish = vi.fn();

    await form.submit('post' as Method, '/submit', { onBefore, onSuccess, onError, onFinish });

    expect(onBefore).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith({ name: 'Name is required' });
    expect(onFinish).toHaveBeenCalled();
    expect(form.errors).toEqual({ name: 'Name is required' });
  });

  it('should cancel a form submission', async () => {
    mock.onPost('/submit').reply(
      () =>
        new Promise((resolve, reject) => {
          setTimeout(() => reject({ message: 'Form submission canceled', __CANCEL__: true }), 100);
        }),
    );

    const onBefore = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onFinish = vi.fn();

    form.submit('post' as Method, '/submit', { onBefore, onSuccess, onError, onFinish });
    form.cancel();

    await new Promise((resolve) => setTimeout(resolve, 200)); // Wait for the mock to resolve

    expect(onBefore).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
    expect(form.processing).toBe(false);
    expect(form.progress).toBeNull();
  });

  it('should submit the form with a GET request', async () => {
    const response = { data: 'success' };
    mock.onGet('/submit').reply(200, response);

    const onBefore = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onFinish = vi.fn();

    await form.get('/submit', { onBefore, onSuccess, onError, onFinish });

    expect(onBefore).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        data: response,
      }),
    );
    expect(onError).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
    expect(form.recentlySuccessful).toBe(true);
  });

  it('should submit the form with a POST request', async () => {
    const response = { data: 'success' };
    mock.onPost('/submit').reply(200, response);

    const onBefore = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onFinish = vi.fn();

    await form.post('/submit', { onBefore, onSuccess, onError, onFinish });

    expect(onBefore).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        data: response,
      }),
    );
    expect(onError).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
    expect(form.recentlySuccessful).toBe(true);
  });

  it('should submit the form with a PUT request', async () => {
    const response = { data: 'success' };
    mock.onPut('/submit').reply(200, response);

    const onBefore = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onFinish = vi.fn();

    await form.put('/submit', { onBefore, onSuccess, onError, onFinish });

    expect(onBefore).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        data: response,
      }),
    );
    expect(onError).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
    expect(form.recentlySuccessful).toBe(true);
  });

  it('should submit the form with a PATCH request', async () => {
    const response = { data: 'success' };
    mock.onPatch('/submit').reply(200, response);

    const onBefore = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onFinish = vi.fn();

    await form.patch('/submit', { onBefore, onSuccess, onError, onFinish });

    expect(onBefore).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        data: response,
      }),
    );
    expect(onError).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
    expect(form.recentlySuccessful).toBe(true);
  });

  it('should submit the form with a DELETE request', async () => {
    const response = { data: 'success' };
    mock.onDelete('/submit').reply(200, response);

    const onBefore = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onFinish = vi.fn();

    await form.delete('/submit', { onBefore, onSuccess, onError, onFinish });

    expect(onBefore).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        data: response,
      }),
    );
    expect(onError).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
    expect(form.recentlySuccessful).toBe(true);
  });

  it('should submit the form with an OPTIONS request', async () => {
    const response = { data: 'success' };
    mock.onOptions('/submit').reply(200, response);

    const onBefore = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onFinish = vi.fn();

    await form.options('/submit', { onBefore, onSuccess, onError, onFinish });

    expect(onBefore).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        data: response,
      }),
    );
    expect(onError).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
    expect(form.recentlySuccessful).toBe(true);
  });
});
