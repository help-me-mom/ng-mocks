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
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(FormsModule),
  );

  it('calls save with the submitted value and event', async () => {
    // Rendering the component and waiting for ngModel.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;
    const form = ngMocks.findInstance(NgForm);

    // Replacing the application handler with a spy.
    const save =
      typeof jest === 'undefined'
        ? jasmine.createSpy('save')
        : jest.fn();
    component.save = save;

    expect(form.submitted).toBe(false);
    expect(form.value).toEqual({ name: 'initial' });

    // The value stays pending until the form is submitted.
    ngMocks.change('input', 'updated');
    expect(component.value).toBe('initial');
    expect(form.value).toEqual({ name: 'initial' });
    expect(save).not.toHaveBeenCalled();

    // Angular handles submit and emits ngSubmit to call save.
    const event = ngMocks.event('submit');
    ngMocks.trigger('form', event);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('updated', event);
    expect(component.value).toBe('updated');
    expect(form.value).toEqual({ name: 'updated' });
    expect(form.submitted).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it('calls save through the native submit button', async () => {
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;
    const form = ngMocks.findInstance(NgForm);
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
    expect(form.value).toEqual({ name: 'updated' });
    expect(form.submitted).toBe(true);
  });

  it('does not call save through a disabled button', async () => {
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;
    const form = ngMocks.findInstance(NgForm);
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
    expect(component.value).toBe('initial');
    expect(form.value).toEqual({ name: 'initial' });
    expect(form.submitted).toBe(false);
  });
});
