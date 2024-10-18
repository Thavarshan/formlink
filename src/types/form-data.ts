import { FormDataConvertible } from './form-data-convertible';

export type FormDataType = Record<string, FormDataConvertible>;

export type NestedFormData<T> = {
  [K in keyof T]: T[K] extends object
  ? NestedFormData<T[K]>
  : T[K] extends File | File[] | null
  ? T[K]
  : FormDataConvertible;
};
