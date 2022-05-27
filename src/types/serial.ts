import { IRawRequestInit, IBody } from './fetch';

export type ISerialSchedulerExeResult = unknown;

export interface ISerialSchedulerExeParams<T extends IBody, S = unknown> {
  url?: string;
  init?: ISerialFetchInit<T, S>;
}

export interface ISerialSchedulerClassOption<T extends IBody, S = unknown>
  extends ISerialSchedulerOption<T, S> {
  fetchId?: string;
  runner?: (originalParams: ISerialSchedulerExeParams<T, S>) => Promise<S>;
}

export interface ISerialSchedulerOption<T extends IBody, S = unknown> {
  /**
   * @description milliseconds
   */
  maxTimeout?: number;
  /**
   * @description 1000ms by default
   */
  interval?: number;
  rerunFilter: (
    previousParams: ISerialSchedulerExeParams<T, S>,
    res: S
  ) => Promise<ISerialSchedulerExeParams<T, S>> | ISerialSchedulerExeParams<T, S>;
}

export interface ISerialFetchInit<T extends IBody, S> extends IRawRequestInit<T> {
  serial?: ISerialSchedulerOption<T, S>;
}
