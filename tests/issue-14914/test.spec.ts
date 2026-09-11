import {
  Component,
  Directive,
  HostBinding,
  Inject,
  Injectable,
  InjectionToken,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

class Dependency {
  public constructor(public readonly label: string) {}
}

const TOKEN = new InjectionToken<Dependency>('issue-14914');
// View Engine copies literal provider objects; class instances retain identity.
const componentValue = new Dependency('component');
const directiveValue = new Dependency('directive');
const originalValue = new Dependency('original directive');

@Injectable()
class TargetService {
  public label = 'service';
}

@Directive({
  selector: '[base14914]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class BaseDeclaration {
  public constructor(
    public readonly service: TargetService,
    @Inject(TOKEN) public readonly value: { label: string },
  ) {}

  @HostBinding('attr.data-value')
  public get label(): string {
    return this.value.label;
  }
}

@Component({
  providers: [{ provide: TOKEN, useValue: componentValue }],
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ service.label }}:{{ value.label }}',
})
class TargetComponent extends BaseDeclaration {}

@Directive({
  providers: [{ provide: TOKEN, useValue: directiveValue }],
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
} as never)
class TargetDirective extends BaseDeclaration {}

@Directive({
  providers: [{ provide: TOKEN, useValue: originalValue }],
  selector: '[original14914]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class OriginalDirective extends TargetDirective {}

@Component({
  selector: 'host-14914',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<span original14914></span>',
})
class HostComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14914
describe('issue-14914', () => {
  it('isolates selectorless component metadata and inherits constructor dependencies', async () => {
    const service = new TargetService();
    service.label = 'provided service';
    await MockBuilder().provide({
      provide: TargetService,
      useValue: service,
    });

    const fixture = MockRender(TargetComponent);
    const instance = fixture.point.componentInstance;

    // The rendered middleware really subclasses the decorated declaration.
    expect(instance.constructor).not.toBe(TargetComponent);
    expect(
      Object.getPrototypeOf(instance.constructor.prototype),
    ).toBe(TargetComponent.prototype);
    expect(instance instanceof TargetComponent).toBe(true);
    expect(instance.service).toBe(service);
    expect(instance.value).toBe(componentValue);
    expect(fixture.point.injector.get(TargetComponent)).toBe(
      instance,
    );
    expect(fixture.point.injector.get(TargetService)).toBe(service);
    expect(ngMocks.formatText(fixture)).toEqual(
      'provided service:component',
    );
    expect(fixture.point.nativeElement.dataset.value).toEqual(
      'component',
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [{ provide: TargetService, useValue: service }],
    });
    const original = TestBed.createComponent(TargetComponent);
    original.detectChanges();

    expect(original.componentInstance.constructor).toBe(
      TargetComponent,
    );
    expect(original.componentInstance.service).toBe(service);
    expect(original.componentInstance.value).toBe(componentValue);
    expect(ngMocks.formatText(original)).toEqual(
      'provided service:component',
    );
    expect(original.nativeElement.dataset.value).toEqual('component');
  });

  it('isolates selectorless directive metadata and preserves the original as a base declaration', async () => {
    const service = new TargetService();
    service.label = 'provided service';
    await MockBuilder().provide({
      provide: TargetService,
      useValue: service,
    });

    const fixture = MockRender(TargetDirective);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).not.toBe(TargetDirective);
    expect(
      Object.getPrototypeOf(instance.constructor.prototype),
    ).toBe(TargetDirective.prototype);
    expect(instance instanceof TargetDirective).toBe(true);
    expect(instance.service).toBe(service);
    expect(instance.value).toBe(directiveValue);
    expect(fixture.point.injector.get(TargetDirective)).toBe(
      instance,
    );
    expect(fixture.point.injector.get(TargetService)).toBe(service);
    expect(fixture.point.nativeElement.dataset.value).toEqual(
      'directive',
    );

    TestBed.resetTestingModule();
    // A selectorless directive is used by Angular through a concrete subclass.
    TestBed.configureTestingModule({
      declarations: [OriginalDirective, HostComponent],
      providers: [{ provide: TargetService, useValue: service }],
    });
    const original = TestBed.createComponent(HostComponent);
    original.detectChanges();
    const directive = ngMocks.findInstance(
      original,
      OriginalDirective,
    );

    expect(directive.constructor).toBe(OriginalDirective);
    expect(directive instanceof TargetDirective).toBe(true);
    expect(directive.service).toBe(service);
    expect(directive.value).toBe(originalValue);
    expect(
      ngMocks.find(original, 'span').nativeElement.dataset.value,
    ).toEqual('original directive');
  });
});
