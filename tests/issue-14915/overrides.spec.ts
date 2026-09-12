import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ items.length }}',
})
class DefaultComponent {
  @Input() public items: string[] = [];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ items.length }}',
})
class OnPushComponent {
  @Input() public items: string[] = [];
}

@NgModule({
  declarations: [DefaultComponent, OnPushComponent],
  exports: [DefaultComponent, OnPushComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14915
describe('issue-14915:overrides', () => {
  // Angular 9-11 share the spread corpus with View Engine, which has no Ivy
  // definitions. Compiled Ivy targets execute both definition-refresh cases.
  if (
    !(DefaultComponent as any).ɵcmp ||
    !(OnPushComponent as any).ɵcmp
  ) {
    it('needs Ivy declaration metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    MockBuilder([DefaultComponent, OnPushComponent], TargetModule),
  );

  it('preserves a Default to OnPush override after the clone is created', async () => {
    const initialDefinition = (DefaultComponent as any).ɵcmp;
    const factory = MockRenderFactory(DefaultComponent, ['items']);

    expect((DefaultComponent as any).ɵcmp).toBe(initialDefinition);
    expect(initialDefinition.onPush).toBe(false);

    // Angular recompiles the original after MockRenderFactory has reflected it.
    TestBed.overrideComponent(DefaultComponent, {
      set: { changeDetection: ChangeDetectionStrategy.OnPush },
    });
    await TestBed.compileComponents();
    const originalDefinition = (DefaultComponent as any).ɵcmp;
    expect(originalDefinition).not.toBe(initialDefinition);
    expect(originalDefinition.onPush).toBe(true);

    const parameters: { items: string[] } = { items: [] };
    const fixture = factory(parameters);
    const instance = fixture.point.componentInstance;
    const cloneDefinition = (instance.constructor as any).ɵcmp;

    expect(instance.constructor).not.toBe(DefaultComponent);
    expect(instance instanceof DefaultComponent).toBe(true);
    expect(fixture.point.injector.get(DefaultComponent)).toBe(
      instance,
    );
    expect(cloneDefinition).not.toBe(originalDefinition);
    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items.push('first');
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(instance.items).toEqual(['first']);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items = ['first', 'second'];
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(instance.items).toEqual(['first', 'second']);
    expect(ngMocks.formatText(fixture)).toEqual('2');
    expect((instance.constructor as any).ɵcmp).toBe(cloneDefinition);
    expect(cloneDefinition.onPush).toBe(true);
    expect((DefaultComponent as any).ɵcmp).toBe(originalDefinition);
    expect(originalDefinition.onPush).toBe(true);
    expect(initialDefinition.onPush).toBe(false);
  });

  it('preserves an OnPush to Default override after the clone is created', async () => {
    const initialDefinition = (OnPushComponent as any).ɵcmp;
    const factory = MockRenderFactory(OnPushComponent, ['items']);

    expect((OnPushComponent as any).ɵcmp).toBe(initialDefinition);
    expect(initialDefinition.onPush).toBe(true);

    TestBed.overrideComponent(OnPushComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    });
    await TestBed.compileComponents();
    const originalDefinition = (OnPushComponent as any).ɵcmp;
    expect(originalDefinition).not.toBe(initialDefinition);
    expect(originalDefinition.onPush).toBe(false);

    const parameters: { items: string[] } = { items: [] };
    const fixture = factory(parameters);
    const instance = fixture.point.componentInstance;
    const cloneDefinition = (instance.constructor as any).ɵcmp;

    expect(instance.constructor).not.toBe(OnPushComponent);
    expect(instance instanceof OnPushComponent).toBe(true);
    expect(fixture.point.injector.get(OnPushComponent)).toBe(
      instance,
    );
    expect(cloneDefinition).not.toBe(originalDefinition);
    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items.push('first');
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(instance.items).toEqual(['first']);
    expect(ngMocks.formatText(fixture)).toEqual('1');

    fixture.componentInstance.items = ['first', 'second'];
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(instance.items).toEqual(['first', 'second']);
    expect(ngMocks.formatText(fixture)).toEqual('2');
    expect((instance.constructor as any).ɵcmp).toBe(cloneDefinition);
    expect(cloneDefinition.onPush).toBe(false);
    expect((OnPushComponent as any).ɵcmp).toBe(originalDefinition);
    expect(originalDefinition.onPush).toBe(false);
    expect(initialDefinition.onPush).toBe(true);
  });
});
