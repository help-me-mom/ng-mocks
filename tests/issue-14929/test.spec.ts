import {
  Component,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockModule, ngMocks } from 'ng-mocks';

const CONFIG = new InjectionToken<string>('issue-14929-config');
const MULTI = new InjectionToken<string[]>('issue-14929-multi');
let factoryCalls = 0;
let multiFactoryCalls: string[] = [];

@Injectable()
class ConfiguredService {
  public readonly value = 'configured service';
}

const configuredService = new ConfiguredService();

@Component({
  selector: 'target-14929',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ label }} {{ service.value }}',
})
class TargetComponent {
  public constructor(
    @Inject(CONFIG) public readonly label: string,
    public readonly service: ConfiguredService,
  ) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {
  public static forRoot(label = 'for-root-14929') {
    return {
      ngModule: TargetModule,
      providers: [
        { provide: CONFIG, useValue: label },
        {
          provide: ConfiguredService,
          useFactory: () => {
            factoryCalls += 1;

            return configuredService;
          },
        },
        {
          provide: MULTI,
          multi: true,
          useFactory: () => {
            multiFactoryCalls.push(label);

            return label;
          },
        },
      ],
    };
  }
}

@Injectable()
class UnrelatedService {
  public read(): string {
    return 'real unrelated service';
  }
}

@NgModule({
  providers: [UnrelatedService],
})
class UnrelatedModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14929
describe('issue-14929', () => {
  for (const mixed of [false, true]) {
    describe(
      mixed ? 'mixed real and mock imports' : 'real Angular imports',
      () => {
        beforeEach(() => {
          factoryCalls = 0;
          multiFactoryCalls = [];
        });

        for (const reversed of [false, true]) {
          it(`preserves forRoot providers with the bare import ${reversed ? 'first' : 'last'}`, async () => {
            const targetImports = reversed
              ? [TargetModule, TargetModule.forRoot()]
              : [TargetModule.forRoot(), TargetModule];
            await TestBed.configureTestingModule({
              imports: [
                ...targetImports,
                ...(mixed ? [MockModule(UnrelatedModule)] : []),
              ],
            }).compileComponents();

            expect(factoryCalls).toBe(0);
            expect(multiFactoryCalls).toEqual([]);
            const fixture = TestBed.createComponent(TargetComponent);
            fixture.detectChanges();

            // An unrelated mock must not discard earlier real forRoot providers.
            expect(
              isMockOf(fixture.componentInstance, TargetComponent),
            ).toBe(false);
            expect(fixture.componentInstance.label).toBe(
              'for-root-14929',
            );
            expect(fixture.componentInstance.service).toBe(
              configuredService,
            );
            expect(
              isMockOf(
                fixture.componentInstance.service,
                ConfiguredService,
              ),
            ).toBe(false);
            expect(ngMocks.formatText(fixture)).toBe(
              'for-root-14929 configured service',
            );
            expect(fixture.debugElement.injector.get(CONFIG)).toBe(
              'for-root-14929',
            );
            expect(
              fixture.debugElement.injector.get(ConfiguredService),
            ).toBe(configuredService);
            expect(factoryCalls).toBe(1);
            expect(multiFactoryCalls).toEqual([]);

            if (mixed) {
              const unrelated =
                fixture.debugElement.injector.get(UnrelatedService);
              expect(isMockOf(unrelated, UnrelatedService)).toBe(
                true,
              );
              expect(unrelated.read()).toBeUndefined();
            }
          });
        }

        it('preserves ordered multi providers across an intervening bare import', async () => {
          await TestBed.configureTestingModule({
            imports: [
              TargetModule.forRoot('first'),
              TargetModule,
              TargetModule.forRoot('second'),
              ...(mixed ? [MockModule(UnrelatedModule)] : []),
            ],
          }).compileComponents();

          expect(factoryCalls).toBe(0);
          expect(multiFactoryCalls).toEqual([]);
          const fixture = TestBed.createComponent(TargetComponent);
          fixture.detectChanges();

          expect(
            isMockOf(fixture.componentInstance, TargetComponent),
          ).toBe(false);
          expect(fixture.componentInstance.label).toBe('second');
          expect(fixture.componentInstance.service).toBe(
            configuredService,
          );
          expect(ngMocks.formatText(fixture)).toBe(
            'second configured service',
          );
          expect(factoryCalls).toBe(1);
          expect(multiFactoryCalls).toEqual([]);
          const values = fixture.debugElement.injector.get(MULTI);
          expect(values).toEqual(['first', 'second']);
          expect(multiFactoryCalls).toEqual(['first', 'second']);
          expect(fixture.debugElement.injector.get(MULTI)).toBe(
            values,
          );
          expect(multiFactoryCalls).toEqual(['first', 'second']);
          expect(
            fixture.debugElement.injector.get(ConfiguredService),
          ).toBe(configuredService);
          expect(factoryCalls).toBe(1);

          if (mixed) {
            const unrelated =
              fixture.debugElement.injector.get(UnrelatedService);
            expect(isMockOf(unrelated, UnrelatedService)).toBe(true);
            expect(unrelated.read()).toBeUndefined();
          }
        });
      },
    );
  }
});
