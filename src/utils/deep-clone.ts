/**
 * Deep clones an object or value.
 * @param {T} obj - The object to clone.
 * @returns {T} - The cloned object.
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key as keyof T] = deepClone(value);
    return acc;
  }, {} as T);
}
