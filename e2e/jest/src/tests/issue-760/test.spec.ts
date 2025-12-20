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
    try {
      MockModule(TargetModule);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'ng-mocks got TargetModule which has been already mocked by jest.mock',
      );
    }
    try {
      MockComponent(TargetComponent);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'ng-mocks got TargetComponent which has been already mocked by jest.mock',
      );
    }
    try {
      MockDirective(TargetDirective);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'ng-mocks got TargetDirective which has been already mocked by jest.mock',
      );
    }
    try {
      MockComponent(TargetPipe);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'TargetPipeMock declaration has been passed into ng-mocks without Angular decorators',
      );
    }
    try {
      MockBuilder(null, TargetModule).build();
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'ng-mocks got TargetModule which has been already mocked by jest.mock',
      );
    }
  });
});
