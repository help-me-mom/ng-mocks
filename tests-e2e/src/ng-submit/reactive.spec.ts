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
import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-submit-reactive',
  standalone: false,
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
      nonNullable: true,
      updateOn: 'submit',
    }),
  });
  public readonly submissions: Array<{
    value: string;
    event: Event;
  }> = [];

  public save(value: string, event: Event): void {
    this.submissions.push({ value, event });
  }
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/756
describe('ng-submit:reactive', () => {
  describe('real', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).keep(
        ReactiveFormsModule,
      ),
    );

    it('submits pending values and forwards the submit event', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      const form = ngMocks.findInstance(FormGroupDirective);

      expect(form.submitted).toBe(false);
      expect(component.form.value).toEqual({ name: 'initial' });
      expect(component.submissions).toEqual([]);

      ngMocks.change('input', 'updated');
      expect(component.form.value).toEqual({ name: 'initial' });
      expect(component.submissions).toEqual([]);

      // A native submit synchronizes updateOn: 'submit' controls
      // before Angular emits ngSubmit to the component.
      const event = ngMocks.event('submit');
      ngMocks.trigger('form', event);

      expect(form.submitted).toBe(true);
      expect(component.form.value).toEqual({ name: 'updated' });
      expect(component.submissions).toEqual([
        { value: 'updated', event },
      ]);
      expect(event.defaultPrevented).toBe(true);
    });

    it('submits through the native submit button', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      const form = ngMocks.findInstance(FormGroupDirective);

      ngMocks.change('input', 'updated');
      // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
      const button = ngMocks.find('button')
        .nativeElement as HTMLButtonElement;
      button.click();

      expect(form.submitted).toBe(true);
      expect(component.form.value).toEqual({ name: 'updated' });
      expect(component.submissions.length).toBe(1);
      expect(component.submissions[0].value).toBe('updated');
      expect(component.submissions[0].event.type).toBe('submit');
      expect(component.submissions[0].event.defaultPrevented).toBe(
        true,
      );
    });

    it('does not submit through a disabled button', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const form = ngMocks.findInstance(FormGroupDirective);
      component.disabled = true;
      fixture.point.injector.get(ChangeDetectorRef).markForCheck();
      fixture.detectChanges();

      ngMocks.change('input', 'updated');
      // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
      const button = ngMocks.find('button')
        .nativeElement as HTMLButtonElement;
      expect(button.disabled).toBe(true);
      button.click();

      expect(component.submissions).toEqual([]);
      expect(component.form.value).toEqual({ name: 'initial' });
      expect(form.submitted).toBe(false);
    });

    it('emits the output without submitting pending values', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      const form = ngMocks.findInstance(FormGroupDirective);
      ngMocks.change('input', 'updated');

      const event = ngMocks.event('submit');
      ngMocks.output('form', 'ngSubmit').emit(event);

      expect(component.submissions).toEqual([
        { value: 'initial', event },
      ]);
      expect(component.form.value).toEqual({ name: 'initial' });
      expect(form.submitted).toBe(false);
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('mock', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule));

    it('binds formGroup and ngSubmit', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(
        isMockOf(
          ngMocks.findInstance(FormGroupDirective),
          FormGroupDirective,
          'd',
        ),
      ).toBe(true);
      expect(ngMocks.input('form', 'formGroup')).toBe(component.form);
      expect(ngMocks.input('input', 'formControlName')).toBe('name');
      expect(component.submissions).toEqual([]);

      component.form.setValue({ name: 'updated' });
      const event = ngMocks.event('submit');
      ngMocks.output('form', 'ngSubmit').emit(event);

      expect(component.submissions).toEqual([
        { value: 'updated', event },
      ]);
    });
  });
});
