import { Component, NgModule } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-mock-forms-update-on',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <input
      name="inputName"
      [(ngModel)]="inputValue"
      [ngModelOptions]="{ updateOn: 'blur' }"
    />
  `,
})
class TargetComponent {
  public inputValue = 'Ada';
}

@NgModule({
  declarations: [TargetComponent],
  imports: [FormsModule],
})
class TargetModule {}

describe('MockForms:update-on', () => {
  // Keep real form bindings so Angular applies the configured update policy.
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(FormsModule),
  );

  it('commits the value during the blur included in ngMocks.change', async () => {
    // Wait for ngModel to register the control before exercising its update policy.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.find('[name="inputName"]');
    const control = ngMocks.get(input, NgModel).control;

    // Read the value and state.
    expect(component.inputValue).toBe('Ada');
    expect(input.nativeElement.value).toBe('Ada');
    expect(control.dirty).toBe(false);
    expect(control.touched).toBe(false);

    // An input event alone leaves the edit pending until blur.
    input.nativeElement.value = 'Pending';
    ngMocks.trigger(input, 'input');

    expect(component.inputValue).toBe('Ada');
    expect(control.value).toBe('Ada');
    expect(input.nativeElement.value).toBe('Pending');
    expect(control.dirty).toBe(false);
    expect(control.touched).toBe(false);

    // The included blur commits this edit before ngMocks.change returns.
    ngMocks.change('[name="inputName"]', 'Grace');
    // or ngMocks.change(input, 'Grace');

    // Assert the result before another render or async turn.
    expect(component.inputValue).toBe('Grace');
    expect(control.value).toBe('Grace');
    expect(input.nativeElement.value).toBe('Grace');
    expect(control.dirty).toBe(true);
    expect(control.touched).toBe(true);
  });
});
