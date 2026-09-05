import {
  ChangeDetectorRef,
  Component,
  NgModule,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

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
  imports: [FormsModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/756
describe('TestNgSubmit:template-driven', () => {
  describe('real', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).keep(FormsModule),
    );

    it('submits pending values and forwards the submit event', async () => {
      const fixture = MockRender(TargetComponent);
      await fixture.whenStable();
      const component = fixture.point.componentInstance;
      const form = ngMocks.findInstance(NgForm);

      expect(form.submitted).toBe(false);
      expect(form.value).toEqual({ name: 'initial' });
      expect(component.submissions).toEqual([]);

      ngMocks.change('input', 'updated');
      expect(component.value).toBe('initial');
      expect(form.value).toEqual({ name: 'initial' });
      expect(component.submissions).toEqual([]);

      // A native submit synchronizes updateOn: 'submit' controls
      // before Angular emits ngSubmit to the component.
      const event = ngMocks.event('submit');
      ngMocks.trigger('form', event);

      expect(form.submitted).toBe(true);
      expect(form.value).toEqual({ name: 'updated' });
      expect(component.value).toBe('updated');
      expect(component.submissions).toEqual([
        { value: 'updated', event },
      ]);
      expect(event.defaultPrevented).toBe(true);
    });

    it('submits through the native submit button', async () => {
      const fixture = MockRender(TargetComponent);
      await fixture.whenStable();
      const component = fixture.point.componentInstance;
      const form = ngMocks.findInstance(NgForm);

      ngMocks.change('input', 'updated');
      // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
      const button = ngMocks.find('button')
        .nativeElement as HTMLButtonElement;
      button.click();

      expect(form.submitted).toBe(true);
      expect(form.value).toEqual({ name: 'updated' });
      expect(component.submissions.length).toBe(1);
      expect(component.submissions[0].value).toBe('updated');
      expect(component.submissions[0].event.type).toBe('submit');
      expect(component.submissions[0].event.defaultPrevented).toBe(
        true,
      );
    });

    it('does not submit through a disabled button', async () => {
      const fixture = MockRender(TargetComponent);
      await fixture.whenStable();
      const component = fixture.point.componentInstance;
      const form = ngMocks.findInstance(NgForm);
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
      expect(component.value).toBe('initial');
      expect(form.value).toEqual({ name: 'initial' });
      expect(form.submitted).toBe(false);
    });

    it('emits the output without submitting pending values', async () => {
      const fixture = MockRender(TargetComponent);
      await fixture.whenStable();
      const component = fixture.point.componentInstance;
      const form = ngMocks.findInstance(NgForm);
      ngMocks.change('input', 'updated');

      const event = ngMocks.event('submit');
      ngMocks.output('form', 'ngSubmit').emit(event);

      expect(component.submissions).toEqual([
        { value: 'initial', event },
      ]);
      expect(component.value).toBe('initial');
      expect(form.value).toEqual({ name: 'initial' });
      expect(form.submitted).toBe(false);
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('mock', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule));

    it('binds ngModel and ngSubmit', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(
        isMockOf(ngMocks.findInstance(NgForm), NgForm, 'd'),
      ).toBe(true);
      expect(ngMocks.input('input', 'ngModel')).toBe('initial');
      expect(component.submissions).toEqual([]);

      ngMocks.output('input', 'ngModelChange').emit('updated');
      const event = ngMocks.event('submit');
      ngMocks.output('form', 'ngSubmit').emit(event);

      expect(component.value).toBe('updated');
      expect(component.submissions).toEqual([
        { value: 'updated', event },
      ]);
    });
  });
});
