import { Injectable, NgModule } from '@angular/core';

import { isMockOf, MockBuilder, ngMocks } from 'ng-mocks';

let constructed = 0;

@Injectable({ providedIn: 'root' })
class RootDependency {
  public readonly instance = ++constructed;

  public name(): string {
    return 'dependency';
  }
}

@Injectable()
class TargetService {
  public constructor(public readonly dependency: RootDependency) {}

  public name(): string {
    return 'target';
  }
}

@NgModule({ providers: [TargetService] })
class TargetModule {}

describe('ng-mocks-global-keep:provider dependencies', () => {
  beforeEach(() => {
    constructed = 0;
  });
  afterEach(() => ngMocks.globalWipe(TargetService));

  it('mocks dependencies of an explicitly kept module provider', async () => {
    await MockBuilder(null, TargetModule).keep(TargetService);

    const service = ngMocks.get(TargetService);
    expect(service.name()).toEqual('target');
    expect(service.dependency.name()).toBeUndefined();
    expect(isMockOf(service.dependency, RootDependency)).toBe(true);
    expect(constructed).toEqual(0);
  });

  it('preserves the same dependency policy for a globally kept module provider', async () => {
    ngMocks.globalKeep(TargetService);
    await MockBuilder(null, TargetModule);

    const service = ngMocks.get(TargetService);
    expect(service.name()).toEqual('target');
    expect(service.dependency.name()).toBeUndefined();
    expect(isMockOf(service.dependency, RootDependency)).toBe(true);
    expect(constructed).toEqual(0);
  });
});
