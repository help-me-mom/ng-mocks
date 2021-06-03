import ngMocksUniverse from './ng-mocks-universe';

export interface NgMocksStack {
  id: object;
  level: 'root' | 'suite' | 'test';
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

const stackPush = (level: NgMocksStack['level']) => {
  const id = {};
  ngMocksUniverse.global.set('reporter-stack-id', id);
  const state = { id, level };
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
    stack.push({ ...stackRoot });
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
  jasmineStarted: () => stackPush('root'),
  specDone: stackPop,
  specStarted: () => stackPush('test'),
  suiteDone: stackPop,
  suiteStarted: () => stackPush('suite'),
};

const messageCore = [
  'ng-mocks cannot install own spec reporter.',
  'This affects its core features for MockInstance and MockRender.',
  'Please report an issue on github.',
  'If you use jest v27, please add to its config testRunner=jest-jasmine2 for now',
  'and upvote the issue on github: https://github.com/facebook/jest/issues/11483.',
].join(' ');

// istanbul ignore next
const messageCoreChecker = () => {
  if (current().level === 'root') {
    throw new Error(messageCore);
  }
};

const install = () => {
  if (!ngMocksUniverse.global.has('reporter-stack-install')) {
    // istanbul ignore if
    // tslint:disable-next-line strict-type-predicates
    if (typeof jasmine === 'undefined') {
      messageCoreChecker();
    } else {
      jasmine.getEnv().addReporter(reporterStack);
      ngMocksUniverse.global.set('reporter-stack-install', true);
    }
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
  current,
  install,
  subscribePop,
  subscribePush,
  unsubscribePop,
  unsubscribePush,
};
