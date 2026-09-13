import { Injectable, NgModule } from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

const request = Symbol('implementation-request');
const sideEffects: string[] = [];

@Injectable()
abstract class AbstractService {
  public constructor() {
    sideEffects.push('abstract constructor');
  }
}

@Injectable()
class ConcreteService extends AbstractService {
  public constructor() {
    super();
    sideEffects.push('concrete constructor');
  }

  public ordinary(): string {
    sideEffects.push('ordinary method');

    return 'real';
  }

  public [request](): string {
    sideEffects.push('symbol method');

    return 'real';
  }
}

@NgModule({
  providers: [
    { provide: AbstractService, useClass: ConcreteService },
  ],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14999
describe('issue-14999:providers', () => {
  beforeEach(() => {
    sideEffects.length = 0;

    return MockBuilder(null, TargetModule);
  });

  it('copies implementation-only symbol methods while retaining the abstract token identity', () => {
    const instance = ngMocks.get(AbstractService);
    const ordinary = (
      Object.getOwnPropertyDescriptor(instance, 'ordinary') || {
        value: undefined,
      }
    ).value as () => string;
    const method = (
      Object.getOwnPropertyDescriptor(instance, request) || {
        value: undefined,
      }
    ).value as () => string;

    expect(instance).toBe(ngMocks.get(AbstractService));
    expect(Object.getPrototypeOf(instance)).toBe(
      AbstractService.prototype,
    );
    expect(ordinary()).toBeUndefined();
    expect(sideEffects).toEqual([]);

    // The method exists only on useClass, so mocking the token alone cannot supply it.
    expect(typeof method).toBe('function');
    expect(method()).toBeUndefined();
    expect(sideEffects).toEqual([]);
  });
});
