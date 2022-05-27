import { IResolve, IReject } from './types';

export const SIGNAL_ABORT_ERROR = 'SIGNAL_ABORT_ERROR';
export const generateSignalAbortError = (message = 'User aborts exception') => {
  const error = new Error(message);
  error.name = SIGNAL_ABORT_ERROR;
  return error;
};

export const SERIAL_MAX_TIMEOUT_ERROR = 'SERIAL_MAX_TIMEOUT_ERROR';
export const generateSerialMaxTimeoutError = (message = 'Request timed out') => {
  const error = new Error(message);
  error.name = SERIAL_MAX_TIMEOUT_ERROR;
  return error;
};

export const cancelablePromise = <T>(
  controller: AbortController,
  didMount?: (resolve: IResolve, reject: IReject) => void,
  beforeReject?: (error?: Error) => boolean | void,
  abortError = generateSignalAbortError()
) => {
  return new Promise<T>((resolve, reject) => {
    const cancel = () => {
      const throwError = beforeReject?.(abortError);
      if (throwError === false) return;
      reject(abortError);
    };

    if (controller?.signal.aborted) return cancel();
    controller?.signal.addEventListener('abort', cancel);
    didMount?.(resolve, reject);
  });
};
