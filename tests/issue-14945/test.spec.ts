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
  host: { 'data-late-default': '' },
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ items.length }}',
})
class LateDefaultComponent {
  @Input() public items: string[] = [];
}

@NgModule({
  declarations: [LateDefaultComponent],
  exports: [LateDefaultComponent],
})
class LateDefaultModule {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-late-on-push': '' },
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ items.length }}',
})
class LateOnPushComponent {
  @Input() public items: string[] = [];
}

@NgModule({
  declarations: [LateOnPushComponent],
  exports: [LateOnPushComponent],
})
class LateOnPushModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14945
describe('issue-14945', () => {
  it('uses an OnPush override applied after the selectorless factory is created', async () => {
    await MockBuilder(LateDefaultComponent, LateDefaultModule);
    const factory = MockRenderFactory(LateDefaultComponent, [
      'items',
    ]);

    // The factory has already created a separately decorated middleware class.
    TestBed.overrideComponent(LateDefaultComponent, {
      set: { changeDetection: ChangeDetectionStrategy.OnPush },
    });
    await TestBed.compileComponents();

    const parameters: { items: string[] } = { items: [] };
    const items = parameters.items;
    const fixture = factory(parameters);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).not.toBe(LateDefaultComponent);
    expect(instance instanceof LateDefaultComponent).toBe(true);
    expect(fixture.point.injector.get(LateDefaultComponent)).toBe(
      instance,
    );
    expect(instance.items).toBe(items);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items.push('first');
    fixture.detectChanges();

    expect(instance.items).toBe(items);
    expect(parameters.items).toBe(items);
    expect(instance.items).toEqual(['first']);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    const replacement = ['first', 'second'];
    fixture.componentInstance.items = replacement;
    fixture.detectChanges();

    expect(instance.items).toBe(replacement);
    expect(parameters.items).toBe(replacement);
    expect(items).toEqual(['first']);
    expect(ngMocks.formatText(fixture)).toEqual('2');
  });

  it('uses a Default override applied after the selectorless factory is created', async () => {
    await MockBuilder(LateOnPushComponent, LateOnPushModule);
    const factory = MockRenderFactory(LateOnPushComponent, ['items']);

    TestBed.overrideComponent(LateOnPushComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    });
    await TestBed.compileComponents();

    const parameters: { items: string[] } = { items: [] };
    const items = parameters.items;
    const fixture = factory(parameters);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).not.toBe(LateOnPushComponent);
    expect(instance instanceof LateOnPushComponent).toBe(true);
    expect(fixture.point.injector.get(LateOnPushComponent)).toBe(
      instance,
    );
    expect(instance.items).toBe(items);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items.push('first');
    fixture.detectChanges();

    expect(instance.items).toBe(items);
    expect(parameters.items).toBe(items);
    expect(instance.items).toEqual(['first']);
    expect(ngMocks.formatText(fixture)).toEqual('1');

    const replacement = ['first', 'second'];
    fixture.componentInstance.items = replacement;
    fixture.detectChanges();

    expect(instance.items).toBe(replacement);
    expect(parameters.items).toBe(replacement);
    expect(items).toEqual(['first']);
    expect(ngMocks.formatText(fixture)).toEqual('2');
  });
});
