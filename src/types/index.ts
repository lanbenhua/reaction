import { IBody, IRawRequestInit } from './fetch';
import { IQueueFetchInit } from './queue';
import { IRetryFetchInit } from './retry';
import { ISerialFetchInit } from './serial';

export interface IRequestInit<T extends IBody = IBody, S = unknown>
  extends IQueueFetchInit<T>,
    ISerialFetchInit<T, S>,
    IRetryFetchInit<T, S> {
  noErrorHint?: boolean;
  appLayerHandleError?: boolean;
}

/**
 * to forward compatible
 */
export type IReq<T extends IBody = IBody, S = unknown> = IRequestInit<T, S>;

export type IFetch<T extends IBody, S> = (url: string, init?: IRawRequestInit<T>) => Promise<S>;

export * from './fetch';
export * from './queue';
export * from './retry';
export * from './serial';
