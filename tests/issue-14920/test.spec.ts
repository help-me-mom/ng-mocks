import {
  ContentChild,
  contentChild,
  contentChildren,
  Directive,
  isSignal,
  signal,
  TemplateRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockDirective,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

let originalCalls: string[] = [];

@Directive({
  selector: '[issue14920Item]',
  standalone: true,
})
class ItemDirective {}

@Directive({
  standalone: true,
})
class BaseDirective {
  public readonly inherited =
    contentChild<TemplateRef<unknown>>('template');
  public readonly baseInitialized = originalCalls.push(
    'base initializer',
  );

  public constructor() {
    originalCalls.push('base constructor');
  }
}

@Directive({
  selector: '[issue14920Query]',
  standalone: true,
})
class QueryDirective extends BaseDirective {
  public readonly required = contentChild.required(ItemDirective);
  public readonly all = contentChildren(ItemDirective);
  public readonly initialized = originalCalls.push(
    'query initializer',
  );

  @ContentChild('template', { read: TemplateRef })
  public legacy?: TemplateRef<unknown>;

  public constructor() {
    super();
    originalCalls.push('query constructor');
  }
}

@Directive({
  hostDirectives: [QueryDirective],
  selector: '[issue14920Owner]',
  standalone: true,
})
class OwnerDirective {
  public readonly initialized = originalCalls.push(
    'owner initializer',
  );

  public constructor() {
    originalCalls.push('owner constructor');
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14920
describe('issue-14920', () => {
  // This base has only a signal query, so decorator queries cannot satisfy the guard.
  // Angular-compiled spread targets execute these cases from Angular 17.2.
  const definition = (
    BaseDirective as typeof BaseDirective & {
      ɵdir?: { contentQueries?: unknown };
    }
  ).ɵdir;
  if (typeof definition?.contentQueries !== 'function') {
    it('needs compiled signal query metadata', () => {
      expect(definition?.contentQueries).toBeFalsy();
    });

    return;
  }

  MockInstance.scope();

  beforeEach(() => {
    ngMocks.reset();
    originalCalls = [];
  });

  afterEach(() => ngMocks.reset());

  for (const route of ['direct', 'host']) {
    describe(route, () => {
      const selector =
        route === 'direct' ? 'issue14920Query' : 'issue14920Owner';
      const template = `
        <div ${selector}>
          @if (show) {
            <span issue14920Item>{{ label }}</span>
            <ng-template #template>{{ label }}</ng-template>
          }
        </div>
      `;

      beforeEach(() =>
        TestBed.configureTestingModule({
          imports: [
            ItemDirective,
            route === 'direct'
              ? MockDirective(QueryDirective)
              : MockDirective(OwnerDirective),
          ],
        }).compileComponents(),
      );

      it('omits query signals while resolving ordinary queries after projection changes', () => {
        const fixture = MockRender(template, {
          show: true,
          label: 'first',
        });
        const target = ngMocks.findInstance(QueryDirective);
        const first = ngMocks.findInstance(ItemDirective);
        const firstTemplate = ngMocks.findTemplateRef('template');

        expect(isMockOf(target, QueryDirective)).toBe(true);
        if (route === 'host') {
          expect(
            isMockOf(
              ngMocks.findInstance(OwnerDirective),
              OwnerDirective,
            ),
          ).toBe(true);
        }
        expect(target.required).toBeUndefined();
        expect(target.all).toBeUndefined();
        expect(target.inherited).toBeUndefined();
        expect(target.legacy?.elementRef.nativeElement).toBe(
          firstTemplate.elementRef.nativeElement,
        );
        expect(ngMocks.formatText(fixture)).toBe('first');
        expect(originalCalls).toEqual([]);

        fixture.componentInstance.show = false;
        fixture.detectChanges();
        fixture.detectChanges();

        expect(ngMocks.findInstances(ItemDirective)).toEqual([]);
        expect(target.legacy).toBeUndefined();
        expect(ngMocks.formatText(fixture)).toBe('');

        fixture.componentInstance.show = true;
        fixture.componentInstance.label = 'restored';
        fixture.detectChanges();
        fixture.detectChanges();
        const restoredTemplate = ngMocks.findTemplateRef('template');

        expect(ngMocks.findInstance(QueryDirective)).toBe(target);
        expect(ngMocks.findInstance(ItemDirective)).not.toBe(first);
        expect(restoredTemplate.elementRef.nativeElement).not.toBe(
          firstTemplate.elementRef.nativeElement,
        );
        expect(target.legacy?.elementRef.nativeElement).toBe(
          restoredTemplate.elementRef.nativeElement,
        );
        expect(target.required).toBeUndefined();
        expect(target.all).toBeUndefined();
        expect(target.inherited).toBeUndefined();
        expect(ngMocks.formatText(fixture)).toBe('restored');
        expect(originalCalls).toEqual([]);
      });

      it('preserves explicitly supplied query signals and their test-controlled values', () => {
        const fallback = new ItemDirective();
        const required = signal(fallback);
        const all = signal<readonly ItemDirective[]>([]);
        const inherited = signal<TemplateRef<unknown> | undefined>(
          undefined,
        );
        MockInstance(QueryDirective, 'required', required);
        MockInstance(QueryDirective, 'all', all);
        MockInstance(QueryDirective, 'inherited', inherited);
        const fixture = MockRender(template, {
          show: true,
          label: 'first',
        });
        const target = ngMocks.findInstance(QueryDirective);
        const first = ngMocks.findInstance(ItemDirective);
        const firstTemplate = ngMocks.findTemplateRef('template');

        expect(isMockOf(target, QueryDirective)).toBe(true);
        if (route === 'host') {
          expect(
            isMockOf(
              ngMocks.findInstance(OwnerDirective),
              OwnerDirective,
            ),
          ).toBe(true);
        }
        expect(target.required).toBe(required);
        expect(target.all).toBe(all);
        expect(target.inherited).toBe(inherited);
        expect(isSignal(target.required)).toBe(true);
        expect(isSignal(target.all)).toBe(true);
        expect(isSignal(target.inherited)).toBe(true);
        expect(target.required()).toBe(fallback);
        expect(target.all()).toEqual([]);
        expect(target.inherited()).toBeUndefined();
        expect(target.legacy?.elementRef.nativeElement).toBe(
          firstTemplate.elementRef.nativeElement,
        );

        const selected = [first];
        required.set(first);
        all.set(selected);
        inherited.set(firstTemplate);
        fixture.componentInstance.show = false;
        fixture.detectChanges();
        fixture.detectChanges();

        expect(ngMocks.findInstances(ItemDirective)).toEqual([]);
        expect(target.legacy).toBeUndefined();
        expect(target.required()).toBe(first);
        expect(target.all()).toBe(selected);
        expect(target.inherited()).toBe(firstTemplate);

        fixture.componentInstance.show = true;
        fixture.componentInstance.label = 'restored';
        fixture.detectChanges();
        fixture.detectChanges();
        const restored = ngMocks.findInstance(ItemDirective);
        const restoredTemplate = ngMocks.findTemplateRef('template');

        expect(ngMocks.findInstance(QueryDirective)).toBe(target);
        expect(restored).not.toBe(first);
        expect(restoredTemplate.elementRef.nativeElement).not.toBe(
          firstTemplate.elementRef.nativeElement,
        );
        expect(target.legacy?.elementRef.nativeElement).toBe(
          restoredTemplate.elementRef.nativeElement,
        );
        expect(target.required).toBe(required);
        expect(target.all).toBe(all);
        expect(target.inherited).toBe(inherited);
        expect(target.required()).toBe(first);
        expect(target.all()).toBe(selected);
        expect(target.inherited()).toBe(firstTemplate);
        expect(ngMocks.formatText(fixture)).toBe('restored');

        required.set(restored);
        all.set([restored]);
        inherited.set(restoredTemplate);
        fixture.detectChanges();

        expect(target.required()).toBe(restored);
        expect(target.all()).toEqual([restored]);
        expect(target.inherited()).toBe(restoredTemplate);
        expect(originalCalls).toEqual([]);
      });
    });
  }
});
