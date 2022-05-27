import { AbortSignalHelper } from './abort';

export const promiseHelper = new AbortSignalHelper();
export const abortFetchHelper = new AbortSignalHelper();

export const abortRequest = (id: string) => {
  promiseHelper.abort(id);
  abortFetchHelper.abort(id);
};
