import {
  Component,
  isSignal,
  model,
  reflectComponentType,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  FormValueControl,
} from '@angular/forms/signals';

import {
  isMockOf,
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'own-model-15033',
  template: '{{ value() }}',
})
class ModelComponent implements FormValueControl<string> {
  public readonly value = model('');
}

@Component({
  selector: 'target-model-15033',
  imports: [FormField, ModelComponent],
  template: `
    <own-model-15033 [formField]="inputForm.inputValue" />
    <own-model-15033 [formField]="inputForm.siblingValue" />
  `,
})
class TargetComponent {
  public readonly inputModel = signal({
    inputValue: 'initial',
    siblingValue: 'unchanged',
  });
  public readonly inputForm = form(this.inputModel);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15033
// A mocked FormField does not connect the child's model output to its field tree.
describe('issue-15033:model', () => {
  // The root TypeScript-only runner does not transform authoring functions.
  // Angular-compiled spread targets exercise the model input and output.
  if (
    !reflectComponentType(ModelComponent)?.inputs.some(
      metadata => metadata.propName === 'value',
    )
  ) {
    it('needs compiled model metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('mocked FormField', () => {
    // Mock both declarations while retaining the services used by the real field tree.
    beforeEach(() =>
      MockBuilder(TargetComponent)
        .mock(FormField)
        .mock(ModelComponent)
        .keep(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('changes the supplied field without emitting the disconnected child output', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const field = component.inputForm.inputValue;
      const sibling = component.inputForm.siblingValue;
      const input = ngMocks.reveal(['formField', field]);
      const child = ngMocks.get(input, ModelComponent);
      const childValue = child.value;
      const initialChildValue = childValue();
      const values: string[] = [];
      ngMocks
        .output(input, 'valueChange')
        .subscribe(value => values.push(value));

      // Both declarations are mocked, but the parent's field tree remains real.
      expect(isMockOf(child, ModelComponent)).toBe(true);
      expect(isMockOf(ngMocks.get(input, FormField), FormField)).toBe(
        true,
      );
      expect(isSignal(childValue)).toBe(true);
      expect(ngMocks.input(input, 'formField')).toBe(field);
      expect(field().value()).toBe('initial');

      // Use the binding directly instead of emitting an unconnected valueChange.
      ngMocks.change(input, 'updated');
      fixture.detectChanges();

      expect(component.inputModel()).toEqual({
        inputValue: 'updated',
        siblingValue: 'unchanged',
      });
      expect(field().value()).toBe('updated');
      expect(field().dirty()).toBe(true);
      expect(field().touched()).toBe(false);
      expect(component.inputForm.inputValue).toBe(field);
      expect(component.inputForm.siblingValue).toBe(sibling);
      expect(ngMocks.input(input, 'formField')).toBe(field);
      expect(child.value).toBe(childValue);
      expect(childValue()).toBe(initialChildValue);
      expect(values).toEqual([]);
      expect(sibling().dirty()).toBe(false);
      expect(sibling().touched()).toBe(false);

      // Touch is separate and must not emit another child change.
      ngMocks.touch(input);

      expect(field().touched()).toBe(true);
      expect(field().value()).toBe('updated');
      expect(values).toEqual([]);
      expect(sibling().value()).toBe('unchanged');
      expect(sibling().dirty()).toBe(false);
      expect(sibling().touched()).toBe(false);
    });

    it('touches a pristine field without changing its model or child signal', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const field = component.inputForm.inputValue;
      const initialModel = component.inputModel();
      const input = ngMocks.reveal(['formField', field]);
      const child = ngMocks.get(input, ModelComponent);
      const childValue = child.value;
      const initialChildValue = childValue();
      const values: string[] = [];
      ngMocks
        .output(input, 'valueChange')
        .subscribe(value => values.push(value));

      // This child has no touch output; the mocked binding handles the interaction.
      ngMocks.touch(input);

      expect(field().touched()).toBe(true);
      expect(field().dirty()).toBe(false);
      expect(field().value()).toBe('initial');
      expect(component.inputModel()).toBe(initialModel);
      expect(component.inputForm.inputValue).toBe(field);
      expect(ngMocks.input(input, 'formField')).toBe(field);
      expect(child.value).toBe(childValue);
      expect(childValue()).toBe(initialChildValue);
      expect(values).toEqual([]);
      expect(component.inputForm.siblingValue().value()).toBe(
        'unchanged',
      );
      expect(component.inputForm.siblingValue().dirty()).toBe(false);
      expect(component.inputForm.siblingValue().touched()).toBe(
        false,
      );
    });
  });

  describe('real FormField', () => {
    // Keep Angular's connection so the mocked child's normal model output is used.
    beforeEach(() =>
      MockBuilder(TargetComponent)
        .keep(FormField)
        .mock(ModelComponent)
        .keep(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('preserves the connected model output and emits the edit once', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const field = component.inputForm.inputValue;
      const input = ngMocks.reveal(['formField', field]);
      const child = ngMocks.get(input, ModelComponent);
      const childValue = child.value;
      const values: string[] = [];
      ngMocks
        .output(input, 'valueChange')
        .subscribe(value => values.push(value));

      expect(isMockOf(child, ModelComponent)).toBe(true);
      expect(isMockOf(ngMocks.get(input, FormField), FormField)).toBe(
        false,
      );
      expect(childValue()).toBe('initial');

      // Real FormField connects the output and updates the child's input afterwards.
      ngMocks.change(input, 'updated');
      fixture.detectChanges();

      expect(component.inputModel()).toEqual({
        inputValue: 'updated',
        siblingValue: 'unchanged',
      });
      expect(field().value()).toBe('updated');
      expect(field().dirty()).toBe(true);
      expect(field().touched()).toBe(false);
      expect(component.inputForm.inputValue).toBe(field);
      expect(ngMocks.input(input, 'formField')).toBe(field);
      expect(child.value).toBe(childValue);
      expect(childValue()).toBe('updated');
      expect(values).toEqual(['updated']);
      expect(component.inputForm.siblingValue().dirty()).toBe(false);
      expect(component.inputForm.siblingValue().touched()).toBe(
        false,
      );
    });
  });
});
