import { Component, NgModule } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-reactive-forms-update-on',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: ` <input [formControl]="inputValue" /> `,
})
class TargetComponent {
  public readonly inputValue = new FormControl('Ada', {
    updateOn: 'blur',
  });
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('MockReactiveForms:update-on', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule)
      // Keep the real binding so Angular applies its updateOn policy.
      .keep(ReactiveFormsModule),
  );

  it('commits the value during the blur included in ngMocks.change', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.reveal([
      'formControl',
      component.inputValue,
    ]);

    // Read the value and state.
    expect(component.inputValue.value).toBe('Ada');
    expect(input.nativeNode.value).toBe('Ada');
    expect(component.inputValue.dirty).toBe(false);
    expect(component.inputValue.touched).toBe(false);

    // An input event alone leaves the edit pending until blur.
    input.nativeNode.value = 'Pending';
    ngMocks.trigger(input, 'input');

    expect(component.inputValue.value).toBe('Ada');
    expect(input.nativeNode.value).toBe('Pending');
    expect(component.inputValue.dirty).toBe(false);
    expect(component.inputValue.touched).toBe(false);

    // Change the value, including its blur event.
    ngMocks.change(input, 'Grace');

    // Assert the result before another render.
    expect(component.inputValue.value).toBe('Grace');
    expect(input.nativeNode.value).toBe('Grace');
    expect(component.inputValue.dirty).toBe(true);
    expect(component.inputValue.touched).toBe(true);
  });
});
