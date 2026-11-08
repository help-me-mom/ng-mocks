import {
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
} from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

const DEPENDENCY = new InjectionToken<string>('DEPENDENCY');
const CLASS = new InjectionToken<{ value: string }>('CLASS');
const FACTORY = new InjectionToken<{ value: string }>('FACTORY');
const ALIAS = new InjectionToken<{ value: string }>('ALIAS');
const MULTI = new InjectionToken<Array<boolean | number | string>>(
  'MULTI',
);
const NULL = new InjectionToken<null>('NULL');
const UNDEFINED = new InjectionToken<undefined>('UNDEFINED');
let constructed = 0;
let created = 0;

@Injectable()
class TargetService {
  public constructor(
    @Inject(DEPENDENCY) public readonly value: string,
  ) {
    constructed += 1;
  }
}

@NgModule({
  providers: [
    { provide: DEPENDENCY, useValue: 'dependency' },
    { provide: CLASS, useClass: TargetService, deps: [DEPENDENCY] },
    {
      provide: FACTORY,
      useFactory: (value: string) => {
        created += 1;

        return { value };
      },
      deps: [DEPENDENCY],
    },
    { provide: ALIAS, useExisting: CLASS },
    { provide: MULTI, useValue: false, multi: true },
    { provide: MULTI, useValue: 0, multi: true },
    { provide: MULTI, useValue: '', multi: true },
    { provide: NULL, useValue: null },
    { provide: UNDEFINED, useValue: undefined },
  ],
})
class TargetModule {}

describe('ng-mocks-global-keep:provider recipes', () => {
  beforeEach(() => {
    constructed = 0;
    created = 0;
  });
  afterEach(() => {
    ngMocks.globalWipe(TargetModule, true);
  });

  it('retains original class, factory, alias and multi recipes with their dependencies and falsy values', async () => {
    ngMocks.globalKeep(TargetModule, true);
    await MockBuilder(null, TargetModule);

    expect(constructed).toEqual(0);
    expect(created).toEqual(0);
    expect(ngMocks.get(CLASS).value).toEqual('dependency');
    expect(ngMocks.get(FACTORY).value).toEqual('dependency');
    expect(ngMocks.get(ALIAS)).toBe(ngMocks.get(CLASS));
    expect(ngMocks.get(MULTI)).toEqual([false, 0, '']);
    expect(ngMocks.get(NULL)).toBeNull();
    expect(ngMocks.get(UNDEFINED)).toBeUndefined();
    expect(constructed).toEqual(1);
    expect(created).toEqual(1);
  });

  it('resolves dependencies of kept recipes using the current explicit override', async () => {
    ngMocks.globalKeep(TargetModule, true);
    await MockBuilder(null, TargetModule).mock(
      DEPENDENCY,
      'override',
    );

    expect(ngMocks.get(CLASS).value).toEqual('override');
    expect(ngMocks.get(FACTORY).value).toEqual('override');
    expect(ngMocks.get(ALIAS)).toBe(ngMocks.get(CLASS));
    expect(constructed).toEqual(1);
    expect(created).toEqual(1);
  });
});
