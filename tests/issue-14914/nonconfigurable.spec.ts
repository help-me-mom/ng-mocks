import {
  Component,
  Directive,
  HostBinding,
  Injectable,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  public label = 'original service';
}

@Directive({
  selector: '[base14914Nonconfigurable]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class BaseDeclaration {
  public constructor(public readonly service: TargetService) {}

  @HostBinding('attr.data-label')
  public get label(): string {
    return this.service.label;
  }
}

@Component({
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ service.label }}',
})
class TargetComponent extends BaseDeclaration {
  // Keep fixture DI explicit for Angular 14 ES5 JIT; the generated middleware
  // inherits this constructor while shadowing the locked Ivy definitions.
  public constructor(service: TargetService) {
    super(service);
  }
}

@Directive({
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
} as never)
class TargetDirective extends BaseDeclaration {
  public constructor(service: TargetService) {
    super(service);
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14914
describe('issue-14914:nonconfigurable', () => {
  // View Engine runners do not expose Ivy definitions. Compiled Ivy spread
  // targets execute both cases; locking their descriptors models production JIT.
  if (
    !(TargetComponent as any).ɵcmp ||
    !(TargetDirective as any).ɵdir
  ) {
    it('needs Ivy declaration metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  it('renders a selectorless component with nonconfigurable inherited definitions', async () => {
    const definitions = new Map<string, any>();
    const descriptors = new Map<string, PropertyDescriptor>();
    for (const field of ['ɵcmp', 'ɵfac']) {
      definitions.set(field, (TargetComponent as any)[field]);
      // Keep Angular's real definition/getter and only lock its descriptor.
      Object.defineProperty(TargetComponent, field, {
        configurable: false,
      });
      descriptors.set(
        field,
        Object.getOwnPropertyDescriptor(TargetComponent, field)!,
      );
    }
    const selectors = definitions
      .get('ɵcmp')
      .selectors.map((selector: any[]) => selector.slice());
    const service = { label: 'component service' };
    await MockBuilder().provide({
      provide: TargetService,
      useValue: service,
    });

    const fixture = MockRender(TargetComponent);
    const instance = fixture.point.componentInstance;
    const generated: any = instance.constructor;

    expect(generated).not.toBe(TargetComponent);
    expect(Object.getPrototypeOf(generated.prototype)).toBe(
      TargetComponent.prototype,
    );
    expect(instance instanceof TargetComponent).toBe(true);
    expect(instance.service).toBe(service);
    expect(fixture.point.injector.get(TargetComponent)).toBe(
      instance,
    );
    expect(fixture.point.injector.get(TargetService)).toBe(service);
    expect(ngMocks.formatText(fixture)).toEqual('component service');
    expect(fixture.point.nativeElement.dataset.label).toEqual(
      'component service',
    );
    for (const field of ['ɵcmp', 'ɵfac']) {
      expect(
        Object.prototype.hasOwnProperty.call(generated, field),
      ).toBe(true);
      expect(generated[field]).toBeDefined();
      expect(generated[field]).not.toBe(definitions.get(field));
      expect((TargetComponent as any)[field]).toBe(
        definitions.get(field),
      );
      expect(
        Object.getOwnPropertyDescriptor(TargetComponent, field),
      ).toEqual(descriptors.get(field));
    }
    expect(generated.ɵcmp.type).toBe(generated);
    expect((TargetComponent as any).ɵcmp.selectors).toEqual(
      selectors,
    );
  });

  it('renders a selectorless directive with nonconfigurable inherited definitions', async () => {
    const definitions = new Map<string, any>();
    const descriptors = new Map<string, PropertyDescriptor>();
    for (const field of ['ɵdir', 'ɵfac']) {
      definitions.set(field, (TargetDirective as any)[field]);
      Object.defineProperty(TargetDirective, field, {
        configurable: false,
      });
      descriptors.set(
        field,
        Object.getOwnPropertyDescriptor(TargetDirective, field)!,
      );
    }
    const selectors = definitions
      .get('ɵdir')
      .selectors.map((selector: any[]) => selector.slice());
    const service = { label: 'directive service' };
    await MockBuilder().provide({
      provide: TargetService,
      useValue: service,
    });

    const fixture = MockRender(TargetDirective);
    const instance = fixture.point.componentInstance;
    const generated: any = instance.constructor;

    expect(generated).not.toBe(TargetDirective);
    expect(Object.getPrototypeOf(generated.prototype)).toBe(
      TargetDirective.prototype,
    );
    expect(instance instanceof TargetDirective).toBe(true);
    expect(instance.service).toBe(service);
    expect(fixture.point.injector.get(TargetDirective)).toBe(
      instance,
    );
    expect(fixture.point.injector.get(TargetService)).toBe(service);
    expect(fixture.point.nativeElement.dataset.label).toEqual(
      'directive service',
    );
    for (const field of ['ɵdir', 'ɵfac']) {
      expect(
        Object.prototype.hasOwnProperty.call(generated, field),
      ).toBe(true);
      expect(generated[field]).toBeDefined();
      expect(generated[field]).not.toBe(definitions.get(field));
      expect((TargetDirective as any)[field]).toBe(
        definitions.get(field),
      );
      expect(
        Object.getOwnPropertyDescriptor(TargetDirective, field),
      ).toEqual(descriptors.get(field));
    }
    expect(generated.ɵdir.type).toBe(generated);
    expect((TargetDirective as any).ɵdir.selectors).toEqual(
      selectors,
    );
  });
});
