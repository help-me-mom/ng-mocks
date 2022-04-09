import { Injectable, InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Injectable()
class Class1Service {
  public constructor(public readonly name: string) {}
}

@Injectable()
class Class2Service {
  public readonly name = 'class2';
}

const TOKEN_CLASS_MOCK = new InjectionToken('MOCK');
const TOKEN_CLASS_KEEP = new InjectionToken('KEEP');

@NgModule({
  providers: [
    {
      provide: 'name',
      useValue: 'useValue',
    },
    {
      deps: ['name'],
      provide: Class1Service,
      useClass: Class1Service,
    },
    Class2Service,
    {
      deps: ['name'],
      provide: TOKEN_CLASS_MOCK,
      useClass: Class1Service,
    },
    {
      deps: ['name'],
      provide: TOKEN_CLASS_KEEP,
      useClass: Class2Service,
    },
  ],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

// useClass ignores existing services with the same class name, but
// ng-mocks still detects whether the class should be replaced with a mock copy or not.
describe('tokens-class', () => {
  ngMocks.faster();

  beforeEach(() =>
    MockBuilder().mock(TargetModule).keep(Class2Service),
  );

  it('resolves Class1Service as a mock instance', () => {
    const actual = TestBed.get(Class1Service);
    expect(actual).toEqual(assertion.any(Class1Service));
    expect(actual.name).toBeUndefined();
  });

  it('resolves Class2Service as a real instance', () => {
    const actual = TestBed.get(Class2Service);
    expect(actual).toEqual(assertion.any(Class2Service));
    expect(actual.name).toEqual('class2');
  });

  it('resolves TOKEN_EXISTING_MOCK as a mock instance', () => {
    const actual = TestBed.get(TOKEN_CLASS_MOCK);
    expect(actual).toEqual(assertion.any(Class1Service));
    expect(actual.name).toBeUndefined();
  });

  it('resolves TOKEN_EXISTING_KEEP as a real instance', () => {
    const actual = TestBed.get(TOKEN_CLASS_KEEP);
    expect(actual).toEqual(assertion.any(Class2Service));
    expect(actual.name).toEqual('class2');
  });
});
