import { Injectable } from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  echo() {
    return this.constructor.name;
  }
}

declare module 'ng-mocks' {
  interface IMockBuilderExtended {
    customMock(value: string): this;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/5417
// A way to extend MockBuilder
describe('issue-5417', () => {
  beforeAll(() => {
    MockBuilder.extend('customMock', (builder, [value]: [string]) => {
      builder.mock(TargetService, {
        echo: () => value,
      });
    });
  });
  afterAll(() => MockBuilder.extend('customMock'));

  describe('usage', () => {
    beforeEach(() => MockBuilder().customMock('mock'));

    it('uses custom logic', () => {
      const instance = ngMocks.get(TargetService);
      expect(instance.echo()).toEqual('mock');
    });
  });

  describe('core', () => {
    it('throws on existing methods', () => {
      MockBuilder.extend('mock', () => undefined);
      expect(MockBuilder).toThrowError(
        /MockBuilder.mock is a base method/,
      );
      MockBuilder.extend('mock');
      expect(MockBuilder).not.toThrow();
    });

    it('chains customizations back to the initial instance', () => {
      const instance = MockBuilder();
      expect(
        instance.customMock('mock').provide([]).customMock('real'),
      ).toBe(instance);
    });
  });
});
