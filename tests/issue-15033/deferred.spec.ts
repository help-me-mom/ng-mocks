import { Component, signal } from '@angular/core';
import { debounce, form, FormField } from '@angular/forms/signals';

import {
  isMockOf,
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-15033-deferred',
  standalone: true,
  imports: [FormField],
  template: `
    <input
      name="inputName"
      value="native text"
      [formField]="inputForm.inputValue"
      (input)="events.push('input')"
      (blur)="events.push('blur')"
    />
    <input name="siblingName" [formField]="inputForm.siblingValue" />
  `,
})
class TargetComponent {
  public readonly inputModel = signal({
    inputValue: 'initial',
    siblingValue: 'sibling',
  });
  public readonly inputForm = form(this.inputModel, schema => {
    // Angular owns the pending edit and commits it when the field is touched.
    debounce(schema.inputValue, 'blur');
  });
  public readonly events: string[] = [];
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15033
// The mocked binding must preserve the real field's debounce policy.
describe('issue-15033:deferred', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .mock(FormField)
      .keep(NG_MOCKS_ROOT_PROVIDERS),
  );

  it('keeps an edit pending until one explicit touch flushes the real field', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input = ngMocks.find('[name="inputName"]');
    const tree = component.inputForm.inputValue;
    const state = tree();
    const writes: string[] = [];
    const set = state.controlValue.set;
    const markAsTouched = state.markAsTouched.bind(state);
    let touches = 0;
    state.controlValue.set = value => {
      writes.push(value);
      set(value);
    };
    state.markAsTouched = () => {
      touches += 1;
      markAsTouched();
    };

    expect(isMockOf(ngMocks.get(input, FormField), FormField)).toBe(
      true,
    );
    expect(ngMocks.input(input, 'formField')).toBe(tree);
    expect(state.controlValue()).toBe('initial');
    expect(state.dirty()).toBe(false);
    expect(state.touched()).toBe(false);

    // Changing the binding edits controlValue but does not bypass debounce('blur').
    ngMocks.change('[name="inputName"]', 'updated');

    expect(writes).toEqual(['updated']);
    expect(state.controlValue()).toBe('updated');
    expect(state.value()).toBe('initial');
    expect(component.inputModel().inputValue).toBe('initial');
    expect(state.dirty()).toBe(true);
    expect(state.touched()).toBe(false);
    expect(touches).toBe(0);
    expect(component.events).toEqual([]);
    expect(input.nativeNode.value).toBe('native text');

    // The field's touch operation flushes its own pending edit immediately.
    ngMocks.touch(input);

    expect(touches).toBe(1);
    expect(writes).toEqual(['updated']);
    expect(component.inputModel()).toEqual({
      inputValue: 'updated',
      siblingValue: 'sibling',
    });
    expect(state.value()).toBe('updated');
    expect(state.controlValue()).toBe('updated');
    expect(state.dirty()).toBe(true);
    expect(state.touched()).toBe(true);
    expect(ngMocks.input(input, 'formField')).toBe(tree);
    expect(component.inputForm.siblingValue().dirty()).toBe(false);
    expect(component.inputForm.siblingValue().touched()).toBe(false);
    expect(component.events).toEqual([]);
    expect(input.nativeNode.value).toBe('native text');
  });

  it('touches a pristine debounced field without introducing an edit', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input = ngMocks.find('[name="inputName"]');
    const tree = component.inputForm.inputValue;
    const writes: string[] = [];
    const set = tree().controlValue.set;
    tree().controlValue.set = value => {
      writes.push(value);
      set(value);
    };

    ngMocks.touch('[name="inputName"]');

    expect(writes).toEqual([]);
    expect(component.inputModel()).toEqual({
      inputValue: 'initial',
      siblingValue: 'sibling',
    });
    expect(tree().value()).toBe('initial');
    expect(tree().controlValue()).toBe('initial');
    expect(tree().dirty()).toBe(false);
    expect(tree().touched()).toBe(true);
    expect(ngMocks.input(input, 'formField')).toBe(tree);
    expect(component.inputForm.siblingValue().dirty()).toBe(false);
    expect(component.inputForm.siblingValue().touched()).toBe(false);
    expect(component.events).toEqual([]);
    expect(input.nativeNode.value).toBe('native text');
  });

  it('flushes another pending edit when an already touched field is touched again', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const tree = component.inputForm.inputValue;
    const markAsTouched = tree().markAsTouched.bind(tree());
    let touches = 0;
    tree().markAsTouched = () => {
      touches += 1;
      markAsTouched();
    };

    ngMocks.change('[name="inputName"]', 'first edit');
    ngMocks.touch('[name="inputName"]');
    expect(component.inputModel().inputValue).toBe('first edit');
    expect(tree().touched()).toBe(true);
    expect(touches).toBe(1);

    // Being touched already does not make later edits bypass the debounce policy.
    ngMocks.change('[name="inputName"]', 'second edit');

    expect(tree().controlValue()).toBe('second edit');
    expect(tree().value()).toBe('first edit');
    expect(component.inputModel().inputValue).toBe('first edit');
    expect(tree().dirty()).toBe(true);
    expect(touches).toBe(1);

    ngMocks.touch('[name="inputName"]');

    expect(touches).toBe(2);
    expect(component.inputModel()).toEqual({
      inputValue: 'second edit',
      siblingValue: 'sibling',
    });
    expect(tree().value()).toBe('second edit');
    expect(tree().controlValue()).toBe('second edit');
    expect(tree().touched()).toBe(true);
    expect(component.inputForm.siblingValue().dirty()).toBe(false);
    expect(component.inputForm.siblingValue().touched()).toBe(false);
    expect(component.events).toEqual([]);
    expect(ngMocks.find('[name="inputName"]').nativeNode.value).toBe(
      'native text',
    );
  });
});
