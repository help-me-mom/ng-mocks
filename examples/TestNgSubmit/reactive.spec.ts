import {
  ChangeDetectorRef,
  Component,
  NgModule,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-submit-reactive',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="save(form.controls.name.value, $event)"
    >
      <input formControlName="name" />
      <button type="submit" [disabled]="disabled">Save</button>
    </form>
  `,
})
class TargetComponent {
  public disabled = false;
  public readonly form = new FormGroup({
    name: new FormControl('initial', {
      updateOn: 'submit',
    }),
  });

  // The test replaces this application callback with a spy.
  public save: (value: string | null, event: Event) => void = () =>
    undefined;
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/756
describe('TestNgSubmit:reactive', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(
      ReactiveFormsModule,
    ),
  );

  it('calls save with the submitted value and event', () => {
    // Rendering the component and finding its form directive.
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const form = ngMocks.findInstance(FormGroupDirective);

    // Replacing the application handler with a spy.
    const save =
      typeof jest === 'undefined'
        ? jasmine.createSpy('save')
        : jest.fn();
    component.save = save;

    expect(form.submitted).toBe(false);
    expect(component.form.value).toEqual({ name: 'initial' });

    // The value stays pending until the form is submitted.
    ngMocks.change('input', 'updated');
    expect(component.form.value).toEqual({ name: 'initial' });
    expect(save).not.toHaveBeenCalled();

    // Angular handles submit and emits ngSubmit to call save.
    const event = ngMocks.event('submit');
    ngMocks.trigger('form', event);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('updated', event);
    expect(component.form.value).toEqual({ name: 'updated' });
    expect(form.submitted).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it('calls save through the native submit button', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const form = ngMocks.findInstance(FormGroupDirective);
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
    expect(component.form.value).toEqual({ name: 'updated' });
    expect(form.submitted).toBe(true);
  });

  it('does not call save through a disabled button', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const form = ngMocks.findInstance(FormGroupDirective);
    const save =
      typeof jest === 'undefined'
        ? jasmine.createSpy('save')
        : jest.fn();
    component.save = save;
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
    expect(component.form.value).toEqual({ name: 'initial' });
    expect(form.submitted).toBe(false);
  });
});
