import {
  Component,
  Inject,
  InjectionToken,
  Pipe,
  PipeTransform,
} from '@angular/core';

import {
  isMockOf,
  MockBuilder,
  MockRender,
  MockRenderFactory,
  ngMocks,
} from 'ng-mocks';

const constructorError = new Error('issue-14926 pipe constructor');
const localFactoryError = new Error('issue-14926 local pipe factory');
let localFactoryCalls = 0;
const MISSING_PIPE_DEPENDENCY = new InjectionToken<string>(
  'issue-14926 missing pipe dependency',
);

@Pipe({
  name: 'target',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetPipe implements PipeTransform {
  public transform(value: string): string {
    return `pipe:${value}`;
  }
}

@Component({
  selector: 'local-pipe',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<span></span>',
  providers: [
    {
      provide: TargetPipe,
      useFactory: () => {
        localFactoryCalls += 1;
        throw localFactoryError;
      },
    },
  ],
})
class LocalPipeComponent {}

@Pipe({
  name: 'throwing',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class ThrowingPipe implements PipeTransform {
  public constructor() {
    throw constructorError;
  }

  public transform(value: string): string {
    return value;
  }
}

@Pipe({
  name: 'missingDependency',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class MissingDependencyPipe implements PipeTransform {
  public constructor(
    @Inject(MISSING_PIPE_DEPENDENCY) public readonly prefix: string,
  ) {}

  public transform(value: string): string {
    return this.prefix + value;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14926
describe('issue-14926:pipe', () => {
  it('preserves a provided pipe factory error', async () => {
    const factoryError = new Error('issue-14926 pipe factory');
    await MockBuilder(TargetPipe).provide({
      provide: TargetPipe,
      useFactory: () => {
        throw factoryError;
      },
    });

    // A provided pipe failure must not become the missing-provider hint.
    try {
      MockRender(TargetPipe);
      fail('an error expected');
    } catch (error) {
      expect(error).toBe(factoryError);
    }
  });

  it('preserves a provided pipe constructor error', async () => {
    await MockBuilder(ThrowingPipe).provide(ThrowingPipe);

    try {
      MockRender(ThrowingPipe);
      fail('an error expected');
    } catch (error) {
      expect(error).toBe(constructorError);
    }
  });

  it('preserves a provided pipe missing dependency error', async () => {
    await MockBuilder(MissingDependencyPipe)
      .provide(MissingDependencyPipe)
      .exclude(MISSING_PIPE_DEPENDENCY);

    try {
      MockRender(MissingDependencyPipe);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toMatch(
        /No provider( found)? for/,
      );
      expect((error as Error).message).toContain(
        'issue-14926 missing pipe dependency',
      );
      expect((error as Error).message).not.toContain(
        'Did you forget to set $implicit param',
      );
    }
  });

  it('preserves the pipe error through a prepared render factory', async () => {
    const factoryError = new Error('issue-14926 render factory');
    await MockBuilder(TargetPipe).provide({
      provide: TargetPipe,
      useFactory: () => {
        throw factoryError;
      },
    });
    const factory = MockRenderFactory(TargetPipe);
    factory.configureTestBed();

    try {
      factory();
      fail('an error expected');
    } catch (error) {
      expect(error).toBe(factoryError);
    }
  });

  it('keeps the hint when a declared pipe has no provider', async () => {
    await MockBuilder(TargetPipe);

    try {
      MockRender(TargetPipe);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `Cannot render ${TargetPipe.name}.`,
      );
      expect((error as Error).message).toContain(
        'Did you forget to set $implicit param, or add the pipe to providers?',
      );
    }
  });

  it('renders the real provided pipe instance', async () => {
    const provided = new TargetPipe();
    await MockBuilder(TargetPipe).provide({
      provide: TargetPipe,
      useValue: provided,
    });

    const fixture = MockRender(TargetPipe);

    expect(fixture.point.componentInstance).toBe(provided);
    expect(
      isMockOf(fixture.point.componentInstance, TargetPipe),
    ).toBe(false);
    expect(
      fixture.point.componentInstance.transform('value'),
    ).toEqual('pipe:value');
  });

  for (const lookup of ['get', 'findInstance', 'findInstances']) {
    it(`preserves a lazy local pipe factory error through ${lookup}`, async () => {
      localFactoryCalls = 0;
      await MockBuilder(LocalPipeComponent).keep(TargetPipe);
      const fixture = MockRender(LocalPipeComponent);
      expect(
        isMockOf(fixture.point.componentInstance, LocalPipeComponent),
      ).toBe(false);
      expect(localFactoryCalls).toBe(0);
      let caught = false;

      // A pipe explicitly provided on this element is a strict local lookup.
      try {
        if (lookup === 'get') {
          ngMocks.get(fixture.point, TargetPipe);
        } else if (lookup === 'findInstance') {
          ngMocks.findInstance(fixture, TargetPipe);
        } else {
          ngMocks.findInstances(fixture, TargetPipe);
        }
      } catch (error) {
        caught = true;
        expect(error).toBe(localFactoryError);
      }

      expect(caught).toBe(true);
      expect(localFactoryCalls).toBe(1);
    });
  }
});
