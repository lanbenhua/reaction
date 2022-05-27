import {
  IRequestInit,
  EQueueMode,
  IQueueFetchInit,
  IBaseInit,
  IRawRequestInit,
  IBody,
} from './types';

import { abortFetchHelper, abortRequest } from './helper';
import { queueFetch } from './queue';

const isFormData = (body: IRequestInit['body']) => body instanceof FormData;
const shouldStringifyBody = (body: IRequestInit['body']): boolean => {
  return body && typeof body === 'object' && !isFormData(body);
};

const fetchExecutor = (url: string, fetchInit?: IRawRequestInit) => {
  if (!fetchInit) return window.fetch(url);

  const init: IBaseInit = Object.assign({}, fetchInit, {
    body: shouldStringifyBody(fetchInit.body)
      ? JSON.stringify(fetchInit.body)
      : (fetchInit.body as IBaseInit['body']),
  });

  if (init.body) {
    init.headers = Object.assign(
      isFormData(init.body)
        ? {}
        : {
            'Content-Type': 'application/json',
          },
      init.headers
    );
  }

  init.fetchId = typeof init.fetchId === 'string' ? init.fetchId : init.guaranteeId;

  if (!init.fetchId) return window.fetch(url, init);

  const prevController = abortFetchHelper.getController(init.fetchId);
  // should call `abortRequest`
  if (prevController?.signal.aborted === false) abortRequest(init.fetchId);

  const controller = abortFetchHelper.generateController(init.fetchId);

  init.signal = controller.signal;
  return window.fetch(url, init).finally(() => {
    const currentController = abortFetchHelper.getController(init.fetchId);
    if (currentController === controller) abortFetchHelper.removeController(init.fetchId);
  });
};

export const fetch = <T extends IBody>(url: string, init?: IQueueFetchInit<T>) => {
  let runner = fetchExecutor;

  if (init?.isSlow && !init.queue) init.queue = EQueueMode.EACH_REQUEST;
  if (init?.queue === EQueueMode.EACH_REQUEST) runner = queueFetch(runner);

  return runner(url, init);
};
