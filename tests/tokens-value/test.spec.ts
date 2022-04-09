import { InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

const TOKEN_OBJECT = new InjectionToken('OBJECT');
const TOKEN_CLASS = new InjectionToken('CLASS');
const TOKEN_BOOLEAN = new InjectionToken('BOOLEAN');
const TOKEN_NUMBER = new InjectionToken('NUMBER');
const TOKEN_STRING = new InjectionToken('STRING');
const TOKEN_NULL = new InjectionToken('NULL');

class DummyClass {}

@NgModule({
  providers: [
    {
      provide: TOKEN_OBJECT,
      useValue: {
        func: () => 'hello',
        prop: 123,
      },
    },
    {
      provide: TOKEN_CLASS,
      useValue: DummyClass,
    },
    {
      provide: TOKEN_BOOLEAN,
      useValue: true,
    },
    {
      provide: TOKEN_NUMBER,
      useValue: 5,
    },
    {
      provide: TOKEN_STRING,
      useValue: 'hello',
    },
    {
      provide: TOKEN_NULL,
      useValue: null,
    },
  ],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('tokens-value', () => {
  ngMocks.faster();

  beforeEach(() => MockBuilder().mock(TargetModule));

  it('mocks TOKEN_OBJECT via MockService', () => {
    const actual = TestBed.get(TOKEN_OBJECT);
    expect(actual).toEqual({
      func: assertion.anything(),
    });
    expect(actual.func()).toBeUndefined();
  });

  it('mocks TOKEN_CLASS as undefined', () => {
    const actual = TestBed.get(TOKEN_CLASS);
    expect(actual).toBeUndefined();
  });

  it('mocks TOKEN_BOOLEAN as false', () => {
    const actual = TestBed.get(TOKEN_BOOLEAN);
    expect(actual).toBe(false);
  });

  it('mocks TOKEN_NUMBER as 0', () => {
    const actual = TestBed.get(TOKEN_NUMBER);
    expect(actual).toBe(0);
  });

  it('mocks TOKEN_STRING as an empty string', () => {
    const actual = TestBed.get(TOKEN_STRING);
    expect(actual).toBe('');
  });

  it('mocks TOKEN_NULL as null', () => {
    const actual = TestBed.get(TOKEN_NULL);
    expect(actual).toBe(null);
  });
});
