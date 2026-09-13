import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Inject,
  InjectionToken,
  Input,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockRenderFactory, ngMocks } from 'ng-mocks';

// Class instances retain provider identity when View Engine compiles metadata.
class Value {
  public constructor(public readonly label: string) {}
}

const COMPONENT = new InjectionToken<Value>('component provider');
const VIEW = new InjectionToken<Value>('component view provider');
const DIRECTIVE = new InjectionToken<Value>('directive provider');
const componentValue = new Value('original provider');
const viewValue = new Value('original view');
const directiveValue = new Value('original directive');

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  host: {
    'data-metadata-override-component': '',
    '[attr.data-label]': 'label',
    '(click)': 'originalClicks = originalClicks + 1',
    role: 'button',
  },
  providers: [{ provide: COMPONENT, useValue: componentValue }],
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'original:{{ label }}:{{ local.label }}:{{ view.label }}',
  viewProviders: [{ provide: VIEW, useValue: viewValue }],
})
class TargetComponent {
  @Input() public label = '';
  public originalClicks = 0;
  public overrideClicks = 0;

  public constructor(
    @Inject(COMPONENT) public readonly local: Value,
    @Inject(VIEW) public readonly view: Value,
  ) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class ComponentModule {}

@Directive({
  host: {
    '[attr.data-label]': 'label',
    '(click)': 'originalClicks = originalClicks + 1',
    role: 'button',
  },
  providers: [{ provide: DIRECTIVE, useValue: directiveValue }],
  selector: '[metadataOverrideFirst], [metadataOverrideSecond]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {
  @Input() public label = '';
  public originalClicks = 0;
  public overrideClicks = 0;

  public constructor(
    @Inject(DIRECTIVE) public readonly local: Value,
  ) {}
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'metadata-override-directive-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<div metadataOverrideFirst [label]="label"></div>',
})
class DirectiveHostComponent {
  public label = 'restored';
}

@NgModule({
  declarations: [TargetDirective, DirectiveHostComponent],
  exports: [TargetDirective],
})
class DirectiveModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14945
describe('mock-render-metadata:overrides', () => {
  it('uses late component overrides and leaves the original metadata reusable', async () => {
    TestBed.configureTestingModule({ imports: [ComponentModule] });
    const factory = MockRenderFactory(TargetComponent, ['label']);
    const configuredValue = new Value('configured provider');
    const configuredView = new Value('configured view');

    // The override targets the original after its render subtype was created.
    TestBed.overrideComponent(TargetComponent, {
      set: {
        host: {
          '[attr.data-label]': 'label',
          '(click)': 'overrideClicks = overrideClicks + 1',
          role: 'presentation',
        },
        providers: [
          { provide: COMPONENT, useValue: configuredValue },
        ],
        template:
          'override:{{ label }}:{{ local.label }}:{{ view.label }}',
        viewProviders: [{ provide: VIEW, useValue: configuredView }],
      },
    });
    await TestBed.compileComponents();

    const fixture = factory({ label: 'bound' });
    const target = fixture.point.componentInstance;
    const element = fixture.point.nativeElement;
    fixture.detectChanges();

    expect(target.constructor).not.toBe(TargetComponent);
    expect(target instanceof TargetComponent).toBe(true);
    expect(fixture.point.injector.get(TargetComponent)).toBe(target);
    expect(target.local).toBe(configuredValue);
    expect(target.view).toBe(configuredView);
    expect(fixture.point.injector.get(COMPONENT)).toBe(
      configuredValue,
    );
    expect(fixture.point.injector.get(VIEW)).toBe(configuredView);
    expect(ngMocks.formatText(fixture)).toBe(
      'override:bound:configured provider:configured view',
    );
    expect(element.getAttribute('role')).toBe('presentation');
    expect(element.dataset.label).toBe('bound');

    fixture.point.triggerEventHandler('click', { type: 'click' });

    expect(target.overrideClicks).toBe(1);
    expect(target.originalClicks).toBe(0);

    fixture.componentInstance.label = 'updated';
    fixture.detectChanges();
    fixture.point.triggerEventHandler('click', { type: 'click' });

    expect(ngMocks.formatText(fixture)).toBe(
      'override:updated:configured provider:configured view',
    );
    expect(element.dataset.label).toBe('updated');
    expect(target.overrideClicks).toBe(2);
    expect(target.originalClicks).toBe(0);

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ComponentModule],
    }).compileComponents();
    const originalFixture = TestBed.createComponent(TargetComponent);
    const original = originalFixture.componentInstance;
    original.label = 'restored';
    originalFixture.detectChanges();
    originalFixture.debugElement.triggerEventHandler('click', {
      type: 'click',
    });

    expect(original.constructor).toBe(TargetComponent);
    expect(original.local).toBe(componentValue);
    expect(original.view).toBe(viewValue);
    expect(ngMocks.formatText(originalFixture)).toBe(
      'original:restored:original provider:original view',
    );
    expect(originalFixture.nativeElement.getAttribute('role')).toBe(
      'button',
    );
    expect(originalFixture.nativeElement.dataset.label).toBe(
      'restored',
    );
    expect(original.originalClicks).toBe(1);
    expect(original.overrideClicks).toBe(0);
  });

  it('uses late directive overrides and leaves the original metadata reusable', async () => {
    TestBed.configureTestingModule({ imports: [DirectiveModule] });
    const factory = MockRenderFactory(TargetDirective, ['label']);
    const configuredValue = new Value('configured directive');

    TestBed.overrideDirective(TargetDirective, {
      set: {
        host: {
          '[attr.data-label]': 'label',
          '(click)': 'overrideClicks = overrideClicks + 1',
          role: 'link',
        },
        providers: [
          { provide: DIRECTIVE, useValue: configuredValue },
        ],
      },
    });
    await TestBed.compileComponents();

    const fixture = factory({ label: 'bound' });
    const target = fixture.point.componentInstance;
    const element = fixture.point.nativeElement;
    fixture.detectChanges();

    expect(target.constructor).not.toBe(TargetDirective);
    expect(target instanceof TargetDirective).toBe(true);
    expect(fixture.point.injector.get(TargetDirective)).toBe(target);
    expect(target.local).toBe(configuredValue);
    expect(fixture.point.injector.get(DIRECTIVE)).toBe(
      configuredValue,
    );
    expect(element.getAttribute('role')).toBe('link');
    expect(element.dataset.label).toBe('bound');

    fixture.point.triggerEventHandler('click', { type: 'click' });

    expect(target.overrideClicks).toBe(1);
    expect(target.originalClicks).toBe(0);

    fixture.componentInstance.label = 'updated';
    fixture.detectChanges();
    fixture.point.triggerEventHandler('click', { type: 'click' });

    expect(target.label).toBe('updated');
    expect(element.dataset.label).toBe('updated');
    expect(target.overrideClicks).toBe(2);
    expect(target.originalClicks).toBe(0);

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DirectiveModule],
    }).compileComponents();
    const originalFixture = TestBed.createComponent(
      DirectiveHostComponent,
    );
    originalFixture.detectChanges();
    const originalElement = ngMocks.find(
      originalFixture,
      '[metadataOverrideFirst]',
    );
    const original = ngMocks.get(originalElement, TargetDirective);
    originalElement.triggerEventHandler('click', { type: 'click' });

    expect(original.constructor).toBe(TargetDirective);
    expect(original.local).toBe(directiveValue);
    expect(originalElement.nativeElement.getAttribute('role')).toBe(
      'button',
    );
    expect(originalElement.nativeElement.dataset.label).toBe(
      'restored',
    );
    expect(original.originalClicks).toBe(1);
    expect(original.overrideClicks).toBe(0);
  });
});
