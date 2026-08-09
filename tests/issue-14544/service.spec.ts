import { inject, Service } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Service()
class TargetDependency {
  public static constructed = 0;

  public constructor() {
    TargetDependency.constructed += 1;
  }

  public echo(): string {
    return 'real';
  }
}

@Service()
class TargetService {
  public readonly dependency = inject(TargetDependency);
}

// Angular 22's Service decorator uses the same runtime dependency path as
// Injectable, but it has distinct decorator metadata.
// @see https://github.com/help-me-mom/ng-mocks/issues/14544
describe('issue-14544:Service', () => {
  beforeEach(() =>
    ngMocks.autoSpy(
      typeof jest === 'undefined'
        ? 'jasmine'
        : 'requireActual' in jest
          ? 'jest'
          : 'vitest',
    ),
  );
  afterEach(() => ngMocks.autoSpy('reset'));

  beforeEach(() => {
    TargetDependency.constructed = 0;
  });

  beforeEach(() => MockBuilder(TargetService));

  it('mocks inject dependencies of the kept service', () => {
    const service = MockRender(TargetService).point.componentInstance;

    service.dependency.echo();

    expect(service.dependency.echo).toHaveBeenCalledTimes(1);
    expect(TargetDependency.constructed).toBe(0);
  });
});
