import {
  IFetchCancelableRetryOption,
  IPromiseTaskFunction,
  IRetryFetchInit,
  IFetch,
  IBody,
} from './types';

import { AbortSignalHelper } from './abort';
import { promiseHelper } from './helper';
import { Timeout } from './timeout';

export const MAX_RETRY_TIMES_ERROR = 'MAX_RETRY_TIMES_ERROR';
export const DEFAULT_INTERVAL = 1000;

class RetryScheduler<S> {
  private retryOption: IFetchCancelableRetryOption<S>;
  private fetcher: IPromiseTaskFunction<S>;
  private retryTimes = 0;
  private intervalTimer: Timeout;
  constructor(retryOption: IFetchCancelableRetryOption<S>, fetcher: IPromiseTaskFunction<S>) {
    this.retryOption = retryOption;
    this.fetcher = fetcher;
    this.init();
  }

  private init() {
    this.retryOption.interval =
      typeof this.retryOption.interval === 'number' ? this.retryOption.interval : DEFAULT_INTERVAL;

    const controller = promiseHelper.generateController(this.retryOption.fetchId);
    this.intervalTimer = new Timeout(this.retryOption.interval, controller);
  }

  private exeRetry = (error?: Error): Promise<S> => {
    if (this.retryTimes > this.retryOption.maxRetryTimes) {
      const error = new Error('Maximum number of retries exceeded');
      error.name = MAX_RETRY_TIMES_ERROR;
      return Promise.reject(error);
    }

    const report = this.retryOption.reportError?.(error) || Promise.resolve();
    return report.then(() => this.intervalTimer.wait().then(this.run));
  };

  private clearTimer() {
    this.intervalTimer.clear();
    promiseHelper.removeController(this.retryOption.fetchId);
  }

  run: IPromiseTaskFunction<S> = () => {
    const resRetryHandler = (res: S) => {
      let filter = this.retryOption.needRetryFilter
        ? this.retryOption.needRetryFilter(res)
        : Promise.resolve();

      // Boolean
      if (typeof filter === 'boolean') filter = filter ? Promise.reject() : Promise.resolve();

      return filter.then(() => res, this.exeRetry);
    };

    this.retryTimes++;
    return this.fetcher().then(resRetryHandler, (error) => {
      if (AbortSignalHelper.isAbortError(error)) {
        this.clearTimer();
        throw error;
      }

      return this.exeRetry(error);
    });
  };
}

export const retryFetch = <T extends IBody, S>(fetcher: IFetch<T, S>) => (
  url: string,
  init?: IRetryFetchInit<T, S>
): Promise<S> => {
  const option: IFetchCancelableRetryOption<S> = { ...init.retry, fetchId: init.fetchId };
  return new RetryScheduler<S>(option, () => fetcher(url, init)).run();
};
