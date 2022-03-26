import funcGetName from './func.get-name';
import funcIsJestMock from './func.is-jest-mock';

export default (def: any): void => {
  if (funcIsJestMock(def)) {
    throw new Error(
      [
        `ng-mocks got ${funcGetName(def)} which has been already mocked by jest.mock().`,
        'It is not possible to produce correct mocks for it, because jest.mock() removes Angular decorators.',
        `To fix this, please avoid jest.mock() on the file which exports ${funcGetName(
          def,
        )} or add jest.dontMock() on it.`,
        'The same should be done for all related dependencies.',
      ].join(' '),
    );
  }
};
