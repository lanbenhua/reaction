import { IRawRequestInit, IBody } from './fetch';

export interface IFetchRetryOption<S> {
  maxRetryTimes: number;
  interval?: number;
  needRetryFilter?: (res: S) => Promise<void> | boolean;
  reportError?: (error: Error) => Promise<void> | void;
}

export interface IFetchCancelableRetryOption<S> extends IFetchRetryOption<S> {
  fetchId: string;
}

export interface IRetryFetchInit<T extends IBody, S> extends IRawRequestInit<T> {
  retry?: IFetchRetryOption<S>;
}
