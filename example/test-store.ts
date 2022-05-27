import { AbstractBaseStore, followUp, followUpSync, loading, report } from '../src';

class TestStore extends AbstractBaseStore {
  showMessage(message: string, type: 'success' | 'error') {
    console.log(`${type}:`, message);
  }

  getList(preResult: string) {
    console.log('getList: ', preResult);
  }

  @report(['test async success', 'test async failed'])
  @followUp('getList')
  testAsync() {
    return Promise.resolve().then(() => {
      console.log('testAsync');
      return 'testAsync';
    });
  }

  @report(['test sync1 success'])
  @followUp('getList')
  testSync() {
    console.log('testSync1');
    return 'testSync1';
  }

  @report(['test sync2 success'])
  @followUpSync('getList')
  testSync2() {
    console.log('testSync2');
    return 'testSync2';
  }

  @report(['loading success'])
  @loading('testLoadingSuccess')
  testLoadingSuccess() {
    return Promise.resolve('ok');
  }

  @report(['loading success', 'loading failed'])
  @loading('testLoadingFailed')
  testLoadingFailed() {
    throw new Error('test loading error');
    return Promise.resolve('success');
  }
}

const testStore = new TestStore();

// testStore.testAsync();
// testStore.testSync();
// testStore.testSync2();

testStore.testLoadingSuccess();
console.log('testLoadingSuccess', testStore.getLoading('testLoadingSuccess'));
setTimeout(() => {
  console.log('testLoadingSuccess', testStore.getLoading('testLoadingSuccess'));
}, 1000);

testStore.testLoadingFailed();
console.log('testLoadingFailed', testStore.getLoading('testLoadingFailed'));
setTimeout(() => {
  console.log('testLoadingFailed', testStore.getLoading('testLoadingFailed'));
}, 1000);
