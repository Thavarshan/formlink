import { createTimeout } from './utils/timeout';

/**
 * Timeout manager for better timeout handling
 */
export class TimeoutManager {
  /**
   * Map to store timeouts with their IDs
   */
  private timeouts = new Map<string, number>();

  /**
   * Sets a timeout for a given key
   * @param key - The key to associate with the timeout
   * @param callback - The function to call after the timeout
   * @param delay - The delay in milliseconds
   * @returns void
   */
  set(key: string, callback: () => void, delay: number): void {
    this.clear(key);
    const id = createTimeout(callback, delay);
    this.timeouts.set(key, id);
  }

  /**
   * Clears the timeout associated with the given key
   * @param key - The key whose timeout to clear
   * @returns void
   */
  clear(key: string): void {
    const id = this.timeouts.get(key);
    if (id) {
      clearTimeout(id);
      this.timeouts.delete(key);
    }
  }

  /**
   * Clears all timeouts
   * @returns void
   */
  clearAll(): void {
    for (const id of this.timeouts.values()) {
      clearTimeout(id);
    }
    this.timeouts.clear();
  }

  /**
   * Checks if a timeout exists for the given key
   * @param key - The key to check
   * @returns boolean - True if the timeout exists, false otherwise
   */
  has(key: string): boolean {
    return this.timeouts.has(key);
  }
}
