// tslint:disable ordered-imports

jest.mock('./1.fixtures');
jest.mock('./2.fixtures', () => ({
  TargetPipe: class TargetPipeMock {
    public readonly fake = true;
  },
}));

import {
  MockBuilder,
  MockComponent,
  MockDirective,
  MockModule,
} from 'ng-mocks';

import {
  TargetComponent,
  TargetDirective,
  TargetModule,
} from './1.fixtures';
import { TargetPipe } from './2.fixtures';

describe('issue-760', () => {
  it('shows right warning', () => {
    expect(() => MockModule(TargetModule)).toThrowError(
      /ng-mocks got TargetModule which has been already mocked by jest.mock/,
    );
    expect(() => MockComponent(TargetComponent)).toThrowError(
      /ng-mocks got TargetComponent which has been already mocked by jest.mock/,
    );
    expect(() => MockDirective(TargetDirective)).toThrowError(
      /ng-mocks got TargetDirective which has been already mocked by jest.mock/,
    );
    expect(() => MockComponent(TargetPipe)).toThrowError(
      /TargetPipeMock declaration has been passed into ng-mocks without Angular decorators/,
    );
    expect(() =>
      MockBuilder(null, TargetModule).build(),
    ).toThrowError(
      /ng-mocks got TargetModule which has been already mocked by jest.mock/,
    );
  });
});
