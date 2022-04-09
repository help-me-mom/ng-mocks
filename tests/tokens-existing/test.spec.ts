import { Injectable, InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Injectable()
class Exist1Service {
  public readonly name = 'exist1';
}

@Injectable()
class Exist2Service {
  public readonly name = 'exist2';
}

const TOKEN_EXISTING_MOCK = new InjectionToken('MOCK');
const TOKEN_EXISTING_KEEP = new InjectionToken('KEEP');

@NgModule({
  providers: [
    Exist1Service,
    Exist2Service,
    {
      provide: TOKEN_EXISTING_MOCK,
      useExisting: Exist1Service,
    },
    {
      provide: TOKEN_EXISTING_KEEP,
      useExisting: Exist2Service,
    },
  ],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

// We should do nothing about a useExisting provider, because
// the question comes whether its pointer has been replaced with a mock copy or not.
describe('tokens-existing', () => {
  ngMocks.faster();

  beforeEach(() =>
    MockBuilder().mock(TargetModule).keep(Exist2Service),
  );

  it('resolves TOKEN_EXISTING_MOCK as a mock service', () => {
    const actual = TestBed.get(TOKEN_EXISTING_MOCK);
    expect(actual).toEqual(assertion.any(Exist1Service));
    expect(actual.name).toBeUndefined();
  });

  it('resolves TOKEN_EXISTING_KEEP as a real service', () => {
    const actual = TestBed.get(TOKEN_EXISTING_KEEP);
    expect(actual).toEqual(assertion.any(Exist2Service));
    expect(actual.name).toEqual('exist2');
  });
});
