import {
  ChangeDetectorRef,
  Component,
  NgModule,
} from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-mock-form-bindings',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: ` <input name="inputName" [(ngModel)]="inputValue" /> `,
})
class TargetComponent {
  public inputValue = 'Ada';
}

@NgModule({
  declarations: [TargetComponent],
  imports: [FormsModule],
})
class TargetModule {}

describe('MockFormBindings', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('reads a mocked ngModel input and updates its parent binding', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.find('[name="inputName"]');

    // Read the binding.
    expect(isMockOf(ngMocks.get(input, NgModel), NgModel)).toBe(true);
    expect(ngMocks.input(input, 'ngModel')).toBe('Ada');
    expect(component.inputValue).toBe('Ada');
    expect(input.nativeElement.value).toBe('');

    // Change the value through the mocked ngModelChange output.
    ngMocks.change(input, 'Grace');
    fixture.detectChanges();

    // Assert the result.
    expect(component.inputValue).toBe('Grace');
    expect(ngMocks.input(input, 'ngModel')).toBe('Grace');
  });

  it('passes later parent values to the mock without a native value binding', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input = ngMocks.find('[name="inputName"]');

    expect(ngMocks.input(input, 'ngModel')).toBe('Ada');
    expect(input.nativeElement.value).toBe('');

    component.inputValue = 'Grace';
    fixture.point.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();

    expect(ngMocks.input(input, 'ngModel')).toBe('Grace');
    expect(input.nativeElement.value).toBe('');
  });
});
