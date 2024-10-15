import { describe, it, expect, beforeEach } from 'vitest';
import { reactive, isReactive } from 'vue';
import { useForm } from '../src/use-form';
import { Form } from '../src/form';

interface TestFormData {
  name: string;
  email: string;
}

describe('useForm', () => {
  let initialData: TestFormData;

  beforeEach(() => {
    initialData = { name: '', email: '' };
  });

  it('should create a reactive form instance', () => {
    const form = useForm(initialData);
    expect(isReactive(form)).toBe(true);
  });

  it('should initialize with default values', () => {
    const form = useForm(initialData);
    expect(form.data).toEqual({ name: '', email: '' });
    expect(form.errors).toEqual({});
    expect(form.processing).toBe(false);
    expect(form.progress).toBeNull();
    expect(form.recentlySuccessful).toBe(false);
    expect(form.isDirty).toBe(false);
  });

  it('should set and get form data', () => {
    const form = useForm(initialData);
    form.data.name = 'John Doe';
    form.data.email = 'john@example.com';
    expect(form.data).toEqual({ name: 'John Doe', email: 'john@example.com' });
  });

  it('should set and get form errors', () => {
    const form = useForm(initialData);
    form.setError('name', 'Name is required');
    expect(form.errors).toEqual({ name: 'Name is required' });
    form.setErrors({ email: 'Email is invalid' });
    expect(form.errors).toEqual({ email: 'Email is invalid' });
  });

  it('should clear form errors', () => {
    const form = useForm(initialData);
    form.setErrors({ name: 'Name is required', email: 'Email is invalid' });
    form.clearErrors();
    expect(form.errors).toEqual({});
  });

  it('should reset form data to defaults', () => {
    const form = useForm(initialData);
    form.data.name = 'John Doe';
    form.data.email = 'john@example.com';
    form.reset();
    expect(form.data).toEqual({ name: '', email: '' });
  });

  it('should reset specific fields to defaults', () => {
    const form = useForm(initialData);
    form.data.name = 'John Doe';
    form.data.email = 'john@example.com';
    form.reset('name');
    expect(form.data).toEqual({ name: '', email: 'john@example.com' });
  });

  it('should set new default values', () => {
    const form = useForm(initialData);
    form.data.name = 'John Doe';
    form.setDefaults();
    form.reset();
    expect(form.data).toEqual({ name: 'John Doe', email: '' });
  });

  it('should apply a transformation to the form data before submission', () => {
    const form = useForm(initialData);
    form.transform((data) => ({ ...data, name: data.name.toUpperCase() }));
    form.data.name = 'John Doe';
    expect(form.data.name).toBe('John Doe');
    expect(form['transformCallback']!(form.data)).toEqual({ name: 'JOHN DOE', email: '' });
  });
});
