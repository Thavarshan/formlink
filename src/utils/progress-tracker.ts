import { Progress } from '@/types/progress';
import { AxiosProgressEvent } from 'axios';

/**
 * Creates a progress object from an upload progress event.
 * @param {AxiosProgressEvent} event - The progress event.
 * @returns {Progress} The progress object.
 */
export function createProgressObject(event: AxiosProgressEvent): Progress {
  return {
    total: event.total || 0,
    loaded: event.loaded,
    percentage: Math.round((event.loaded / (event.total || 1)) * 100),
    bytes: event.loaded,
    lengthComputable: event.lengthComputable || false
  };
}
