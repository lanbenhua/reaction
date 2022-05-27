import './index.less';
import { abortRequest, EQueueMode } from '../src';
import fetch from './fetch';

fetch('/api/retry/success', {
  appLayerHandleError: true,
}).then((res) => console.log(res));

fetch('/api/slow/1', { queue: EQueueMode.EACH_REQUEST, fetchId: '/api/slow/1' }).then((res) =>
  console.log(res)
);

fetch('/api/slow/2', { queue: EQueueMode.EACH_REQUEST, fetchId: '/api/slow/2' }).then((res) =>
  console.log(res)
);

fetch('/api/slow/3', {
  // queue: EQueueMode.EACH_REQUEST,
  isSlow: true,
  fetchId: '/api/slow/3',
  appLayerHandleError: true,
  retry: {
    maxRetryTimes: 4,
    interval: 1000,
    reportError: (err) => {
      console.error('[/api/slow/3] report Error ===>', err);
    },
  },
}).then((res) => console.log(res));

fetch('/api/slow/4', {
  queue: EQueueMode.EACH_REQUEST,
  fetchId: '/api/slow/4',
}).then((res) => console.log(res));

fetch('/api/slow/5', { queue: EQueueMode.EACH_REQUEST }).then((res) => console.log(res));
fetch('/api/slow/6', { queue: EQueueMode.EACH_REQUEST }).then((res) => console.log(res));
fetch('/api/slow/7', { queue: EQueueMode.EACH_REQUEST }).then((res) => console.log(res));
fetch('/api/slow/8', { queue: EQueueMode.EACH_REQUEST }).then((res) => console.log(res));

abortRequest('/api/slow/4');

// setTimeout(() => {
//   console.log('abortRequest /api/slow/3');
//   abortRequest('/api/slow/3');
// }, 10 * 1000);

fetch('/api/serial', {
  queue: EQueueMode.EACH_REQUEST,
  fetchId: '/api/serial',
  retry: {
    maxRetryTimes: 3,
    interval: 5000,
    needRetryFilter: (_) => {
      return false;
    },
    reportError: (err) => {
      console.error('[/api/serial] report Error ===>', err);
    },
  },
  body: [1, 2, 3, 4],
  serial: {
    maxTimeout: 15 * 1000,
    interval: 3 * 1000,
    rerunFilter: ({ init }, { id }) => {
      console.log('finished id:', id);
      const body = init.body;
      init.body = body.filter((cid) => cid !== id);
      if (init.body.length) return { init };
      console.log('polling end!');
      return null;
    },
  },
}).then(
  (res) => console.log('res ===>', res),
  (err) => console.log(err)
);

fetch('/api/fast/9').then((res) => console.log(res));
fetch('/api/fast/10').then((res) => console.log(res));
fetch('/api/fast/11').then((res) => console.log(res));
