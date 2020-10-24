import { Injectable, InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, ngMocks } from 'ng-mocks';

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

describe('TestToken', () => {
  ngMocks.faster();

  // Because we want to test the tokens, we pass them in .keep in
  // the chain on MockBuilder. To correctly satisfy their
  // initialization we need to pass its module as the second
  // parameter.
  beforeEach(() =>
    MockBuilder().mock(TargetModule).keep(TOKEN_CLASS).keep(TOKEN_EXISTING).keep(TOKEN_FACTORY).keep(TOKEN_VALUE)
  );

  it('creates TOKEN_CLASS', () => {
    const token = TestBed.get(TOKEN_CLASS);

    // Verifying that the token is an instance of ServiceClass.
    expect(token).toEqual(jasmine.any(ServiceClass));
    expect(token.name).toEqual('class');
  });

  it('creates TOKEN_EXISTING', () => {
    const token = TestBed.get(TOKEN_EXISTING);

    // Verifying that the token is an instance of ServiceExisting.
    // But because it has been mocked we should see an empty name.
    expect(token).toEqual(jasmine.any(ServiceExisting));
    expect(token.name).toBeUndefined();
  });

  it('creates TOKEN_FACTORY', () => {
    const token = TestBed.get(TOKEN_FACTORY);

    // Checking that we have here what factory has been created.
    expect(token).toEqual('FACTORY');
  });

  it('creates TOKEN_VALUE', () => {
    const token = TestBed.get(TOKEN_VALUE);

    // Checking the set value.
    expect(token).toEqual('VALUE');
  });
});
