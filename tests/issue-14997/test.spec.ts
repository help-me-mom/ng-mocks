import { Component, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockComponent,
  MockInstance,
  MockProvider,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class TargetService {
  public '': number | undefined = 1;
  public name = 'original';
}

@Injectable()
class MethodService {
  public ''(): string {
    throw new Error('original method');
  }
}

@Component({
  selector: 'target-14997',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class TargetComponent {
  public '' = 'original';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14997
describe('issue-14997', () => {
  MockInstance.scope('all');
  beforeAll(() => MockInstance(TargetService, '', 42));
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TargetService),
        MockProvider(MethodService),
      ],
    }),
  );

  it('uses the outer empty-string member customization', () => {
    expect(ngMocks.findInstance(TargetService)['']).toBe(42);
  });

  it('preserves a zero value and callback initialization', () => {
    MockInstance(TargetService, instance => {
      instance.name = 'callback';
    });
    expect(MockInstance(TargetService, '', 0)).toBe(0);

    const instance = ngMocks.findInstance(TargetService);
    expect(instance['']).toBe(0);
    expect(instance.name).toBe('callback');
  });

  it('overrides the member with undefined without resetting other customizations', () => {
    MockInstance(TargetService, 'name', 'retained');
    MockInstance(TargetService, '', undefined);

    const instance = ngMocks.findInstance(TargetService);
    expect(instance['']).toBeUndefined();
    expect(instance.name).toBe('retained');
  });

  it('preserves both accessors for an empty-string member', () => {
    const received: Array<number | undefined> = [];
    const getter = () => 7;
    const setter = (value: number | undefined) =>
      received.push(value);
    expect(MockInstance(TargetService, '', getter, 'get')).toBe(
      getter,
    );
    expect(MockInstance(TargetService, '', setter, 'set')).toBe(
      setter,
    );

    const instance = ngMocks.findInstance(TargetService);
    expect(received).toEqual([]);
    expect(instance['']).toBe(7);
    instance[''] = 9;
    expect(received).toEqual([9]);
    expect(instance['']).toBe(7);
  });

  it('does not invoke an empty-name method stub as an initializer', () => {
    let calls = 0;
    const stub = () => {
      calls += 1;
      return 'custom';
    };
    expect(MockInstance(MethodService, '', stub)).toBe(stub);

    const instance = ngMocks.findInstance(MethodService);
    expect(calls).toBe(0);
    expect(instance['']).toBe(stub);
    expect(instance['']()).toBe('custom');
    expect(calls).toBe(1);
  });

  it('customizes the empty-string member on a mocked component', () => {
    const mock = MockComponent(TargetComponent);
    TestBed.configureTestingModule({ declarations: [mock] });
    MockInstance(TargetComponent, '', 'custom');

    const fixture = TestBed.createComponent(mock);
    fixture.detectChanges();
    expect(fixture.componentInstance['']).toBe('custom');
  });

  it('retains an outer customization after case scopes are restored', () => {
    expect(ngMocks.findInstance(TargetService)['']).toBe(42);
  });

  it('still resets a declaration when called without customization arguments', () => {
    MockInstance(TargetService);
    const instance = ngMocks.findInstance(TargetService);
    expect(instance['']).toBeUndefined();
    expect(instance.name).toBeUndefined();
  });
});
