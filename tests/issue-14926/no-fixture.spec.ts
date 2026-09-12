import { Inject, Injectable, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ngMocks } from 'ng-mocks';

const FAILING_TOKEN = new InjectionToken<string>(
  'failing-token-14926',
);
const MISSING_TOKEN = new InjectionToken<string>(
  'missing-dependency-14926',
);
const UNDEFINED_TOKEN = new InjectionToken<undefined>(
  'undefined-14926',
);
const NULL_TOKEN = new InjectionToken<null>('null-14926');
const FALSE_TOKEN = new InjectionToken<boolean>('false-14926');
const OBJECT_TOKEN = new InjectionToken<object>('object-14926');

@Injectable()
class NestedService {
  public constructor(
    @Inject(FAILING_TOKEN) public readonly value: string,
  ) {}
}

@Injectable()
class PresentService {
  public constructor(
    @Inject(MISSING_TOKEN) public readonly value: string,
  ) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14926
describe('issue-14926:no-fixture', () => {
  let originalError: Error;
  let instance: object;

  beforeEach(() => {
    originalError = new Error('original provider failure 14926');
    instance = {};

    return TestBed.configureTestingModule({
      providers: [
        NestedService,
        PresentService,
        {
          provide: FAILING_TOKEN,
          useFactory: () => {
            throw originalError;
          },
        },
        { provide: UNDEFINED_TOKEN, useValue: undefined },
        { provide: NULL_TOKEN, useValue: null },
        { provide: FALSE_TOKEN, useValue: false },
        { provide: OBJECT_TOKEN, useFactory: () => instance },
      ],
    }).compileComponents();
  });

  it('forwards a lazy factory error from plural lookup', () => {
    let caught = false;
    try {
      ngMocks.findInstances(FAILING_TOKEN);
    } catch (error) {
      caught = true;
      expect(error).toBe(originalError);
    }

    expect(caught).toBe(true);
  });

  it('forwards a nested service dependency error from plural lookup', () => {
    let caught = false;
    try {
      ngMocks.findInstances(NestedService);
    } catch (error) {
      caught = true;
      expect(error).toBe(originalError);
    }

    expect(caught).toBe(true);
  });

  for (const lookup of ['findInstance', 'get', 'findInstances']) {
    it(`preserves a present service's missing dependency through ${lookup}`, () => {
      let caught = false;
      try {
        if (lookup === 'findInstance') {
          ngMocks.findInstance(PresentService);
        } else if (lookup === 'get') {
          ngMocks.get(PresentService);
        } else {
          ngMocks.findInstances(PresentService);
        }
      } catch (error) {
        caught = true;
        expect((error as Error).message).toContain(
          'missing-dependency-14926',
        );
        expect((error as Error).message).toContain('No provider');
      }

      expect(caught).toBe(true);
    });
  }

  it('returns an empty collection only when the requested provider is absent', () => {
    expect(ngMocks.findInstances(MISSING_TOKEN)).toEqual([]);
  });

  it('preserves successful undefined, null, false and object provider values', () => {
    expect(ngMocks.findInstances(UNDEFINED_TOKEN)).toEqual([
      undefined,
    ]);
    expect(ngMocks.findInstances(NULL_TOKEN)).toEqual([null]);
    expect(ngMocks.findInstances(FALSE_TOKEN)).toEqual([false]);
    const instances = ngMocks.findInstances(OBJECT_TOKEN);
    expect(instances.length).toBe(1);
    expect(instances[0]).toBe(instance);
  });
});
