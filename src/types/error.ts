export interface ApiValidationError {
  errors: Record<string, string[]>;
  message: string;
}

export interface FormError {
  message: string;
  field?: string;
  code?: string;
}
