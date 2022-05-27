import { EQueueMode, IBody, IFetch, IRequestInit } from './types';
import { serialFetch } from './serial';
import { retryFetch } from './retry';
import { queueFetch } from './queue';

export * from './timeout';
export * from './store';
export * from './abort';
export * from './types';
export * from './fetch';
export * from './core';

export { setMaxFetchNumber } from './queue';
export { abortRequest } from './helper';

export const fetchWrapper = <T extends IBody = IBody, S = unknown>(fetcher: IFetch<T, S>) => <
  BODY extends T = T
>(
  url: string,
  fetchInit?: IRequestInit<BODY, S>
) => {
  let runner = fetcher;

  // Enhance retry
  if (fetchInit?.retry) runner = retryFetch(runner);

  // Enhance serial
  if (fetchInit?.serial) runner = serialFetch(runner);

  /**
   * Enhance queue
   * `queueFetch` should be called in the last.
   * Otherwise, when `queue` and `serial` are set at the same time,
   * the `maxTimeout` in `serial` may have been triggered during the queuing period,
   * but the ajax request has not been sent yet
   */
  if (fetchInit?.queue === EQueueMode.TASK) runner = queueFetch(runner);

  return runner(url, fetchInit);
};
