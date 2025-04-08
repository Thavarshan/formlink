/**
 * Safely checks if an object has a property as its own property.
 * @param {object} obj - The object to check.
 * @param {string | symbol} prop - The property to check.
 * @returns {boolean} Whether the object has the property.
 */
export function hasOwnProperty(obj: object, prop: string | symbol): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Checks if a property exists on an object (either as its own property or in its prototype chain).
 * @param {object} obj - The object to check.
 * @param {string | symbol} prop - The property to check.
 * @returns {boolean} Whether the property exists on the object.
 */
export function hasProperty(obj: object, prop: string | symbol): boolean {
  return prop in obj;
}

/**
 * Checks if a key exists in an object (either as its own property or in the prototype chain).
 * @param {object} obj - The object to check.
 * @param {string | symbol} key - The key to check.
 * @returns {boolean} Whether the key exists.
 */
export function keyExistsIn(obj: object, key: string | symbol): boolean {
  return hasOwnProperty(obj, key) || hasProperty(obj, key);
}
