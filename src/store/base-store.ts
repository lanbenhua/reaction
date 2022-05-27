/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { observable, action } from '../core';

export interface IInitializerDescriptor<T> extends TypedPropertyDescriptor<T> {
  initializer?: () => T;
}

export const report = ([success, failed]: [string, string?]) => (
  target: AbstractBaseStore,
  property: string,
  descriptor: IInitializerDescriptor<(...args: any) => unknown>
) => {
  if (!(target instanceof AbstractBaseStore)) {
    throw new Error('Current Class must extends AbstractBaseStore');
  }
  const original = descriptor.value || descriptor.initializer();
  if (typeof original !== 'function') {
    throw new Error('@message must decorator a function');
  }

  descriptor.value = function (...args: any) {
    const promise = original.call(this, ...args);
    if (!(promise instanceof Promise)) {
      this.showMessage(success, 'success');
      return promise;
    }

    return (promise as Promise<any>).then(
      (res) => {
        if (success) this.showMessage(success, 'success');
        return res;
      },
      (error) => {
        if (failed) this.showMessage(failed, 'error');
        throw error;
      }
    );
  };
};

const generateLoadingKey = (type: string, uid?: string | number) =>
  uid === undefined ? type : `loading:${type}_${uid}`;

const LOADING_UNIQUE_METADATA_KEY = 'LOADING_UNIQUE_KEY';

export const loadingUniqueKey = (
  target: AbstractBaseStore,
  propertyKey: string,
  paramIdx: number
) => {
  Reflect.defineMetadata(LOADING_UNIQUE_METADATA_KEY, paramIdx, target, propertyKey);
};

export const loading = (key: string, msg?: string) => (
  target: AbstractBaseStore,
  property: string,
  descriptor: IInitializerDescriptor<(...args: unknown[]) => Promise<unknown>>
) => {
  if (!(target instanceof AbstractBaseStore)) {
    throw new Error('Current Class must extends AbstractBaseStore');
  }
  const original = descriptor.value || descriptor.initializer();
  if (typeof original !== 'function') {
    throw new Error('@loading must decorator a function');
  }

  descriptor.value = function (...args: unknown[]) {
    const loadingUniqueKeyIdx: number = Reflect.getMetadata(
      LOADING_UNIQUE_METADATA_KEY,
      target,
      property
    );
    const loadingKey =
      typeof loadingUniqueKeyIdx === 'number'
        ? generateLoadingKey(key, args[loadingUniqueKeyIdx] as string)
        : generateLoadingKey(key);

    this.setLoading(loadingKey, true);

    let promise: Promise<unknown>;
    try {
      promise = original.call(this, ...args);
    } catch (e) {
      promise = Promise.reject(e);
    }

    return promise
      .then((res) => {
        if (msg) this.showMessage(msg, 'success');
        return res;
      })
      .finally(() => {
        this.setLoading(loadingKey, false);
      });
  };
};

export const followUp = <T>(func: T[keyof T] | keyof T) => (
  target: T,
  property: string,
  descriptor: IInitializerDescriptor<(...args: any) => unknown>
) => {
  const original = descriptor.value || descriptor.initializer();
  if (typeof original !== 'function') {
    throw new Error('@followUp must decorator a function');
  }

  descriptor.value = function (...args: any) {
    const promise = original.call(this, ...args);

    const followHandler = (d: any) => {
      if (typeof func === 'string') return this[func](d);
      if (typeof func === 'function') return func.call(this, d);
      throw new Error(`func must be a function or string, but currently it is ${func}`);
    };

    if (!(promise instanceof Promise)) {
      return followHandler(promise);
    }

    return (promise as Promise<any>).then(followHandler);
  };
};

export const followUpSync = followUp;

export abstract class AbstractBaseStore {
  public abstract showMessage(msg: string, type?: 'success' | 'error'): void;

  @observable
  private loadMapCounter: Record<string, number> = {};

  public readonly loadMap = (new Proxy(this.loadMapCounter, {
    get(target: Record<string, number>, prop: string): boolean {
      return target[prop] > 0;
    },
  }) as unknown) as Record<string, boolean>;

  @action.bound
  public setLoading(key: string, value: boolean) {
    if (typeof this.loadMapCounter[key] !== 'number') {
      this.loadMapCounter[key] = 0;
    }

    value ? this.loadMapCounter[key]++ : this.loadMapCounter[key]--;
  }

  public getLoading(key: string, uid?: string) {
    return this.loadMap[generateLoadingKey(key, uid)];
  }
}
