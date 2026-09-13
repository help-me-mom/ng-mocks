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
  host: { 'data-early-default': '' },
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ items.length }}',
})
class EarlyDefaultComponent {
  @Input() public items: string[] = [];
}

@NgModule({
  declarations: [EarlyDefaultComponent],
  exports: [EarlyDefaultComponent],
})
class EarlyDefaultModule {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-early-on-push': '' },
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ items.length }}',
})
class EarlyOnPushComponent {
  @Input() public items: string[] = [];
}

@NgModule({
  declarations: [EarlyOnPushComponent],
  exports: [EarlyOnPushComponent],
})
class EarlyOnPushModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14945
describe('issue-14945:before-factory', () => {
  it('uses an OnPush override compiled before the selectorless factory is created', async () => {
    await MockBuilder(EarlyDefaultComponent, EarlyDefaultModule);
    TestBed.overrideComponent(EarlyDefaultComponent, {
      set: { changeDetection: ChangeDetectionStrategy.OnPush },
    });
    await TestBed.compileComponents();
    const factory = MockRenderFactory(EarlyDefaultComponent, [
      'items',
    ]);

    const parameters: { items: string[] } = { items: [] };
    const items = parameters.items;
    const fixture = factory(parameters);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).not.toBe(EarlyDefaultComponent);
    expect(instance instanceof EarlyDefaultComponent).toBe(true);
    expect(fixture.point.injector.get(EarlyDefaultComponent)).toBe(
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

  it('uses a Default override compiled before the selectorless factory is created', async () => {
    await MockBuilder(EarlyOnPushComponent, EarlyOnPushModule);
    TestBed.overrideComponent(EarlyOnPushComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    });
    await TestBed.compileComponents();
    const factory = MockRenderFactory(EarlyOnPushComponent, [
      'items',
    ]);

    const parameters: { items: string[] } = { items: [] };
    const items = parameters.items;
    const fixture = factory(parameters);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).not.toBe(EarlyOnPushComponent);
    expect(instance instanceof EarlyOnPushComponent).toBe(true);
    expect(fixture.point.injector.get(EarlyOnPushComponent)).toBe(
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
