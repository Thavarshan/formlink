import { FormDataConvertible } from './form-data-convertible';

export type RequestPayload = Record<string, FormDataConvertible> | FormData;
