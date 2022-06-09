import { InjectionToken, NgModule } from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

const TOKEN_FACTORY1 = new InjectionToken('FACTORY1');
const TOKEN_FACTORY2 = new InjectionToken('FACTORY2');

class DummyClass {}

@NgModule({
  providers: [
    {
      provide: TOKEN_FACTORY1,
      useFactory: () => new DummyClass(),
    },
    {
      provide: TOKEN_FACTORY2,
      useFactory: () => 'hello',
    },
  ],
})
class TargetModule {}

describe('tokens-factory', () => {
  beforeEach(() => MockBuilder().mock(TargetModule));

  // Yes, it is tricky, but we do not have much to do here.
  // If a factory returns something else - it should be replaced with a mock copy manually
  // with a proper value.
  it('mocks TOKEN_FACTORY as an empty object', () => {
    const actual1 = ngMocks.findInstance(TOKEN_FACTORY1);
    expect(actual1).toEqual({});

    const actual2 = ngMocks.findInstance(TOKEN_FACTORY2);
    expect(actual2).toEqual({});
  });
});
