import { describe, it, expect } from 'vitest';
import { guardAgainstReservedFieldName, reservedFieldNames } from '../src/utils/field-name-validator';

describe('guardAgainstReservedFieldName', () => {
  it('should throw an error for reserved field names', () => {
    reservedFieldNames.forEach((fieldName) => {
      expect(() => guardAgainstReservedFieldName(fieldName)).toThrow(
        `The field name "${fieldName}" is reserved and cannot be used in a Form or Errors instance.`,
      );
    });
  });

  it('should not throw an error for non-reserved field names', () => {
    const nonReservedFieldNames = ['customField1', 'customField2', 'customField3'];
    nonReservedFieldNames.forEach((fieldName) => {
      expect(() => guardAgainstReservedFieldName(fieldName)).not.toThrow();
    });
  });
});
