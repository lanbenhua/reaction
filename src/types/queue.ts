import { IPromiseTaskFunction, IRawRequestInit, IBody } from './fetch';

export enum EQueueMode {
  /**
   * @description
   * * put `task` into the fetch queue
   * * the `task` means one and more requests defined in `retry` / `serial`
   */
  TASK = 1,
  /**
   * @description
   * put each request that needs to be queued into the fetch queue
   */
  EACH_REQUEST,
}

export interface IQueueFetchInit<T extends IBody> extends IRawRequestInit<T> {
  queue?: EQueueMode;
  /**
   * @description
   * - the priority is lower than `queue`
   * - if `isSlow` is set to true, and `queue` is undefined by user,
   * then `queue` will be set to `EQueueMode.EACH_REQUEST`
   */
  isSlow?: boolean;
}

export type IResolve = (res: unknown) => void;
export type IReject = (rej: unknown) => void;
export interface IQueueSchedulerParams<S> {
  task: { handler: IPromiseTaskFunction<S>; fetchId?: string };
  resolve: IResolve;
  reject: IReject;
}
