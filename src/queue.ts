import { IBody, IFetch, IQueueSchedulerParams } from './types';
import { cancelablePromise } from './utils';
import { promiseHelper } from './helper';

const CHROME_MAX_FETCH = 6;

export class QueueScheduler<S> {
  private maxFetchNumber = 3; // CHROME_MAX_FETCH / 2;
  private fetchNumber = 0;
  private waitQueue: IQueueSchedulerParams<S>[] = [];

  private pushQueue(task: IQueueSchedulerParams<S>['task']): Promise<S> {
    const controller = promiseHelper.generateController(task.fetchId);
    return cancelablePromise(
      controller,
      (resolve, reject) => this.waitQueue.push({ task, resolve, reject }),
      () => this.removeFromQueue(task.fetchId)
    );
  }

  private removeFromQueue(fetchId: string) {
    const index = this.waitQueue.findIndex((q) => q.task.fetchId === fetchId);
    if (index === -1) return false;
    this.waitQueue.splice(index, 1);
  }

  private popQueue() {
    if (this.fetchNumber >= this.maxFetchNumber) return;
    const queue = this.waitQueue.shift();
    if (!queue) return;
    const { task, resolve, reject } = queue;
    this.run(task).then(resolve, reject);
  }

  run = (task: IQueueSchedulerParams<S>['task']) => {
    if (this.fetchNumber >= this.maxFetchNumber) return this.pushQueue(task);
    this.fetchNumber++;
    return task.handler().finally(() => {
      this.fetchNumber--;
      this.popQueue();
    });
  };

  setMaxFetchNumber(num: number) {
    if (num >= CHROME_MAX_FETCH) {
      throw new Error(`max fetch number cannot exceed ${CHROME_MAX_FETCH}`);
    }

    this.maxFetchNumber = num;
  }
}

const queueScheduler = new QueueScheduler();

export const queueFetch = <T extends IBody, S>(fetcher: IFetch<T, S>): IFetch<T, S> => (
  url,
  init?
): Promise<S> => {
  return (queueScheduler as QueueScheduler<S>).run({
    handler: () => fetcher(url, init),
    fetchId: init?.fetchId,
  });
};

export const setMaxFetchNumber = (num: number) => {
  queueScheduler.setMaxFetchNumber(num);
};
