import { Form } from '@/form';
import { NestedFormData } from '@/types/form-data';
import { hasOwnProperty, keyExistsIn } from './object-helpers';
import { guardAgainstReservedFieldName } from './field-name-validator';
import { FormDataConvertible } from '@/types/form-data-convertible';

/**
 * Creates a proxy for the form instance to allow for dynamic property access.
 * @param {Form<TForm>} instance - The form instance.
 * @returns {Form<TForm>} The proxied form instance.
 */
export function createFormProxy<TForm extends NestedFormData<TForm>>(instance: Form<TForm>): Form<TForm> {
  return new Proxy(instance, {
    get(target, key: string) {
      // Check if the key exists in the form data first (most common case)
      if (keyExistsIn(target.data, key)) {
        return target.data[key as keyof TForm];
      }

      // Check if the property is a method in the class prototype
      const value = Reflect.get(target, key, target);

      if (typeof value === 'function') {
        return value.bind(target);
      }

      // Check if the key exists on the instance itself
      if (keyExistsIn(target, key)) {
        return target[key];
      }

      return undefined;
    },
    set(target, key, value) {
      if (hasOwnProperty(target, key)) {
        target[key as string] = value;
        return true;
      }

      guardAgainstReservedFieldName(key as string);

      if (keyExistsIn(target.data, key) &&
        typeof key === 'string' &&
        key in target.data &&
        target.data[key as keyof TForm] !== value) {
        target.setDefaults(key as keyof TForm, target.data[key as keyof TForm] as FormDataConvertible);
        target.data[key as keyof TForm] = value;
        target.isDirty = true;
        return true;
      }

      // Default action if it's a form-level field
      if (keyExistsIn(target, key)) {
        target[key as string] = value;
        return true;
      }

      return false;
    }
  });
}
