import { Injectable } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
class SomeService {
  someMethod(x: string) {
    return x;
  }
}

@Injectable()
class ServiceToTest {
  constructor(public someService: SomeService) {}

  foo(x: string) {
    return this.someService.someMethod(x);
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/3265
describe('issue-3265', () => {
  beforeEach(() =>
    MockBuilder(ServiceToTest, SomeService).mock(SomeService, {
      someMethod:
        typeof jest === 'undefined'
          ? jasmine.createSpy().and.callFake((x: string) => x)
          : // in case of jest
            jest.fn((x: string) => x),
    }),
  );

  it('should do something', () => {
    const serviceToTest =
      MockRender(ServiceToTest).point.componentInstance;
    const someServiceSpy = ngMocks.get(SomeService);

    const result = serviceToTest.foo('hello world');

    expect(result).toBe('hello world');
    expect(someServiceSpy.someMethod).toHaveBeenCalled();
  });
});
