import { Component, Input, NgModule, VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ items.length }}',
})
class TargetComponent {
  @Input() public items: string[] = [];
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14915
describe('issue-14915:classic', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('preserves the framework default on a selectorless NgModule component', () => {
    const parameters: { items: string[] } = { items: [] };
    const fixture = MockRender(TargetComponent, parameters);
    const instance = fixture.point.componentInstance;

    expect(instance.constructor).not.toBe(TargetComponent);
    expect(instance instanceof TargetComponent).toBe(true);
    expect(fixture.point.injector.get(TargetComponent)).toBe(
      instance,
    );
    expect(instance.items).toBe(parameters.items);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.items.push('first');
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(instance.items).toEqual(['first']);
    // Omitted strategies are eager before Angular 22 and OnPush from Angular 22.
    // Recompiling a selectorless component must preserve that distinction.
    if (Number.parseInt(VERSION.major, 10) >= 22) {
      expect(ngMocks.formatText(fixture)).toEqual('0');
    } else {
      expect(ngMocks.formatText(fixture)).toEqual('1');
    }

    fixture.componentInstance.items = ['first', 'second'];
    fixture.detectChanges();

    expect(instance.items).toBe(parameters.items);
    expect(instance.items).toEqual(['first', 'second']);
    expect(ngMocks.formatText(fixture)).toEqual('2');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [TargetModule] });
    const original = TestBed.createComponent(TargetComponent);

    expect(original.componentInstance.constructor).toBe(
      TargetComponent,
    );
    expect(original.componentInstance.items).toEqual([]);
    original.componentInstance.items = ['original'];
    original.detectChanges();

    expect(ngMocks.formatText(original)).toEqual('1');
  });
});
