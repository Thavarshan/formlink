import { AxiosResponse } from 'axios';

import { Progress } from './progress';

export interface FormOptions<TForm> {
  /**
   * Hook called before the form submission starts.
   */
  onBefore?: () => void;

  /**
   * Hook called when the form submission is successful.
   * @param response - The Axios response from the server.
   */
  onSuccess?: (response: AxiosResponse) => void;

  /**
   * Hook called when the form submission fails, specifically for handling errors (e.g., Laravel validation errors).
   * @param errors - An object containing form validation errors mapped by field name.
   */
  onError?: (errors: Partial<Record<keyof TForm, string>>) => void;

  /**
   * Hook called when the form submission finishes, whether it's successful or not.
   */
  onFinish?: () => void;

  /**
   * Hook called periodically during file upload progress or long-running requests.
   * @param progress - The current progress of the upload, including total, loaded, and percentage.
   */
  onProgress?: (progress: Progress) => void;
}
