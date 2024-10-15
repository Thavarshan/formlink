import { AxiosProgressEvent } from 'axios';

export type Progress = { percentage: number } & AxiosProgressEvent;
