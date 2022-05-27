import { generateSerialMaxTimeoutError } from './utils';
import { abortRequest, promiseHelper } from './helper';
import { Timeout } from './timeout';

import {
  ISerialSchedulerClassOption,
  ISerialSchedulerExeParams,
  ISerialFetchInit,
  IFetch,
  IBody,
} from './types';

export const DEFAULT_POLLING_INTERVAL = 1000;

class SerialScheduler<T extends IBody, S> {
  private option: ISerialSchedulerClassOption<T, S>;
  private maxTimeoutTimer: Timeout;
  private isMaxTimeout = false;

  constructor(option: ISerialSchedulerClassOption<T, S>) {
    this.option = option;
    this.init();
  }

  private clearTimer() {
    this.maxTimeoutTimer.clear();
    promiseHelper.removeController(this.option.fetchId);
  }

  private init() {
    this.option.interval =
      typeof this.option.interval === 'number' ? this.option.interval : DEFAULT_POLLING_INTERVAL;
    // move into `run()`
    // this.setTimer();
  }

  private setTimer() {
    if (typeof this.option.maxTimeout !== 'number') return;
    if (!this.option.fetchId) throw new Error('You must set fetchId, when maxTimeout is set');
    const controller = promiseHelper.generateController(this.option.fetchId);
    this.maxTimeoutTimer = new Timeout(this.option.maxTimeout, controller);

    this.maxTimeoutTimer.wait().then(() => {
      this.isMaxTimeout = true;
      // timeout emit abort
      abortRequest(this.option.fetchId);
    });
  }

  public run(originalParams: ISerialSchedulerExeParams<T, S>) {
    // should call setTimer when starting to run
    this.setTimer();
    return this.exe(originalParams).finally(() => {
      // clear overall timeout
      this.clearTimer();
    });
  }

  private exe(prevParams: ISerialSchedulerExeParams<T, S>): Promise<S> {
    return this.option
      .runner(prevParams)
      .then((res) => {
        let filter = this.option.rerunFilter(prevParams, res);
        if (!(filter instanceof Promise)) filter = Promise.resolve(filter);

        return filter.then((newParams) => {
          if (!newParams) return null;
          return new Timeout(this.option.interval, promiseHelper.getController(this.option.fetchId))
            .wait()
            .then(() => this.exe({ ...prevParams, ...newParams }));
        });
      })
      .catch((e) => {
        // trigger by max timeout
        if (this.isMaxTimeout) {
          throw generateSerialMaxTimeoutError();
        }
        throw e;
      });
  }
}

export const serialFetch = <T extends IBody, S>(fetcher: IFetch<T, S>) => (
  url: string,
  init?: ISerialFetchInit<T, S>
): Promise<S> => {
  const serialScheduler = new SerialScheduler<T, S>({
    ...init.serial,
    fetchId: init.fetchId,
    runner: ({ url, init }) => fetcher(url, init),
  });

  return serialScheduler.run({ url, init });
};
