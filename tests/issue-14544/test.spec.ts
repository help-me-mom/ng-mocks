import {
  ENVIRONMENT_INITIALIZER,
  inject,
  Injectable,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class TargetDependency {
  public static constructed = 0;

  public constructor() {
    TargetDependency.constructed += 1;
  }

  public echo(): string {
    return 'real';
  }
}

@Injectable({ providedIn: 'root' })
class TargetConstructorService {
  public constructor(public readonly dependency: TargetDependency) {}
}

@Injectable({ providedIn: 'root' })
class TargetRootService {
  public readonly dependency = inject(TargetDependency);
}

@Injectable()
class TargetLocalService {
  public readonly dependency = inject(TargetDependency);
}

@Injectable({ providedIn: 'root' })
class TargetEagerService {
  public readonly dependency = inject(TargetDependency);
}

// inject() field dependencies are absent from constructor metadata, so kept
// services need the same runtime mocking window as standalone declarations.
// @see https://github.com/help-me-mom/ng-mocks/issues/14544
describe('issue-14544', () => {
  beforeEach(() => {
    TargetDependency.constructed = 0;
  });

  describe('constructor injection', () => {
    beforeEach(() => MockBuilder(TargetConstructorService));

    it('mocks dependencies of the kept service', () => {
      const service = MockRender(TargetConstructorService).point
        .componentInstance;

      service.dependency.echo();

      expect(service.dependency.echo).toHaveBeenCalledTimes(1);
      expect(TargetDependency.constructed).toBe(0);
    });
  });

  describe('inject in a root service', () => {
    beforeEach(() => MockBuilder(TargetRootService));

    it('keeps mocking dependencies after an inject migration', () => {
      const service =
        MockRender(TargetRootService).point.componentInstance;

      service.dependency.echo();

      expect(service.dependency.echo).toHaveBeenCalledTimes(1);
      expect(TargetDependency.constructed).toBe(0);
    });
  });

  describe('inject in a local service', () => {
    beforeEach(() => MockBuilder(TargetLocalService));

    it('mocks dependencies when the service is provided by MockBuilder', () => {
      const service = MockRender(TargetLocalService).point
        .componentInstance;

      service.dependency.echo();

      expect(service.dependency.echo).toHaveBeenCalledTimes(1);
      expect(TargetDependency.constructed).toBe(0);
    });
  });

  describe('inject during environment initialization', () => {
    beforeEach(() =>
      MockBuilder(TargetEagerService).provide({
        multi: true,
        provide: ENVIRONMENT_INITIALIZER,
        useValue: () => {
          inject(TargetEagerService);
        },
      }),
    );

    it('mocks dependencies before an earlier initializer creates the service', () => {
      const service = MockRender(TargetEagerService).point
        .componentInstance;

      service.dependency.echo();

      expect(service.dependency.echo).toHaveBeenCalledTimes(1);
      expect(TargetDependency.constructed).toBe(0);
    });
  });
});
