import { observable, action } from '../core';

type Resolver = { resolve: (value?: unknown) => void; reject: (value?: unknown) => void };

export abstract class BaseModalStore {
  @observable
  public ids: string[] = [];

  private resolvers: Resolver[] = [];

  @action.bound
  public open(key: string) {
    this.ids.push(key);
    return new Promise((resolve, reject) => {
      this.resolvers.push({
        resolve,
        reject,
      });
    });
  }

  @action.bound
  public close(value?: unknown) {
    this.resolvers.pop()?.resolve(value);
    this.ids.pop();
    this.resetGlobalVar();
  }

  @action.bound
  public closeAndReject(value?: unknown) {
    this.resolvers.pop()?.reject(value);
    this.ids.pop();
    this.resetGlobalVar();
  }

  public abstract resetGlobalVar(): void;
}
