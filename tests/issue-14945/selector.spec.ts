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
  selector: 'selector-default-14945',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ items.length }}',
})
class SelectorDefaultComponent {
  @Input() public items: string[] = [];
}

@NgModule({
  declarations: [SelectorDefaultComponent],
  exports: [SelectorDefaultComponent],
})
class SelectorDefaultModule {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'selector-on-push-14945',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ items.length }}',
})
class SelectorOnPushComponent {
  @Input() public items: string[] = [];
}

@NgModule({
  declarations: [SelectorOnPushComponent],
  exports: [SelectorOnPushComponent],
})
class SelectorOnPushModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14945
describe('issue-14945:selector', () => {
  it('uses an OnPush override applied after the simple-selector factory is created', async () => {
    await MockBuilder(
      SelectorDefaultComponent,
      SelectorDefaultModule,
    );
    const factory = MockRenderFactory(SelectorDefaultComponent, [
      'items',
    ]);

    TestBed.overrideComponent(SelectorDefaultComponent, {
      set: { changeDetection: ChangeDetectionStrategy.OnPush },
    });
    await TestBed.compileComponents();

    const parameters: { items: string[] } = { items: [] };
    const items = parameters.items;
    const fixture = factory(parameters);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).toBe(SelectorDefaultComponent);
    expect(fixture.point.injector.get(SelectorDefaultComponent)).toBe(
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

  it('uses a Default override applied after the simple-selector factory is created', async () => {
    await MockBuilder(SelectorOnPushComponent, SelectorOnPushModule);
    const factory = MockRenderFactory(SelectorOnPushComponent, [
      'items',
    ]);

    TestBed.overrideComponent(SelectorOnPushComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    });
    await TestBed.compileComponents();

    const parameters: { items: string[] } = { items: [] };
    const items = parameters.items;
    const fixture = factory(parameters);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).toBe(SelectorOnPushComponent);
    expect(fixture.point.injector.get(SelectorOnPushComponent)).toBe(
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
