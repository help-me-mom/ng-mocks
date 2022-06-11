import { Injectable, InjectionToken, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const TOKEN_CLASS = new InjectionToken('CLASS');
const TOKEN_EXISTING = new InjectionToken('EXISTING');
const TOKEN_FACTORY = new InjectionToken('FACTORY');
const TOKEN_VALUE = new InjectionToken('VALUE');

class ServiceClass {
  public readonly name = 'class';
}

@Injectable()
class ServiceExisting {
  public readonly name = 'existing';
}

// A module that provides all services.
@NgModule({
  providers: [
    ServiceExisting,
    {
      provide: TOKEN_CLASS,
      useClass: ServiceClass,
    },
    {
      provide: TOKEN_EXISTING,
      useExisting: ServiceExisting,
    },
    {
      provide: TOKEN_FACTORY,
      useFactory: () => 'FACTORY',
    },
    {
      provide: TOKEN_VALUE,
      useValue: 'VALUE',
    },
  ],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('TestToken', () => {
  ngMocks.faster();

  // Because we want to test the tokens, we pass them in .keep in
  // the chain on MockBuilder. To correctly satisfy their
  // initialization we need to pass its module as the second
  // parameter.
  beforeEach(() => {
    return MockBuilder(
      [TOKEN_CLASS, TOKEN_EXISTING, TOKEN_FACTORY, TOKEN_VALUE],
      TargetModule,
    );
  });

  it('creates TOKEN_CLASS', () => {
    const token =
      MockRender<ServiceClass>(TOKEN_CLASS).point.componentInstance;

    // Verifying that the token is an instance of ServiceClass.
    expect(token).toEqual(assertion.any(ServiceClass));
    expect(token.name).toEqual('class');
  });

  it('creates TOKEN_EXISTING', () => {
    const token =
      MockRender<ServiceExisting>(TOKEN_EXISTING).point
        .componentInstance;

    // Verifying that the token is an instance of ServiceExisting.
    // But because it has been replaced with a mock copy,
    // we should see an empty name.
    expect(token).toEqual(assertion.any(ServiceExisting));
    expect(token.name).toBeUndefined();
  });

  it('creates TOKEN_FACTORY', () => {
    const token = MockRender(TOKEN_FACTORY).point.componentInstance;

    // Checking that we have here what factory has been created.
    expect(token).toEqual('FACTORY');
  });

  it('creates TOKEN_VALUE', () => {
    const token = MockRender(TOKEN_VALUE).point.componentInstance;

    // Checking the set value.
    expect(token).toEqual('VALUE');
  });
});
