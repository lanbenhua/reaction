import { SERIAL_MAX_TIMEOUT_ERROR, SIGNAL_ABORT_ERROR } from './utils';

export const AbortError = 'AbortError';
export class AbortSignalHelper {
  private controllerMap = new Map<string, AbortController>();

  abort = (id: string) => {
    this.getController(id)?.abort();
    this.removeController(id);
  };

  getController(id: string) {
    return this.controllerMap.get(id);
  }

  removeController(id: string) {
    this.controllerMap.delete(id);
  }

  public generateController(id: string) {
    if (!id) return null;
    const oldController = this.getController(id);
    if (oldController) return oldController;
    const controller = new AbortController();
    this.controllerMap.set(id, controller);
    return controller;
  }

  static isAbortError(error: Error) {
    return (
      AbortSignalHelper.isFetchAbortError(error) || AbortSignalHelper.isUserSignalAbortError(error)
    );
  }

  static isFetchAbortError(error: Error) {
    return error instanceof DOMException && error.name === AbortError;
  }

  static isUserSignalAbortError(error: Error) {
    return error instanceof Error && error.name === SIGNAL_ABORT_ERROR;
  }

  static isSerialMaxTimeoutAbortError(error: Error) {
    return error instanceof Error && error.name === SERIAL_MAX_TIMEOUT_ERROR;
  }
}
