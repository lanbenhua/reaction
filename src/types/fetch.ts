export interface IBaseInit extends RequestInit {
  /**
   * Please use `fetchId` instead
   * @deprecated
   */
  guaranteeId?: string;
  /**
   * the only Id for each fetch request
   */
  fetchId?: string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type IBody = object | IBaseInit['body'];

export interface IRawRequestInit<T extends IBody = IBody> extends Omit<IBaseInit, 'body'> {
  body?: T;
}

export type IPromiseTaskFunction<S> = () => Promise<S>;
