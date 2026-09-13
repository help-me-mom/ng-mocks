import {
  Component,
  Inject,
  InjectionToken,
  Input,
  Optional,
  Self,
  SkipSelf,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockRender, MockRenderFactory, ngMocks } from 'ng-mocks';

const TOKEN = new InjectionToken<object>('scope');
// View Engine reconstructs plain useValue objects; a class instance retains its identity.
class Value {}
const value = new Value();
const provider = { provide: TOKEN, useValue: value };

@Component({
  selector: 'target-14998',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ value }}',
})
class TargetComponent {
  @Input() public value: string | null = 'initial';

  public constructor(
    @Inject(TOKEN)
    @Optional()
    @Self()
    public readonly local: object | null,
    @Inject(TOKEN)
    @Optional()
    @SkipSelf()
    public readonly parent: object | null,
  ) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14998
describe('issue-14998', () => {
  beforeEach(() => ngMocks.reset());
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
    }),
  );

  for (const scope of ['providers', 'viewProviders']) {
    it(`keeps factory provider scopes distinct after warming ${scope}`, () => {
      // Moving the same entry between sections used to produce the same flat cache key.
      const warm = MockRenderFactory(TargetComponent, [], {
        configureTestBed: false,
        providers: scope === 'providers' ? [provider] : [],
        viewProviders: scope === 'viewProviders' ? [provider] : [],
      });
      const factory = MockRenderFactory(TargetComponent, [], {
        configureTestBed: false,
        providers: scope === 'viewProviders' ? [provider] : [],
        viewProviders: scope === 'providers' ? [provider] : [],
      });

      expect(factory.declaration).not.toBe(warm.declaration);
      const fixture = factory();
      expect(fixture.point.componentInstance.local).toBe(
        scope === 'viewProviders' ? value : null,
      );
      expect(fixture.point.componentInstance.parent).toBe(value);
      expect(fixture.point.componentInstance.value).toBe('initial');
      expect(ngMocks.formatText(fixture)).toBe('initial');
    });

    it(`keeps MockRender provider scopes distinct after rendering ${scope}`, () => {
      const first = MockRender(
        TargetComponent,
        {},
        {
          providers: scope === 'providers' ? [provider] : [],
          viewProviders: scope === 'viewProviders' ? [provider] : [],
        },
      );
      expect(first.point.componentInstance.local).toBe(
        scope === 'providers' ? value : null,
      );
      expect(first.point.componentInstance.parent).toBe(value);

      // Clear the earlier generated provider directive while retaining the wrapper cache.
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [TargetComponent],
      });
      const second = MockRender(
        TargetComponent,
        {},
        {
          providers: scope === 'viewProviders' ? [provider] : [],
          viewProviders: scope === 'providers' ? [provider] : [],
        },
      );

      expect(second.componentInstance.constructor).not.toBe(
        first.componentInstance.constructor,
      );
      expect(second.point.componentInstance.local).toBe(
        scope === 'viewProviders' ? value : null,
      );
      expect(second.point.componentInstance.parent).toBe(value);
    });
  }

  for (const defaults of [true, false]) {
    it(`preserves input bindings after warming defaults=${defaults}`, () => {
      const firstOptions = {
        providers: defaults ? [] : undefined,
        viewProviders: [],
      };
      const first = defaults
        ? MockRender(TargetComponent, null, firstOptions)
        : MockRender(TargetComponent, {}, firstOptions);
      expect(first.point.componentInstance.value).toBe(
        defaults ? null : 'initial',
      );
      expect(ngMocks.formatText(first)).toBe(
        defaults ? '' : 'initial',
      );

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [TargetComponent],
      });
      const secondOptions = {
        providers: defaults ? undefined : [],
        viewProviders: [],
      };
      const second = defaults
        ? MockRender(TargetComponent, {}, secondOptions)
        : MockRender(TargetComponent, null, secondOptions);

      expect(second.componentInstance.constructor).not.toBe(
        first.componentInstance.constructor,
      );
      expect(second.point.componentInstance.value).toBe(
        defaults ? 'initial' : null,
      );
      expect(ngMocks.formatText(second)).toBe(
        defaults ? 'initial' : '',
      );
      expect(second.point.componentInstance.local).toBeNull();
      expect(second.point.componentInstance.parent).toBeNull();
    });
  }
});
