import funcGetName from './func.get-name';

export default (def: any): void => {
  throw new Error(
    [
      `${funcGetName(def)} declaration has been passed into ng-mocks without Angular decorators.`,
      'Therefore, it cannot be properly handled.',
      'Highly likely,',
      typeof jest === 'undefined' ? '' : /* istanbul ignore next */ 'jest.mock() has been used on its file, or',
      'ng-mocks is imported in production code, or got a class without Angular decoration.',
      'Otherwise, please create an issue on github: https://github.com/help-me-mom/ng-mocks/issues/new?title=False%20positive%20ng-mocks%20not%20in%20JIT.',
      'Thank you in advance for support.',
    ].join(' '),
  );
};
