import { NgModule, Service } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockBuilder, ngMocks } from 'ng-mocks';

let constructed = 0;

// Opting out makes exclusion observable without falling back to a root instance.
@Service({ autoProvided: false })
class TargetService {
  public readonly instance = ++constructed;

  public name(): string {
    return 'target';
  }
}

@NgModule({
  providers: [TargetService],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15478
describe('issue-15478:recursive', () => {
  beforeEach(() => {
    constructed = 0;
  });
  afterEach(() => {
    ngMocks.globalWipe(TargetModule);
    ngMocks.globalWipe(TargetService);
  });

  it('keeps a module-provided Service without automatically providing it', async () => {
    ngMocks.globalKeep(TargetModule, true);
    await MockBuilder(null, TargetModule);

    const service = TestBed.inject(TargetService);
    expect(isMockOf(service, TargetService, 'i')).toBe(false);
    expect(service.name()).toEqual('target');
    expect(constructed).toEqual(1);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    expect(TestBed.inject(TargetService, null)).toBeNull();
    expect(constructed).toEqual(1);
  });

  it('mocks a Service reached through a kept module without constructing it', async () => {
    ngMocks.globalMock(TargetModule, true);
    await MockBuilder(TargetModule);

    const service = TestBed.inject(TargetService);
    expect(isMockOf(service, TargetService, 'i')).toBe(true);
    expect(service.name()).toBeUndefined();
    expect(constructed).toEqual(0);
  });

  it('excludes a Service reached through a module without constructing it', async () => {
    ngMocks.globalExclude(TargetModule, true);
    await MockBuilder(TargetModule);

    expect(TestBed.inject(TargetService, null)).toBeNull();
    expect(constructed).toEqual(0);
  });

  it('wipes recursive keep policies and Service default customizations', async () => {
    let customized = 0;
    ngMocks.globalKeep(TargetModule);
    ngMocks.globalKeep(TargetService);
    ngMocks.defaultMock(TargetService, () => {
      customized += 1;

      return { name: () => 'custom' };
    });

    ngMocks.globalWipe(TargetModule, true);
    await MockBuilder(null, TargetModule);

    const service = TestBed.inject(TargetService);
    expect(isMockOf(service, TargetService, 'i')).toBe(true);
    expect(service.name()).toBeUndefined();
    expect(constructed).toEqual(0);
    expect(customized).toEqual(0);
  });
});
