import { Component, NgModule } from '@angular/core';
import { DefaultValueAccessor, FormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-change-317',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
  template: `
    <input data-testid="inputControl" [(ngModel)]="value" />
    <span></span>
  `,
})
class TargetComponent {
  public value: number | null = null;
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [FormsModule],
})
class TargetModule {}

describe('ng-mocks-change:317', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(TargetModule)
      .mock(DefaultValueAccessor),
  );

  it('finds by css selector', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    // normal change
    expect(component.value).toEqual(null);
    ngMocks.change('input', 123);
    expect(component.value).toEqual(123);
  });

  it('finds by attribute selector', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    // normal change
    expect(component.value).toEqual(null);
    ngMocks.change(['data-testid', 'inputControl'], 123);
    expect(component.value).toEqual(123);
  });

  it('throws on undefined', () => {
    MockRender(TargetComponent);
    try {
      ngMocks.change(undefined, 123);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'Cannot find an element via ngMocks.change(<EMPTY>)',
      );
    }
  });

  it('throws on unknown', () => {
    MockRender(TargetComponent);
    try {
      ngMocks.change('span', 123);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'Cannot find ControlValueAccessor on the element',
      );
    }
  });
});
