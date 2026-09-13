import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, MockProvider, ngMocks } from 'ng-mocks';

const member = Symbol('member');
const otherMember = Symbol('member');

@Injectable()
class TargetService {
  public 0: string | undefined = 'zero';
  public 2: string | undefined = 'two';
  public [member]: string | undefined = 'symbol';
  public [otherMember]: string | undefined = 'other';
}

// Numeric and symbol keyof members require TypeScript 2.9 (Angular 6 in the spread matrix).
// @see https://github.com/help-me-mom/ng-mocks/issues/14997
describe('issue-14997:property-keys', () => {
  MockInstance.scope();
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [MockProvider(TargetService)],
    }),
  );

  const keys: Array<keyof TargetService> = [0, 2, member];
  for (const key of keys) {
    describe(String(key), () => {
      it('sets a member value and returns it', () => {
        expect(MockInstance(TargetService, key, 'custom')).toBe(
          'custom',
        );
        expect(ngMocks.findInstance(TargetService)[key]).toBe(
          'custom',
        );
      });

      it('preserves an empty-string member value', () => {
        MockInstance(TargetService, key, 'previous');
        expect(MockInstance(TargetService, key, '')).toBe('');
        expect(ngMocks.findInstance(TargetService)[key]).toBe('');
      });

      it('preserves an explicit undefined member value', () => {
        MockInstance(TargetService, key, 'previous');
        MockInstance(TargetService, key, undefined);
        expect(
          ngMocks.findInstance(TargetService)[key],
        ).toBeUndefined();
      });

      it('retains a getter when setting the setter', () => {
        const received: Array<string | undefined> = [];
        const getter = () => 'get';
        const setter = (value: string | undefined) =>
          received.push(value);
        expect(MockInstance(TargetService, key, getter, 'get')).toBe(
          getter,
        );
        expect(MockInstance(TargetService, key, setter, 'set')).toBe(
          setter,
        );

        const instance = ngMocks.findInstance(TargetService);
        expect(received).toEqual([]);
        expect(instance[key]).toBe('get');
        instance[key] = 'set';
        expect(received).toEqual(['set']);
        expect(instance[key]).toBe('get');
      });

      it('retains a setter when setting the getter', () => {
        const received: Array<string | undefined> = [];
        const setter = (value: string | undefined) =>
          received.push(value);
        MockInstance(TargetService, key, setter, 'set');
        MockInstance(TargetService, key, () => 'get', 'get');

        const instance = ngMocks.findInstance(TargetService);
        instance[key] = 'set';
        expect(received).toEqual(['set']);
        expect(instance[key]).toBe('get');
      });
    });
  }

  it('keeps symbols with the same description independent', () => {
    MockInstance(TargetService, member, 'first');
    MockInstance(TargetService, otherMember, 'second');

    const instance = ngMocks.findInstance(TargetService);
    expect(instance[member]).toBe('first');
    expect(instance[otherMember]).toBe('second');
  });
});
