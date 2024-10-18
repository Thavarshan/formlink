import { AxiosProgressEvent } from 'axios';

export type Progress = { percentage: number; } & AxiosProgressEvent;

export interface FormProgress {
  upload?: Progress;
  download?: Progress;
  state: 'idle' | 'uploading' | 'downloading' | 'processing';
}
