export interface ValidationRule {
  validate: (value: any) => boolean | Promise<boolean>;
  message: string;
}

export type ValidationRules<T extends object = any> = {
  [key in keyof T | string]: Array<ValidationRule>;
};
