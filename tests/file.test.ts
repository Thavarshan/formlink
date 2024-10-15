import { describe, it, expect } from 'vitest';
import { hasFiles } from '../src/utils/file';
import { RequestPayload } from '../src/types/request-payload';

describe('hasFiles', () => {
  it('should return true for File instances', () => {
    const file = new File(['content'], 'file.txt', { type: 'text/plain' });
    expect(hasFiles(file)).toBe(true);
  });

  it('should return true for Blob instances', () => {
    const blob = new Blob(['content'], { type: 'text/plain' });
    expect(hasFiles(blob)).toBe(true);
  });

  it('should return true for FileList instances with files', () => {
    const file = new File(['content'], 'file.txt', { type: 'text/plain' });
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file,
    } as unknown as FileList;
    expect(hasFiles(fileList)).toBe(true);
  });

  it('should return false for empty FileList instances', () => {
    const fileList = {
      length: 0,
      item: (index: number) => null,
    } as unknown as FileList;
    expect(hasFiles(fileList)).toBe(false);
  });

  it('should return true for FormData instances with files', () => {
    const formData = new FormData();
    const file = new File(['content'], 'file.txt', { type: 'text/plain' });
    formData.append('file', file);
    expect(hasFiles(formData)).toBe(true);
  });

  it('should return false for FormData instances without files', () => {
    const formData = new FormData();
    formData.append('field', 'value');
    expect(hasFiles(formData)).toBe(false);
  });

  it('should return true for objects containing files', () => {
    const file = new File(['content'], 'file.txt', { type: 'text/plain' });
    const data: RequestPayload = { file };
    expect(hasFiles(data)).toBe(true);
  });

  it('should return false for objects without files', () => {
    const data: RequestPayload = { field: 'value' };
    expect(hasFiles(data)).toBe(false);
  });

  it('should return false for non-object, non-file values', () => {
    expect(hasFiles('string')).toBe(false);
    expect(hasFiles(123)).toBe(false);
    expect(hasFiles(null)).toBe(false);
    expect(hasFiles(undefined)).toBe(false);
  });

  it('should return true for nested objects containing files', () => {
    const file = new File(['content'], 'file.txt', { type: 'text/plain' });
    const data: RequestPayload = { nested: { file } };
    expect(hasFiles(data)).toBe(true);
  });

  it('should return false for nested objects without files', () => {
    const data: RequestPayload = { nested: { field: 'value' } };
    expect(hasFiles(data)).toBe(false);
  });
});
