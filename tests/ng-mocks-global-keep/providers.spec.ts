import { Injectable, InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockBuilder, MockModule, ngMocks } from 'ng-mocks';

let constructed = 0;

@Injectable()
class TargetService {
  public readonly instance = ++constructed;

  public name(): string {
    return 'target';
  }
}

const VALUE = new InjectionToken<boolean>('VALUE');
const ALIAS = new InjectionToken<TargetService>('ALIAS');

@NgModule({
  providers: [
    TargetService,
    { provide: VALUE, useValue: true },
    { provide: ALIAS, useExisting: TargetService },
  ],
})
class TargetModule {}

// Global keeps discovered through module providers must retain the original recipes.
// @see https://github.com/help-me-mom/ng-mocks/issues/15478
describe('ng-mocks-global-keep:providers', () => {
  beforeEach(() => {
    constructed = 0;
  });
  afterEach(() => {
    ngMocks.globalWipe(TargetModule);
    ngMocks.globalWipe(TargetService);
    ngMocks.globalWipe(VALUE);
    ngMocks.globalWipe(ALIAS);
  });

  it('keeps the equivalent Injectable module provider', async () => {
    ngMocks.globalKeep(TargetModule, true);
    await MockBuilder(null, TargetModule);

    expect(ngMocks.get(TargetService).name()).toEqual('target');
    expect(constructed).toEqual(1);
    expect(ngMocks.get(ALIAS)).toBe(ngMocks.get(TargetService));
    expect(ngMocks.get(VALUE)).toBe(true);
  });

  it('keeps providers when using MockModule directly', () => {
    ngMocks.globalKeep(TargetService);
    ngMocks.globalKeep(VALUE);
    TestBed.configureTestingModule({
      imports: [MockModule(TargetModule)],
    });

    expect(ngMocks.get(TargetService).name()).toEqual('target');
    expect(ngMocks.get(VALUE)).toBe(true);
    expect(constructed).toEqual(1);
  });

  it('allows explicit mocks to override global keeps', async () => {
    ngMocks.globalKeep(TargetModule, true);
    await MockBuilder(null, TargetModule)
      .mock(TargetService, { name: () => 'mock' })
      .mock(VALUE, false);

    expect(ngMocks.get(TargetService).name()).toEqual('mock');
    expect(isMockOf(ngMocks.get(TargetService), TargetService)).toBe(
      true,
    );
    expect(ngMocks.get(ALIAS)).toBe(ngMocks.get(TargetService));
    expect(ngMocks.get(VALUE)).toBe(false);
    expect(constructed).toEqual(0);
  });

  it('allows explicit exclusions to override global keeps', async () => {
    ngMocks.globalKeep(TargetModule, true);
    await MockBuilder(null, TargetModule)
      .exclude(TargetService)
      .exclude(ALIAS)
      .exclude(VALUE);

    expect(() => ngMocks.get(TargetService)).toThrow();
    expect(() => ngMocks.get(ALIAS)).toThrow();
    expect(() => ngMocks.get(VALUE)).toThrow();
    expect(constructed).toEqual(0);
  });

  it('uses current keep and exclude choices after a provider mock was cached', async () => {
    await MockBuilder(null, TargetModule);
    expect(ngMocks.get(TargetService).name()).toBeUndefined();
    expect(constructed).toEqual(0);

    TestBed.resetTestingModule();
    ngMocks.globalKeep(TargetService);
    await MockBuilder(null, TargetModule);

    expect(ngMocks.get(TargetService).name()).toEqual('target');
    expect(constructed).toEqual(1);

    TestBed.resetTestingModule();
    ngMocks.globalExclude(TargetService);
    await MockBuilder(null, TargetModule).exclude(ALIAS);

    expect(() => ngMocks.get(TargetService)).toThrow();
    expect(constructed).toEqual(1);

    TestBed.resetTestingModule();
    ngMocks.globalWipe(TargetService);
    await MockBuilder(null, TargetModule);

    expect(ngMocks.get(TargetService).name()).toBeUndefined();
    expect(constructed).toEqual(1);
  });

  it('reuses a module safely when its provider keep policy stays the same', () => {
    ngMocks.globalKeep(TargetService);
    const first = MockModule(TargetModule);
    const second = MockModule(TargetModule);
    TestBed.configureTestingModule({ imports: [second] });

    expect(second).toBe(first);
    expect(ngMocks.get(TargetService).name()).toEqual('target');
    expect(constructed).toEqual(1);
  });
});
