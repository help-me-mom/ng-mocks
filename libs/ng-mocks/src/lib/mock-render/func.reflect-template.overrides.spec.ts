import {
  Component,
  Inject,
  InjectionToken,
  Optional,
  reflectComponentType,
  Self,
  Type,
} from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';

import { ngMocks } from '../mock-helper/mock-helper';

import funcReflectTemplate from './func.reflect-template';

// @see https://github.com/help-me-mom/ng-mocks/issues/14945
describe('funcReflectTemplate:direct overrides', () => {
  for (const overrideFirst of [true, false]) {
    it(`applies direct component overrides ${overrideFirst ? 'before' : 'after'} cloning`, async () => {
      const token = new InjectionToken<{ label: string }>(
        'component provider',
      );
      const viewToken = new InjectionToken<{ label: string }>(
        'component view provider',
      );
      const originalValue = { label: 'original provider' };
      const originalViewValue = { label: 'original view' };
      const originalProvider = {
        provide: token,
        useValue: originalValue,
      };
      const originalViewProvider = {
        provide: viewToken,
        useValue: originalViewValue,
      };
      const providers = [originalProvider];
      const viewProviders = [originalViewProvider];
      const inputs = ['label'];
      const host = {
        '(click)': 'originalClicks = originalClicks + 1',
        role: 'button',
      };

      @Component({
        host,
        inputs,
        providers,
        standalone: false,
        template: 'original {{ local.label }} {{ view.label }}',
        viewProviders,
      })
      class TargetComponent {
        public label = '';
        public originalClicks = 0;
        public overrideClicks = 0;

        public constructor(
          @Inject(token) public readonly local: { label: string },
          @Inject(viewToken) public readonly view: { label: string },
        ) {}
      }

      const annotations: Component[] =
        Object.getOwnPropertyDescriptor(
          TargetComponent,
          '__annotations__',
        )?.value;
      const annotation = annotations[0];
      const overriddenValue = { label: 'configured provider' };
      const overriddenViewValue = { label: 'configured view' };
      const overriddenProvider = {
        provide: token,
        useValue: overriddenValue,
      };
      const overriddenViewProvider = {
        provide: viewToken,
        useValue: overriddenViewValue,
      };
      const override = {
        set: {
          host: {
            '(click)': 'overrideClicks = overrideClicks + 1',
            role: 'presentation',
          },
          providers: [overriddenProvider],
          template: 'override {{ local.label }} {{ view.label }}',
          viewProviders: [overriddenViewProvider],
        },
      };
      TestBed.configureTestingModule({
        declarations: [TargetComponent],
      });
      if (overrideFirst) {
        TestBed.overrideComponent(TargetComponent, override);
      }
      const configure = spyOn(
        TestBed,
        'configureTestingModule',
      ).and.callThrough();

      funcReflectTemplate(TargetComponent);

      const child: Type<TargetComponent> =
        configure.calls.mostRecent().args[0].declarations![0];
      if (!overrideFirst) {
        TestBed.overrideComponent(TargetComponent, override);
      }
      await TestBed.compileComponents();
      const fixture = TestBed.createComponent(child);
      fixture.detectChanges();
      fixture.detectChanges();
      fixture.nativeElement.dispatchEvent(new Event('click'));

      expect(child).not.toBe(TargetComponent);
      expect(
        fixture.componentInstance instanceof TargetComponent,
      ).toBe(true);
      expect(ngMocks.formatText(fixture)).toBe(
        'override configured provider configured view',
      );
      expect(fixture.componentInstance.local).toBe(overriddenValue);
      expect(fixture.componentInstance.view).toBe(
        overriddenViewValue,
      );
      expect(fixture.debugElement.injector.get(token)).toBe(
        overriddenValue,
      );
      expect(fixture.debugElement.injector.get(viewToken)).toBe(
        overriddenViewValue,
      );
      expect(fixture.debugElement.injector.get(TargetComponent)).toBe(
        fixture.componentInstance,
      );
      expect(fixture.componentInstance.overrideClicks).toBe(1);
      expect(fixture.componentInstance.originalClicks).toBe(0);
      expect(fixture.nativeElement.getAttribute('role')).toBe(
        'presentation',
      );

      expect(
        Object.getOwnPropertyDescriptor(
          TargetComponent,
          '__annotations__',
        )?.value,
      ).toBe(annotations);
      expect(annotations[0]).toBe(annotation);
      expect(annotation.template).toBe(
        'original {{ local.label }} {{ view.label }}',
      );
      expect(annotation.inputs).toBe(inputs);
      expect(inputs).toEqual(['label']);
      expect(annotation.providers).toBe(providers);
      expect(providers).toEqual([originalProvider]);
      expect(providers[0].useValue).toBe(originalValue);
      expect(annotation.viewProviders).toBe(viewProviders);
      expect(viewProviders).toEqual([originalViewProvider]);
      expect(viewProviders[0].useValue).toBe(originalViewValue);
      expect(annotation.host).toBe(host);
      expect(host).toEqual({
        '(click)': 'originalClicks = originalClicks + 1',
        role: 'button',
      });
      expect(override.set.providers).toEqual([overriddenProvider]);
      expect(override.set.viewProviders).toEqual([
        overriddenViewProvider,
      ]);
      expect(override.set.host).toEqual({
        '(click)': 'overrideClicks = overrideClicks + 1',
        role: 'presentation',
      });
    });
  }

  it('applies ordered add and remove overrides once through static and instance TestBed calls', async () => {
    const token = new InjectionToken<Array<{ label: string }>>(
      'ordered component values',
    );
    const baseValue = { label: 'base' };
    const removedValue = { label: 'removed' };
    const earlyValue = { label: 'early' };
    const lateValue = { label: 'late' };
    const baseProvider = {
      provide: token,
      multi: true,
      useValue: baseValue,
    };
    const removedProvider = {
      provide: token,
      multi: true,
      useValue: removedValue,
    };
    const earlyProvider = {
      provide: token,
      multi: true,
      useValue: earlyValue,
    };
    const lateProvider = {
      provide: token,
      multi: true,
      useValue: lateValue,
    };
    const providers = [baseProvider, removedProvider];
    const host = {
      '(click)': 'originalClicks = originalClicks + 1',
      role: 'button',
    };

    @Component({
      host,
      providers,
      standalone: false,
      template:
        '{{ providedValues.length }}:{{ providedValues[0].label }}',
    })
    class TargetComponent {
      public originalClicks = 0;
      public overrideClicks = 0;

      public constructor(
        @Inject(token)
        public readonly providedValues: Array<{ label: string }>,
      ) {}
    }

    const annotations: Component[] = Object.getOwnPropertyDescriptor(
      TargetComponent,
      '__annotations__',
    )?.value;
    const annotation = annotations[0];
    const earlyProviders = [earlyProvider];
    const removedProviders = [removedProvider];
    const lateProviders = [lateProvider];
    const earlyOverride = { add: { providers: earlyProviders } };
    const lateOverride = {
      add: {
        host: {
          '(click)': 'overrideClicks = overrideClicks + 1',
          role: 'presentation',
        },
        providers: lateProviders,
      },
      remove: { providers: removedProviders },
    };
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
    });
    TestBed.overrideComponent(TargetComponent, earlyOverride);
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.callThrough();

    const template = funcReflectTemplate(TargetComponent);

    const child: Type<TargetComponent> =
      configure.calls.mostRecent().args[0].declarations![0];
    getTestBed().overrideComponent(TargetComponent, lateOverride);
    await TestBed.compileComponents();
    expect(reflectComponentType(child)?.selector).toBe(
      template.selector,
    );
    await TestBed.compileComponents();
    expect(reflectComponentType(child)?.selector).toBe(
      template.selector,
    );
    const fixture = TestBed.createComponent(child);
    fixture.detectChanges();
    fixture.detectChanges();
    fixture.nativeElement.dispatchEvent(new Event('click'));

    const values = fixture.componentInstance.providedValues;
    expect(values).toEqual([baseValue, earlyValue, lateValue]);
    expect(values[0]).toBe(baseValue);
    expect(values[1]).toBe(earlyValue);
    expect(values[2]).toBe(lateValue);
    expect(fixture.debugElement.injector.get(token)).toBe(values);
    expect(fixture.debugElement.injector.get(TargetComponent)).toBe(
      fixture.componentInstance,
    );
    expect(ngMocks.formatText(fixture)).toBe('3:base');
    expect(fixture.componentInstance.overrideClicks).toBe(1);
    expect(fixture.componentInstance.originalClicks).toBe(0);
    expect(fixture.nativeElement.getAttribute('role')).toBe(
      'presentation',
    );
    expect(
      Object.getOwnPropertyDescriptor(
        TargetComponent,
        '__annotations__',
      )?.value,
    ).toBe(annotations);
    expect(annotations[0]).toBe(annotation);
    expect(annotation.providers).toBe(providers);
    expect(providers).toEqual([baseProvider, removedProvider]);
    expect(providers[0]).toBe(baseProvider);
    expect(providers[1]).toBe(removedProvider);
    expect(annotation.host).toBe(host);
    expect(host).toEqual({
      '(click)': 'originalClicks = originalClicks + 1',
      role: 'button',
    });
    expect(earlyOverride.add.providers).toBe(earlyProviders);
    expect(earlyProviders).toEqual([earlyProvider]);
    expect(lateOverride.add.providers).toBe(lateProviders);
    expect(lateProviders).toEqual([lateProvider]);
    expect(lateOverride.remove.providers).toBe(removedProviders);
    expect(removedProviders).toEqual([removedProvider]);
    expect(lateOverride.add.host).toEqual({
      '(click)': 'overrideClicks = overrideClicks + 1',
      role: 'presentation',
    });
  });

  it('keeps the generated selector and original-token alias when an override clears local providers', async () => {
    const token = new InjectionToken<{ label: string }>(
      'optional local value',
    );
    const originalValue = { label: 'local' };
    const parentValue = { label: 'parent' };
    const provider = { provide: token, useValue: originalValue };
    const providers = [provider];

    @Component({
      providers,
      standalone: false,
      template: '{{ local === null ? "missing" : "present" }}',
    })
    class TargetComponent {
      public constructor(
        @Optional()
        @Self()
        @Inject(token)
        public readonly local: { label: string } | null,
      ) {}
    }

    const annotations: Component[] = Object.getOwnPropertyDescriptor(
      TargetComponent,
      '__annotations__',
    )?.value;
    const annotation = annotations[0];
    const override = {
      set: { providers: undefined, selector: 'renamed-original' },
    };
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [{ provide: token, useValue: parentValue }],
    });
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.callThrough();

    const template = funcReflectTemplate(TargetComponent);

    const child: Type<TargetComponent> =
      configure.calls.mostRecent().args[0].declarations![0];
    TestBed.overrideComponent(TargetComponent, override);
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(child);
    fixture.detectChanges();

    expect(fixture.componentInstance.local).toBeNull();
    expect(TestBed.inject(token)).toBe(parentValue);
    expect(ngMocks.formatText(fixture)).toBe('missing');
    expect(fixture.debugElement.injector.get(TargetComponent)).toBe(
      fixture.componentInstance,
    );
    expect(reflectComponentType(child)?.selector).toBe(
      template.selector,
    );
    expect(reflectComponentType(child)?.selector).not.toBe(
      override.set.selector,
    );
    expect(reflectComponentType(TargetComponent)?.selector).toBe(
      override.set.selector,
    );
    expect(
      Object.getOwnPropertyDescriptor(
        TargetComponent,
        '__annotations__',
      )?.value,
    ).toBe(annotations);
    expect(annotations[0]).toBe(annotation);
    expect(annotation.selector).toBeUndefined();
    expect(annotation.providers).toBe(providers);
    expect(providers).toEqual([provider]);
    expect(providers[0]).toBe(provider);
    expect(provider.useValue).toBe(originalValue);
    expect(override.set).toEqual({
      providers: undefined,
      selector: 'renamed-original',
    });
  });
});
