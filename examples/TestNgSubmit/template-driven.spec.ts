import {
  ChangeDetectorRef,
  Component,
  NgModule,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-submit-template-driven',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <form (ngSubmit)="save(value, $event)">
      <input
        name="name"
        [(ngModel)]="value"
        [ngModelOptions]="{ updateOn: 'submit' }"
      />
      <button type="submit" [disabled]="disabled">Save</button>
    </form>
  `,
})
class TargetComponent {
  public disabled = false;
  public value = 'initial';

  // The test replaces this application callback with a spy.
  public save: (value: string, event: Event) => void = () =>
    undefined;
}

@NgModule({
  declarations: [TargetComponent],
  imports: [FormsModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/756
describe('TestNgSubmit:template-driven', () => {
  // Keep Angular's form bindings real so native submit commits pending edits.
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(FormsModule),
  );

  it('calls save with the submitted value and event', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);

    // Wait for ngModel to register the input with the form.
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Replace the application handler to check its submitted arguments.
    const save =
      typeof jest === 'undefined'
        ? jasmine.createSpy('save')
        : jest.fn();
    component.save = save;

    // Find the form to read its value and submitted state.
    const form = ngMocks.findInstance(NgForm);

    // Read the initial value.
    expect(form.submitted).toBe(false);
    expect(form.value).toEqual({ name: 'initial' });

    // Change the input. Its value stays pending until submission.
    ngMocks.change('input', 'updated');

    // Assert the pending value.
    expect(component.value).toBe('initial');
    expect(form.value).toEqual({ name: 'initial' });
    expect(save).not.toHaveBeenCalled();

    // Dispatch native submit so Angular commits the edit and emits ngSubmit.
    const event = ngMocks.event('submit');
    ngMocks.trigger('form', event);

    // Assert the result.
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('updated', event);
    expect(component.value).toBe('updated');
    expect(form.value).toEqual({ name: 'updated' });
    expect(form.submitted).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it('calls save through the native submit button', async () => {
    const fixture = MockRender(TargetComponent);

    // Wait for ngModel to register the input with the form.
    await fixture.whenStable();
    const component = fixture.point.componentInstance;
    const form = ngMocks.findInstance(NgForm);

    // Replace the application handler to check its submitted arguments.
    const save =
      typeof jest === 'undefined'
        ? jasmine.createSpy('save')
        : jest.fn();
    component.save = save;

    ngMocks.change('input', 'updated');
    expect(save).not.toHaveBeenCalled();
    // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
    const button = ngMocks.find('button')
      .nativeElement as HTMLButtonElement;

    // A native click submits the form and commits the pending edit.
    button.click();

    const assertion: any =
      typeof jest === 'undefined' ? jasmine : expect;
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(
      'updated',
      assertion.objectContaining({
        type: 'submit',
        defaultPrevented: true,
      }),
    );
    expect(form.value).toEqual({ name: 'updated' });
    expect(form.submitted).toBe(true);
  });

  it('does not call save through a disabled button', async () => {
    const fixture = MockRender(TargetComponent);

    // Wait for ngModel to register the input with the form.
    await fixture.whenStable();
    const component = fixture.point.componentInstance;
    const form = ngMocks.findInstance(NgForm);

    // Replace the application handler to detect an unexpected submission.
    const save =
      typeof jest === 'undefined'
        ? jasmine.createSpy('save')
        : jest.fn();
    component.save = save;

    // Check the view so the native button receives its disabled state.
    component.disabled = true;
    fixture.point.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();

    ngMocks.change('input', 'updated');
    // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
    const button = ngMocks.find('button')
      .nativeElement as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    button.click();

    expect(save).not.toHaveBeenCalled();
    expect(component.value).toBe('initial');
    expect(form.value).toEqual({ name: 'initial' });
    expect(form.submitted).toBe(false);
  });
});
