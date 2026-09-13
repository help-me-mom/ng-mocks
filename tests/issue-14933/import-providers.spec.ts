import {
  createEnvironmentInjector,
  ENVIRONMENT_INITIALIZER,
  EnvironmentInjector,
  importProvidersFrom,
  inject,
  Injectable,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockModule } from 'ng-mocks';

let constructorCalls = 0;
let factoryCalls = 0;
const initialized: TargetService[] = [];

@Injectable()
class TargetService {
  public constructor() {
    constructorCalls += 1;
  }

  public read(): string {
    return 'real imported service';
  }
}

@NgModule({})
class TargetModule {
  public static forRoot(): ModuleWithProviders<TargetModule> {
    return {
      ngModule: TargetModule,
      providers: [
        {
          provide: TargetService,
          useFactory: () => {
            factoryCalls += 1;

            return new TargetService();
          },
        },
        {
          provide: ENVIRONMENT_INITIALIZER,
          multi: true,
          useValue: () => {
            initialized.push(inject(TargetService));
          },
        },
      ],
    };
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14933
// Angular 14 accepts importProvidersFrom at the environment injector boundary.
describe('issue-14933:import-providers', () => {
  beforeEach(() => {
    constructorCalls = 0;
    factoryCalls = 0;
    initialized.length = 0;
  });

  for (const mocked of [false, true]) {
    it(`imports ${mocked ? 'mocked' : 'real'} ModuleWithProviders into an environment injector`, async () => {
      const source = TargetModule.forRoot();
      const sourceProviders = source.providers;
      const providers = importProvidersFrom(
        mocked ? MockModule(source) : source,
      );

      await TestBed.configureTestingModule({}).compileComponents();
      const injector = createEnvironmentInjector(
        [providers],
        TestBed.inject(EnvironmentInjector),
      );

      try {
        const service = injector.get(TargetService);

        expect(isMockOf(service, TargetService)).toBe(mocked);
        if (mocked) {
          expect(service.read()).toBeUndefined();
          expect(constructorCalls).toBe(0);
          expect(factoryCalls).toBe(0);
          expect(initialized).toEqual([]);
        } else {
          expect(service.read()).toBe('real imported service');
          expect(constructorCalls).toBe(1);
          expect(factoryCalls).toBe(1);
          expect(initialized).toEqual([service]);
        }
        expect(injector.get(TargetService)).toBe(service);
        expect(initialized.length).toBe(mocked ? 0 : 1);
        expect(constructorCalls).toBe(mocked ? 0 : 1);
        expect(factoryCalls).toBe(mocked ? 0 : 1);
        expect(source.ngModule).toBe(TargetModule);
        expect(source.providers).toBe(sourceProviders);
      } finally {
        injector.destroy();
      }
    });
  }
});
