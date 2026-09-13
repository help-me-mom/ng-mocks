import {
  Component,
  Inject,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, ngMocks } from 'ng-mocks';

const FIRST = new InjectionToken<string>('issue-15000-first');
const SECOND = new InjectionToken<string>('issue-15000-second');
const CONFIG = new InjectionToken<string>('issue-15000-config');
const MULTI = new InjectionToken<string[]>('issue-15000-multi');
let factoryCalls: string[] = [];

@Component({
  selector: 'target-15000',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ label }}',
})
class TargetComponent {
  public constructor(@Inject(CONFIG) public readonly label: string) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  providers: [
    { provide: CONFIG, useValue: 'base' },
    { provide: MULTI, multi: true, useValue: 'base' },
  ],
})
class TargetModule {}

@NgModule({})
class InterleavedModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15000
describe('issue-15000', () => {
  beforeEach(() => {
    factoryCalls = [];
  });

  for (const useGuts of [false, true]) {
    describe(
      useGuts ? 'kept guts imports' : 'real Angular imports',
      () => {
        it('preserves separate tokens, overrides and ordered multi providers', async () => {
          const first = {
            ngModule: TargetModule,
            providers: [
              { provide: FIRST, useValue: 'first' },
              { provide: CONFIG, useValue: 'first' },
              {
                provide: MULTI,
                multi: true,
                useFactory: () => {
                  factoryCalls.push('first');

                  return 'first';
                },
              },
            ],
          };
          const middle = {
            ngModule: InterleavedModule,
            providers: [
              { provide: CONFIG, useValue: 'middle' },
              {
                provide: MULTI,
                multi: true,
                useFactory: () => {
                  factoryCalls.push('middle');

                  return 'middle';
                },
              },
            ],
          };
          const last = {
            ngModule: TargetModule,
            providers: [
              { provide: SECOND, useValue: 'second' },
              { provide: CONFIG, useValue: 'second' },
              {
                provide: MULTI,
                multi: true,
                useFactory: () => {
                  factoryCalls.push('second');

                  return 'second';
                },
              },
            ],
          };
          const imports = [first, middle, last];
          const firstProviders = first.providers;
          const lastProviders = last.providers;
          const recipes = imports.map(value => [...value.providers]);
          const metadata = useGuts
            ? ngMocks.guts([TargetModule, InterleavedModule], imports)
            : { imports };
          // TestBed can replace wrapper provider arrays when applying its own overrides.
          expect(first.providers).toBe(firstProviders);
          expect(last.providers).toBe(lastProviders);
          expect(imports.map(value => value.providers)).toEqual(
            recipes,
          );
          expect(factoryCalls).toEqual([]);
          await TestBed.configureTestingModule(
            metadata,
          ).compileComponents();

          expect(factoryCalls).toEqual([]);
          // View Engine creates module providers eagerly on the first TestBed use.
          const values = ngMocks.get(MULTI);
          expect(values).toEqual([
            'base',
            'first',
            'middle',
            'second',
          ]);
          expect(factoryCalls).toEqual(['first', 'middle', 'second']);
          const fixture = TestBed.createComponent(TargetComponent);
          fixture.detectChanges();
          expect(
            isMockOf(fixture.componentInstance, TargetComponent),
          ).toBe(false);
          expect(fixture.componentInstance.label).toBe('second');
          expect(ngMocks.formatText(fixture)).toBe('second');
          expect(ngMocks.get(FIRST)).toBe('first');
          expect(ngMocks.get(SECOND)).toBe('second');
          expect(ngMocks.get(CONFIG)).toBe('second');
          expect(factoryCalls).toEqual(['first', 'middle', 'second']);
          expect(ngMocks.get(MULTI)).toBe(values);
          expect(factoryCalls).toEqual(['first', 'middle', 'second']);
          expect(imports.map(value => value.providers)).toEqual(
            recipes,
          );
        });
      },
    );
  }

  for (const bareFirst of [false, true]) {
    it(`keeps wrapper providers with the bare module ${bareFirst ? 'first' : 'last'}`, async () => {
      const wrapper = {
        ngModule: TargetModule,
        providers: [
          { provide: FIRST, useValue: 'configured' },
          { provide: CONFIG, useValue: 'configured' },
          { provide: MULTI, multi: true, useValue: 'configured' },
        ],
      };
      const imports = bareFirst
        ? [TargetModule, wrapper]
        : [wrapper, TargetModule];
      await TestBed.configureTestingModule(
        ngMocks.guts(TargetModule, imports),
      ).compileComponents();

      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      expect(
        isMockOf(fixture.componentInstance, TargetComponent),
      ).toBe(false);
      expect(fixture.componentInstance.label).toBe('configured');
      expect(ngMocks.formatText(fixture)).toBe('configured');
      expect(ngMocks.get(FIRST)).toBe('configured');
      expect(ngMocks.get(MULTI)).toEqual(['base', 'configured']);
    });
  }
});
