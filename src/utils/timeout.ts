/**
 * Creates a timeout and returns its ID.
 * @param {Function} callback - The function to call after the timeout.
 * @param {number} delay - The delay in milliseconds.
 * @returns {number} The timeout ID.
 */
export function createTimeout(callback: () => void, delay: number): number {
  return window.setTimeout(callback, delay);
}

/**
 * Clears a timeout.
 * @param {number} timeoutId - The timeout ID to clear.
 */
export function clearTimeout(timeoutId: number): void {
  window.clearTimeout(timeoutId);
}
