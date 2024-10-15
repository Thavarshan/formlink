import { describe, it, expect } from 'vitest';
import { isFormData, objectToFormData } from '../src/utils/form-data';

describe('isFormData', () => {
  it('should return true for FormData instances', () => {
    const formData = new FormData();
    expect(isFormData(formData)).toBe(true);
  });

  it('should return false for non-FormData instances', () => {
    expect(isFormData({})).toBe(false);
    expect(isFormData(null)).toBe(false);
    expect(isFormData(undefined)).toBe(false);
    expect(isFormData('string')).toBe(false);
    expect(isFormData(123)).toBe(false);
  });
});

describe('objectToFormData', () => {
  it('should convert a simple object to FormData', () => {
    const source = { name: 'John', age: 30 };
    const formData = objectToFormData(source);
    expect(formData.get('name')).toBe('John');
    expect(formData.get('age')).toBe('30');
  });

  it('should handle nested objects', () => {
    const source = { user: { name: 'John', age: 30 } };
    const formData = objectToFormData(source);
    expect(formData.get('user[name]')).toBe('John');
    expect(formData.get('user[age]')).toBe('30');
  });

  it('should handle arrays', () => {
    const source = { items: ['item1', 'item2'] };
    const formData = objectToFormData(source);
    expect(formData.get('items[0]')).toBe('item1');
    expect(formData.get('items[1]')).toBe('item2');
  });

  it('should handle dates', () => {
    const date = new Date();
    const source = { date };
    const formData = objectToFormData(source);
    expect(formData.get('date')).toBe(date.toISOString());
  });

  it('should handle files', () => {
    const file = new File(['content'], 'file.txt', { type: 'text/plain' });
    const source = { file };
    const formData = objectToFormData(source);
    expect(formData.get('file')).toStrictEqual(file);
  });

  it('should handle blobs', () => {
    const blob = new Blob(['content'], { type: 'text/plain' });
    const source = { blob };
    const formData = objectToFormData(source);
    const receivedBlob = formData.get('blob') as Blob;
    expect(receivedBlob.size).toBe(blob.size);
    expect(receivedBlob.type).toBe(blob.type);
  });

  it('should handle booleans', () => {
    const source = { active: true, inactive: false };
    const formData = objectToFormData(source);
    expect(formData.get('active')).toBe('1');
    expect(formData.get('inactive')).toBe('0');
  });

  it('should handle null and undefined', () => {
    const source = { empty: null, missing: undefined };
    const formData = objectToFormData(source);
    expect(formData.get('empty')).toBe('');
    expect(formData.get('missing')).toBe('');
  });

  it('should throw an error for unsupported types', () => {
    const source = { unsupported: Symbol('symbol') };
    expect(() => objectToFormData(source as any)).toThrow(TypeError);
  });
});
