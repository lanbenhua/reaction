import { cancelablePromise, generateSignalAbortError } from './utils';

export class Timeout {
  private milliseconds: number;
  private controller: AbortController;
  private timer: number;
  private isClear = false;
  private abortError: Error;
  constructor(
    milliseconds: number,
    controller?: AbortController,
    abortError = generateSignalAbortError()
  ) {
    this.milliseconds = milliseconds;
    this.controller = controller;
    this.abortError = abortError;
  }

  wait() {
    return cancelablePromise(
      this.controller,
      (resolve) => (this.timer = window.setTimeout(resolve, this.milliseconds)),
      () => this.clear(),
      this.abortError
    );
  }

  clear() {
    if (this.isClear) return false;
    window.clearTimeout(this.timer);
    this.isClear = true;
  }
}

export const sleep = (milliseconds: number, controller?: AbortController) => {
  return new Timeout(milliseconds, controller).wait();
};
