import { Component, Directive, InjectionToken } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const FAILING_TOKEN = new InjectionToken<string>(
  'local-failure-14926',
);
const MISSING_TOKEN = new InjectionToken<string>(
  'local-missing-14926',
);
const originalError = new Error(
  'original local provider failure 14926',
);
let factoryCalls = 0;

class LocalService {}
const instance = new LocalService();
const providers = [
  {
    provide: FAILING_TOKEN,
    useFactory: () => {
      factoryCalls += 1;
      throw originalError;
    },
  },
  { provide: LocalService, useValue: instance },
];

@Component({
  selector: 'target',
  template: '<span></span>',
  providers,
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetComponent {}

@Directive({
  selector: '[target]',
  providers,
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14926
describe('issue-14926', () => {
  for (const template of [
    '<target></target>',
    '<div target><span></span></div>',
  ]) {
    describe(template, () => {
      beforeEach(() => {
        factoryCalls = 0;
        return MockBuilder(TargetComponent).keep(TargetDirective);
      });

      for (const lookup of [
        'findInstance',
        'findInstance fallback',
        'findInstances',
        'get',
        'get fallback',
      ]) {
        it(`preserves a lazy local factory error through ${lookup}`, () => {
          const fixture = MockRender(template);
          const element = fixture.point;
          expect(factoryCalls).toBe(0);
          let caught = false;

          // The provider is first requested by the public lookup, not rendering.
          try {
            if (lookup === 'findInstance') {
              ngMocks.findInstance(element, FAILING_TOKEN);
            } else if (lookup === 'findInstance fallback') {
              ngMocks.findInstance(
                element,
                FAILING_TOKEN,
                'fallback',
              );
            } else if (lookup === 'findInstances') {
              ngMocks.findInstances(element, FAILING_TOKEN);
            } else if (lookup === 'get') {
              ngMocks.get(element, FAILING_TOKEN);
            } else {
              ngMocks.get(element, FAILING_TOKEN, 'fallback');
            }
          } catch (error) {
            caught = true;
            expect(error).toBe(originalError);
          }

          expect(caught).toBe(true);
          expect(factoryCalls).toBe(1);
        });
      }

      it('preserves missing-provider fallbacks and successful lookup identity', () => {
        const fixture = MockRender(template);
        const element = fixture.point;

        expect(
          ngMocks.findInstance(element, MISSING_TOKEN, 'fallback'),
        ).toBe('fallback');
        expect(ngMocks.get(element, MISSING_TOKEN, 'fallback')).toBe(
          'fallback',
        );
        expect(ngMocks.findInstances(element, MISSING_TOKEN)).toEqual(
          [],
        );
        expect(ngMocks.findInstance(element, LocalService)).toBe(
          instance,
        );
        expect(ngMocks.get(element, LocalService)).toBe(instance);
        const instances = ngMocks.findInstances(
          element,
          LocalService,
        );
        expect(instances.length).toBe(1);
        expect(instances[0]).toBe(instance);
        expect(factoryCalls).toBe(0);
      });
    });
  }
});
