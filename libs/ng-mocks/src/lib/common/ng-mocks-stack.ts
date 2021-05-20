import ngMocksUniverse from './ng-mocks-universe';

export interface NgMocksStack {
  id: object;
  mockInstance?: any[];
}

type NgMocksStackCallback = (state: NgMocksStack, stack: NgMocksStack[]) => void;

// istanbul ignore next
const stack: NgMocksStack[] = ngMocksUniverse.global.get('reporter-stack') ?? [];
ngMocksUniverse.global.set('reporter-stack', stack);

// istanbul ignore next
const listenersPush: NgMocksStackCallback[] = ngMocksUniverse.global.get('reporter-stack-push') ?? [];
ngMocksUniverse.global.set('reporter-stack-push', listenersPush);

// istanbul ignore next
const listenersPop: NgMocksStackCallback[] = ngMocksUniverse.global.get('reporter-stack-pop') ?? [];
ngMocksUniverse.global.set('reporter-stack-pop', listenersPop);

const stackPush = () => {
  const id = {};
  ngMocksUniverse.global.set('reporter-stack-id', id);
  const state = { id };
  stack.push(state);

  for (const callback of listenersPush) {
    callback(state, stack);
  }
};
const stackPop = () => {
  const state = stack.pop();
  // istanbul ignore if
  if (stack.length === 0) {
    const id = {};
    stack.push({ id });
  }

  // istanbul ignore else
  if (state) {
    for (const callback of listenersPop) {
      callback(state, stack);
    }
  }

  ngMocksUniverse.global.set('reporter-stack-id', stack[stack.length - 1].id);
};

const reporterStack: jasmine.CustomReporter = {
  jasmineDone: stackPop,
  jasmineStarted: stackPush,
  specDone: stackPop,
  specStarted: stackPush,
  suiteDone: stackPop,
  suiteStarted: stackPush,
};

const install = () => {
  if (!ngMocksUniverse.global.has('reporter-stack-install')) {
    jasmine.getEnv().addReporter(reporterStack);
    ngMocksUniverse.global.set('reporter-stack-install', true);
    stackPush();
  }

  return ngMocksUniverse.global.has('reporter-stack-install');
};

// istanbul ignore next
const subscribePush = (callback: NgMocksStackCallback) => {
  if (listenersPush.indexOf(callback)) {
    listenersPush.push(callback);
  }
  if (stack.length) {
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
  install,
  subscribePop,
  subscribePush,
  unsubscribePop,
  unsubscribePush,
};
