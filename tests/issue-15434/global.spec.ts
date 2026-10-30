import { Injectable, Service } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ngMocks } from 'ng-mocks';

@Service()
class Store {
  public b(): number {
    return 2;
  }
}

@Service({ autoProvided: false })
class LocalStore {}

@Injectable({ providedIn: 'root' })
class InjectableStore {
  public b(): number {
    return 2;
  }
}

// This path intentionally uses native TestBed without MockBuilder.
// @see https://github.com/help-me-mom/ng-mocks/issues/15434
describe('issue-15434:global', () => {
  afterEach(() => {
    ngMocks.globalWipe(Store);
    ngMocks.globalWipe(LocalStore);
    ngMocks.globalWipe(InjectableStore);
  });

  it('does not automatically provide a Service that opts out', () => {
    ngMocks.globalMock(LocalStore);
    TestBed.configureTestingModule({});

    expect(TestBed.inject(LocalStore, null)).toBeNull();
  });

  it('applies a global Service mock outside MockBuilder', () => {
    ngMocks.globalMock(Store);
    TestBed.configureTestingModule({});

    expect(TestBed.inject(Store).b()).toBeUndefined();

    ngMocks.globalWipe(Store);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    expect(TestBed.inject(Store).b()).toEqual(2);
  });

  it('preserves a global Injectable mock outside MockBuilder', () => {
    ngMocks.globalMock(InjectableStore);
    TestBed.configureTestingModule({});

    expect(TestBed.inject(InjectableStore).b()).toBeUndefined();

    ngMocks.globalWipe(InjectableStore);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    expect(TestBed.inject(InjectableStore).b()).toEqual(2);
  });
});
