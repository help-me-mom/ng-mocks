import { trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  HostListener,
  Inject,
  Input,
  input,
  InjectionToken,
  reflectComponentType,
  ViewEncapsulation,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';

import funcReflectTemplate from './func.reflect-template';

describe('funcReflectTemplate', () => {
  it('inherits class host bindings once and preserves decorated listeners', () => {
    @Component({
      host: {
        '(click)': 'clicks = clicks + 1',
        role: 'button',
      },
      standalone: false,
      template: '',
    })
    class TargetComponent {
      public clicks = 0;
      public focuses = 0;

      @HostListener('focus')
      public onFocus(): void {
        this.focuses += 1;
      }
    }

    const originalHost = {
      ...coreReflectDirectiveResolve(TargetComponent).host,
    };
    const originalBindings = (TargetComponent as any).ɵcmp
      .hostBindings;
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.callThrough();

    funcReflectTemplate(TargetComponent);

    const child =
      configure.calls.mostRecent().args[0].declarations![0];
    const fixture = TestBed.createComponent<TargetComponent>(child);
    fixture.detectChanges();
    fixture.nativeElement.dispatchEvent(new Event('click'));
    fixture.nativeElement.dispatchEvent(new Event('focus'));

    expect(fixture.componentInstance.clicks).toEqual(1);
    expect(fixture.componentInstance.focuses).toEqual(1);
    expect(fixture.nativeElement.getAttribute('role')).toBe('button');
    expect(coreReflectDirectiveResolve(TargetComponent).host).toEqual(
      originalHost,
    );
    expect((TargetComponent as any).ɵcmp.hostBindings).toBe(
      originalBindings,
    );
  });

  it('preserves an effective host override without reviving the original handler', async () => {
    @Component({
      host: {
        '(click)': 'originalClicks = originalClicks + 1',
        role: 'button',
      },
      standalone: false,
      template: '',
    })
    class TargetComponent {
      public originalClicks = 0;
      public overrideClicks = 0;
    }

    const originalHost = {
      ...coreReflectDirectiveResolve(TargetComponent).host,
    };
    const override = {
      set: {
        host: {
          '(click)': 'overrideClicks = overrideClicks + 1',
          role: 'presentation',
        },
      },
    };
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
    });
    TestBed.overrideComponent(TargetComponent, override);
    await TestBed.compileComponents();
    spyOn((TestBed as any).ngMocksOverrides, 'get').and.returnValue({
      override,
    });
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.callThrough();

    funcReflectTemplate(TargetComponent);

    const child =
      configure.calls.mostRecent().args[0].declarations![0];
    const fixture = TestBed.createComponent<TargetComponent>(child);
    fixture.detectChanges();
    fixture.nativeElement.dispatchEvent(new Event('click'));

    expect(fixture.componentInstance.originalClicks).toEqual(0);
    expect(fixture.componentInstance.overrideClicks).toEqual(1);
    expect(fixture.nativeElement.getAttribute('role')).toBe(
      'presentation',
    );
    expect(coreReflectDirectiveResolve(TargetComponent).host).toEqual(
      originalHost,
    );
    expect(override.set.host).toEqual({
      '(click)': 'overrideClicks = overrideClicks + 1',
      role: 'presentation',
    });
  });

  it('preserves inherited animation order without duplicating or mutating metadata', () => {
    const inherited = trigger('inherited', []);
    const own = trigger('own', []);

    @Component({
      animations: [inherited],
      selector: 'base-reflect-template-animation',
      standalone: false,
      template: '',
    })
    class BaseComponent {}

    @Component({
      animations: [own],
      standalone: false,
      template: '',
    })
    class TargetComponent extends BaseComponent {}

    const originalAnimations = [
      ...(TargetComponent as any).ɵcmp.data.animation,
    ];
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.stub();

    const template = funcReflectTemplate(TargetComponent);

    const child =
      configure.calls.mostRecent().args[0].declarations![0];
    expect(originalAnimations).toEqual([own, inherited]);
    expect(child.ɵcmp.data.animation).toEqual(originalAnimations);
    expect(child.ɵcmp.data.animation[0]).toBe(own);
    expect(child.ɵcmp.data.animation[1]).toBe(inherited);
    expect((TargetComponent as any).ɵcmp.data.animation).toEqual(
      originalAnimations,
    );
    expect(
      coreReflectDirectiveResolve(TargetComponent).animations,
    ).toEqual([own]);
    expect(
      coreReflectDirectiveResolve(BaseComponent).animations,
    ).toEqual([inherited]);
    expect((template as Component).animations).toEqual([own]);
  });

  it('preserves an effective animation override without adding original animations', async () => {
    const original = trigger('original', []);
    const replacement = trigger('replacement', []);

    @Component({
      animations: [original],
      standalone: false,
      template: '',
    })
    class TargetComponent {}

    const originalMetadata =
      coreReflectDirectiveResolve(TargetComponent);
    const override = { set: { animations: [replacement] } };
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
    });
    TestBed.overrideComponent(TargetComponent, override);
    await TestBed.compileComponents();
    spyOn((TestBed as any).ngMocksOverrides, 'get').and.returnValue({
      override,
    });
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.stub();

    funcReflectTemplate(TargetComponent);

    const child =
      configure.calls.mostRecent().args[0].declarations![0];
    expect(child.ɵcmp.data.animation).toEqual([replacement]);
    expect(child.ɵcmp.data.animation[0]).toBe(replacement);
    expect((TargetComponent as any).ɵcmp.data.animation).toEqual([
      replacement,
    ]);
    expect(originalMetadata.animations).toEqual([original]);
    expect(override.set.animations).toEqual([replacement]);
  });

  it('copies component metadata that Angular does not inherit', () => {
    const provider = new InjectionToken<string>('provider');
    const viewProvider = new InjectionToken<string>('view-provider');

    @Directive({
      host: { 'data-dependency': 'present' },
      selector: '[dependency]',
      standalone: true,
    })
    class DependencyDirective {}

    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      exportAs: 'metadataTarget',
      imports: [DependencyDirective],
      preserveWhitespaces: true,
      providers: [{ provide: provider, useValue: 'provider value' }],
      standalone: true,
      styles: ['span { color: rgb(1, 2, 3); }'],
      template: '<span dependency>{{ value }}</span>',
      viewProviders: [
        { provide: viewProvider, useValue: 'view value' },
      ],
    })
    class TargetComponent {
      public value = 'rendered';

      public constructor(
        @Inject(provider) public readonly injected: string,
        @Inject(viewProvider) public readonly viewInjected: string,
      ) {}
    }

    const originalMetadata =
      coreReflectDirectiveResolve(TargetComponent);
    const originalProviders = [...(originalMetadata.providers || [])];
    const originalViewProviders = [
      ...(originalMetadata.viewProviders || []),
    ];
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.callThrough();

    funcReflectTemplate(TargetComponent);

    const child = configure.calls.mostRecent().args[0]
      .imports![0] as any;
    const metadata = coreReflectDirectiveResolve(child);
    const fixture = TestBed.createComponent<TargetComponent>(child);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('rendered');
    expect(
      fixture.nativeElement.querySelector('span').dataset.dependency,
    ).toBe('present');
    expect(fixture.componentInstance.injected).toBe('provider value');
    expect(fixture.componentInstance.viewInjected).toBe('view value');
    expect(fixture.debugElement.injector.get(TargetComponent)).toBe(
      fixture.componentInstance,
    );
    expect(metadata).toEqual(
      jasmine.objectContaining({
        changeDetection: ChangeDetectionStrategy.OnPush,
        encapsulation: ViewEncapsulation.None,
        exportAs: 'metadataTarget',
        imports: [DependencyDirective],
        preserveWhitespaces: true,
        standalone: true,
        styles: ['span { color: rgb(1, 2, 3); }'],
        template: '<span dependency>{{ value }}</span>',
        viewProviders: originalViewProviders,
      }),
    );
    expect(metadata.providers).toEqual([
      ...originalProviders,
      { provide: TargetComponent, useExisting: child },
    ]);
    expect(child.ɵcmp.onPush).toBe(true);
    expect(child.ɵcmp.encapsulation).toBe(ViewEncapsulation.None);
    expect(child.ɵcmp.styles).toEqual(originalMetadata.styles);
    expect(child.ɵcmp.exportAs).toEqual(['metadataTarget']);
    expect(originalMetadata.providers).toEqual(originalProviders);
    expect(originalMetadata.viewProviders).toEqual(
      originalViewProviders,
    );
  });

  it('preserves signal inputs and ordinary input transforms on component clones', () => {
    @Component({
      standalone: false,
      template: '',
    })
    class TargetComponent {
      // Root tests transpile the fixture without Angular's signal transform.
      @Input({ alias: 'publicValue', isSignal: true } as never)
      public readonly value = input(0);

      @Input({ alias: 'publicPlain', transform: String })
      public plain = '';
    }

    const originalInputs =
      reflectComponentType(TargetComponent)?.inputs;
    const originalTemplateInputs = [
      ...(coreReflectDirectiveResolve(TargetComponent).inputs || []),
    ];
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.stub();

    const template = funcReflectTemplate(TargetComponent);

    const child =
      configure.calls.mostRecent().args[0].declarations![0];
    const inputs = reflectComponentType(child)?.inputs;
    expect(inputs).toEqual(
      jasmine.arrayContaining([
        jasmine.objectContaining({
          isSignal: true,
          propName: 'value',
          templateName: 'publicValue',
        }),
        jasmine.objectContaining({
          isSignal: false,
          propName: 'plain',
          templateName: 'publicPlain',
          transform: String,
        }),
      ]),
    );
    expect(inputs?.length).toEqual(2);
    expect(reflectComponentType(TargetComponent)?.inputs).toEqual(
      originalInputs,
    );
    expect(template.inputs?.length).toEqual(2);
    expect(template.inputs).toEqual(originalTemplateInputs);
    expect(
      coreReflectDirectiveResolve(TargetComponent).inputs,
    ).toEqual(originalTemplateInputs);
    expect(
      (TargetComponent as any).__prop__metadata__.value.length,
    ).toEqual(1);
    expect(
      (TargetComponent as any).__prop__metadata__.plain.length,
    ).toEqual(1);
  });

  it('preserves signal metadata from effective directive input overrides', () => {
    @Directive({
      selector: '[first],[second]',
      standalone: false,
    })
    class TargetDirective {
      @Input({ alias: 'publicValue', isSignal: true } as never)
      public readonly value = input(0);
    }

    TestBed.configureTestingModule({});
    spyOn((TestBed as any).ngMocksOverrides, 'get').and.returnValue({
      override: {
        set: {
          inputs: [
            {
              alias: 'overrideValue',
              isSignal: true,
              name: 'value',
              required: true,
            },
          ],
        },
      },
    });
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.stub();

    funcReflectTemplate(TargetDirective);

    const child =
      configure.calls.mostRecent().args[0].declarations![0];
    expect(child.ɵdir.inputs.overrideValue[1]).toEqual(1);
    expect(child.__prop__metadata__.value).toEqual([
      jasmine.objectContaining({
        alias: 'overrideValue',
        isSignal: true,
        required: true,
      }),
    ]);
    expect((TargetDirective as any).__prop__metadata__.value).toEqual(
      [
        jasmine.objectContaining({
          alias: 'publicValue',
          isSignal: true,
        }),
      ],
    );
  });

  it('preserves ordinary input alias precedence when a property is declared twice', () => {
    @Component({
      inputs: ['value:first', 'value:second'],
      standalone: false,
      template: '',
    })
    class TargetComponent {
      public value = '';
    }

    const originalInputs =
      reflectComponentType(TargetComponent)?.inputs;
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.stub();

    funcReflectTemplate(TargetComponent);

    const child =
      configure.calls.mostRecent().args[0].declarations![0];
    expect(reflectComponentType(child)?.inputs).toEqual(
      originalInputs,
    );
    expect(originalInputs).toEqual([
      jasmine.objectContaining({
        propName: 'value',
        templateName: 'second',
      }),
    ]);
  });

  it('accepts an override with undefined input metadata', () => {
    @Component({
      standalone: false,
      template: '',
    })
    class TargetComponent {}

    TestBed.configureTestingModule({});
    spyOn((TestBed as any).ngMocksOverrides, 'get').and.returnValue({
      override: {
        set: { inputs: undefined },
      },
    });
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.stub();

    funcReflectTemplate(TargetComponent);

    const child =
      configure.calls.mostRecent().args[0].declarations![0];
    expect(reflectComponentType(child)?.inputs).toEqual([]);
  });
});
