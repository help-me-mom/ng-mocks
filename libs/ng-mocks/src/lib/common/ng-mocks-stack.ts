import ngMocksUniverse from './ng-mocks-universe';

export interface NgMocksStack {
  id: object;
  level: 'root' | 'runtime';
  mockInstance?: any[];
}

type NgMocksStackCallback = (state: NgMocksStack, stack: NgMocksStack[]) => void;

const stackRoot: NgMocksStack = { id: {}, level: 'root' };
const stack: NgMocksStack[] = ngMocksUniverse.global.get('reporter-stack') || [{ ...stackRoot }];
ngMocksUniverse.global.set('reporter-stack', stack);
const current = () => stack[stack.length - 1];

// istanbul ignore next
const listenersPush: NgMocksStackCallback[] = ngMocksUniverse.global.get('reporter-stack-push') ?? [];
ngMocksUniverse.global.set('reporter-stack-push', listenersPush);

// istanbul ignore next
const listenersPop: NgMocksStackCallback[] = ngMocksUniverse.global.get('reporter-stack-pop') ?? [];
ngMocksUniverse.global.set('reporter-stack-pop', listenersPop);

const stackPush = () => {
  const id = {};
  ngMocksUniverse.global.set('reporter-stack-id', id);
  const state: NgMocksStack = { id, level: 'runtime' };
  stack.push(state);

  for (const callback of listenersPush) {
    callback(state, stack);
  }
};
const stackPop = () => {
  const state = stack.pop();

  // this code is actually needed for jest tests.
  // istanbul ignore if
  if (stack.length === 0) {
    stack.push(state?.level === 'root' ? state : { ...stackRoot });
  }

  // istanbul ignore else
  if (state && state.level !== 'root') {
    for (const callback of listenersPop) {
      callback(state, stack);
    }
  }

  ngMocksUniverse.global.set('reporter-stack-id', stack[stack.length - 1].id);
};

// istanbul ignore next
const subscribePush = (callback: NgMocksStackCallback) => {
  if (listenersPush.indexOf(callback)) {
    listenersPush.push(callback);
  }
  if (stack.length > 0) {
    callback(stack[stack.length - 1], stack);
  }
};

// istanbul ignore next
const subscribePop = (callback: NgMocksStackCallback) => {
  if (listenersPop.indexOf(callback) === -1) {
    listenersPop.push(callback);
  }
};

// istanbul ignore next
const unsubscribePush = (callback: NgMocksStackCallback) => {
  const index = listenersPush.indexOf(callback);
  if (index !== -1) {
    listenersPush.splice(index, 1);
  }
};

// istanbul ignore next
const unsubscribePop = (callback: NgMocksStackCallback) => {
  const index = listenersPop.indexOf(callback);
  if (index !== -1) {
    listenersPop.splice(index, 1);
  }
};

export default {
  current,
  stackPop,
  stackPush,
  subscribePop,
  subscribePush,
  unsubscribePop,
  unsubscribePush,
};
