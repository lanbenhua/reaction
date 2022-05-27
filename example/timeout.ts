import { Timeout, abortRequest } from '../src';
import { promiseHelper } from '../src/helper';

const fetchId = '/test/fetchId';

const controller = promiseHelper.generateController(fetchId);

const timer1 = new Timeout(1000, controller);
timer1.wait().then(() => {
  console.log('===> 1000');
});

new Timeout(2000, controller).wait().then(() => {
  console.log('===> 2000');
});

new Timeout(3000, controller).wait().then(() => {
  console.log('===> 3000');
});

timer1.clear();

abortRequest(fetchId);

// no effect when aborting again
abortRequest(fetchId);
