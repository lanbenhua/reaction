import { configure } from 'mobx';
import 'mobx-react-lite/batchingForReactDom';

export { observer } from 'mobx-react';
export { action, observable, computed } from 'mobx';

configure({ enforceActions: 'observed' });
