import {
  Component,
  Directive,
  Injectable,
  InjectionToken,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';

import mockHelperConsoleThrow from '../mock-helper/mock-helper.console-throw';
import mockHelperGet from '../mock-helper/mock-helper.get';

import { MockBuilder } from './mock-builder';

@Injectable()
class TargetService {}

class TargetClass {}

const TARGET_TOKEN = new InjectionToken('TARGET_TOKEN');

@Pipe({
  name: 'target',
  standalone: false,
})
class TargetPipe implements PipeTransform {
  protected name = 'pipe:';

  public targetPipeMockBuilderPromise() {}

  public transform(value: string): any {
    return `${this.name}${value}`;
  }
}

@Component({
  selector: 'target',
  standalone: false,
  template: 'target',
})
class TargetComponent {
  public targetComponentMockBuilderPromise() {}
}

@Directive({
  selector: 'target',
  standalone: false,
})
class TargetDirective {
  public targetDirectiveMockBuilderPromise() {}
}

@NgModule({
  declarations: [TargetComponent, TargetDirective, TargetPipe],
})
class TargetModule {
  public targetModuleMockBuilderPromise() {}
}

@Pipe({
  name: 'fake',
  standalone: false,
})
class FakePipe implements PipeTransform {
  public fakePipeMockBuilderPromise() {}

  public transform(value: string): any {
    return value;
  }
}

@Component({
  selector: 'fake',
  standalone: false,
  template: 'fake',
})
class FakeComponent {
  public fakeComponentMockBuilderPromise() {}
}

@Directive({
  selector: 'fake',
  standalone: false,
})
class FakeDirective {
  public fakeDirectiveMockBuilderPromise() {}
}

@NgModule({
  declarations: [FakeComponent, FakeDirective, FakePipe],
})
class FakeModule {
  public fakeModuleMockBuilderPromise() {}
}

describe('MockBuilderPromise', () => {
  mockHelperConsoleThrow();

  it('skips dependencies in kept providers', async () => {
    await MockBuilder().keep(TargetService, { dependency: true });
    expect(() => mockHelperGet(TargetService)).toThrowError(
      /Cannot find an instance/,
    );
  });

  it('adds non dependencies in kept providers', async () => {
    await MockBuilder().keep(TargetService);
    expect(mockHelperGet(TargetService)).toBeTruthy();
  });

  it('adds kept classes as providers', async () => {
    await MockBuilder().keep(TargetClass);
    expect(mockHelperGet(TargetClass)).toBeTruthy();
  });

  it('does not add kept functions as providers', async () => {
    const target = (route: unknown, state: unknown) =>
      route === state;

    await MockBuilder().keep(target);
    expect(() => mockHelperGet(target)).toThrowError(
      /Cannot find an instance/,
    );
  });

  it('skips dependencies in mock providers', async () => {
    await MockBuilder().mock(TargetService, TargetService, {
      dependency: true,
    });
    expect(() => mockHelperGet(TargetService)).toThrowError(
      /Cannot find an instance/,
    );
  });

  it('adds non dependencies in mock providers', async () => {
    await MockBuilder().mock(TargetService);
    expect(mockHelperGet(TargetService)).toBeTruthy();
  });

  it('respects several kept overloads', async () => {
    await MockBuilder()
      .keep({
        ngModule: TargetModule,
        providers: [
          {
            multi: true,
            provide: TARGET_TOKEN,
            useValue: 1,
          },
        ],
      })
      .keep({
        ngModule: TargetModule,
        providers: [
          {
            multi: true,
            provide: TARGET_TOKEN,
            useValue: 2,
          },
        ],
      });
    expect(mockHelperGet(TARGET_TOKEN)).toEqual([1, 2]);
  });

  it('respects several mock overloads', async () => {
    await MockBuilder()
      .mock({
        ngModule: TargetModule,
        providers: [
          {
            multi: true,
            provide: TARGET_TOKEN,
            useValue: 1,
          },
        ],
      })
      .mock({
        ngModule: TargetModule,
        providers: [
          {
            multi: true,
            provide: TARGET_TOKEN,
            useValue: 2,
          },
        ],
      });
    expect(() => mockHelperGet(TARGET_TOKEN)).toThrowError(
      /Cannot find an instance/,
    );
  });

  const modes: Array<'keep' | 'mock'> = ['keep', 'mock'];
  for (const mode of modes) {
    for (const providerFirst of [true, false]) {
      it(`preserves ${mode} providers with the bare module ${providerFirst ? 'last' : 'first'}`, async () => {
        const value = { label: 'configured' };
        const token = new InjectionToken<typeof value>('configured');
        const providers = [{ provide: token, useValue: value }];
        const moduleWithProviders = {
          ngModule: TargetModule,
          providers,
        };
        const builder = MockBuilder().keep(token);

        if (providerFirst) {
          builder[mode](moduleWithProviders)[mode](TargetModule);
        } else {
          builder[mode](TargetModule)[mode](moduleWithProviders);
        }
        await builder;

        expect(mockHelperGet(token)).toBe(value);
        expect(moduleWithProviders.providers).toBe(providers);
        expect(providers).toEqual([
          { provide: token, useValue: value },
        ]);
      });
    }

    it(`discards ${mode} providers when changing the module mode`, async () => {
      const token = new InjectionToken<string>('discarded');
      const nextMode = mode === 'keep' ? 'mock' : 'keep';
      await MockBuilder()
        [mode]({
          ngModule: TargetModule,
          providers: [{ provide: token, useValue: 'discarded' }],
        })
        [nextMode](TargetModule)
        .keep(token);

      expect(() => mockHelperGet(token)).toThrowError(
        /Cannot find an instance/,
      );
    });
  }

  it('accumulates kept multi values across repeated mock module entries', async () => {
    const token = new InjectionToken<number[]>('multi');
    const first = [{ provide: token, useValue: 1, multi: true }];
    const second = [{ provide: token, useValue: 2, multi: true }];
    await MockBuilder()
      .mock({ ngModule: TargetModule, providers: first })
      .mock(TargetModule)
      .mock({ ngModule: TargetModule, providers: second })
      .keep(token);

    expect(mockHelperGet(token)).toEqual([1, 2]);
    expect(first).toEqual([
      { provide: token, useValue: 1, multi: true },
    ]);
    expect(second).toEqual([
      { provide: token, useValue: 2, multi: true },
    ]);
  });

  it('discards prior module providers after exclusion and a later keep', async () => {
    const token = new InjectionToken<string>('excluded');
    await MockBuilder()
      .keep({
        ngModule: TargetModule,
        providers: [{ provide: token, useValue: 'discarded' }],
      })
      .exclude(TargetModule)
      .keep(TargetModule)
      .keep(token);

    expect(() => mockHelperGet(token)).toThrowError(
      /Cannot find an instance/,
    );
  });

  it('keeps an explicit provider override above repeated module providers', async () => {
    const value = { label: 'override' };
    const token = new InjectionToken<typeof value>('overridden');
    const factory = jasmine.createSpy('module provider');
    await MockBuilder()
      .provide({ provide: token, useValue: value })
      .keep({
        ngModule: TargetModule,
        providers: [{ provide: token, useFactory: factory }],
      })
      .keep(TargetModule);

    expect(mockHelperGet(token)).toBe(value);
    expect(factory).not.toHaveBeenCalled();
  });

  it('throws an error on a services replacement', () => {
    expect(() =>
      MockBuilder().replace(TargetModule, TargetService),
    ).toThrowError(/Cannot replace the declaration/);
    expect(() =>
      MockBuilder().replace(TargetService, TargetModule),
    ).toThrowError(/Cannot replace the declaration/);
  });

  it('allows a module replacement', () => {
    expect(() =>
      MockBuilder().replace(TargetModule, FakeModule),
    ).not.toThrow();
  });

  it('allows a component replacement', () => {
    expect(() =>
      MockBuilder().replace(TargetComponent, FakeComponent),
    ).not.toThrow();
  });

  it('allows a directive replacement', () => {
    expect(() =>
      MockBuilder().replace(TargetDirective, FakeDirective),
    ).not.toThrow();
  });

  it('allows a pipe replacement', () => {
    expect(() =>
      MockBuilder().replace(TargetPipe, FakePipe),
    ).not.toThrow();
  });
});
