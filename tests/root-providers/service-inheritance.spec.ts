import { Injectable, Service } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder } from 'ng-mocks';

@Injectable({
  providedIn: 'root',
  useFactory: () => ({ origin: 'parent Injectable factory' }),
})
class InjectableParent {
  public origin = 'parent class';
}

@Service({ factory: () => ({ origin: 'child Service factory' }) })
class ServiceChild extends InjectableParent {}

@Service({ factory: () => ({ origin: 'parent Service factory' }) })
class ServiceParent {
  public origin = 'parent class';
}

@Injectable({
  providedIn: 'root',
  useFactory: () => ({ origin: 'child Injectable factory' }),
})
class InjectableChild extends ServiceParent {}

// Kept root providers must use the child's recipe across decorator migrations.
// @see https://github.com/help-me-mom/ng-mocks/issues/15434
describe('root-providers:Service inheritance', () => {
  it('uses an own Service factory with native TestBed', () => {
    TestBed.configureTestingModule({});

    expect(TestBed.inject(ServiceChild).origin).toEqual(
      'child Service factory',
    );
  });

  it('keeps an own Service factory over an inherited Injectable factory', async () => {
    await MockBuilder(ServiceChild);

    expect(TestBed.inject(ServiceChild).origin).toEqual(
      'child Service factory',
    );
  });

  it('uses an own Injectable factory with native TestBed', () => {
    TestBed.configureTestingModule({});

    expect(TestBed.inject(InjectableChild).origin).toEqual(
      'child Injectable factory',
    );
  });

  it('keeps an own Injectable factory over an inherited Service factory', async () => {
    await MockBuilder(InjectableChild);

    expect(TestBed.inject(InjectableChild).origin).toEqual(
      'child Injectable factory',
    );
  });
});
