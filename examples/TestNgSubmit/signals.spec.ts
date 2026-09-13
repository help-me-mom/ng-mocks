import { Component, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { filter, firstValueFrom } from 'rxjs';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-ng-submit-signals',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="f">
      <input [formField]="f.inputValue" />
      <button type="submit">Save</button>
    </form>
  `,
})
class TargetComponent {
  public readonly model = signal({ inputValue: 'Ada' });
  public submitted: { inputValue: string } | undefined;
  public readonly f = form(this.model, {
    submission: {
      action: async field => {
        this.submitted = field().value();
      },
    },
  });
}

describe('TestNgSubmit:signals', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(FormField)
      .keep(FormRoot)
      .keep(NG_MOCKS_ROOT_PROVIDERS),
  );

  it('submits the edited signal model through FormRoot', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input and form.
    const input = ngMocks.reveal([
      'formField',
      component.f.inputValue,
    ]);
    const formElement = ngMocks.find('form');

    // Read the initial value.
    expect(component.f.inputValue().value()).toBe('Ada');
    expect(input.nativeNode.value).toBe('Ada');
    expect(component.submitted).toBeUndefined();
    expect(component.f().submitting()).toBe(false);

    // Change the input.
    ngMocks.change(input, 'Grace');
    fixture.detectChanges();

    // Assert the value before submission.
    expect(component.f.inputValue().value()).toBe('Grace');
    expect(component.model()).toEqual({ inputValue: 'Grace' });
    expect(input.nativeNode.value).toBe('Grace');
    expect(component.submitted).toBeUndefined();

    // Submit the form.
    const event = ngMocks.event('submit');
    ngMocks.trigger(formElement, event);
    expect(component.f().submitting()).toBe(true);

    // Wait for the submission action to finish.
    await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        toObservable(component.f().submitting),
      ).pipe(filter(submitting => !submitting)),
    );

    // Assert the submitted value.
    expect(component.submitted).toEqual({ inputValue: 'Grace' });
    expect(component.f().submitting()).toBe(false);
    expect(event.defaultPrevented).toBe(true);
  });
});
