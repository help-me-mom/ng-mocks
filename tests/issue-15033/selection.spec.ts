import { Component, Directive, Input, signal } from '@angular/core';
import { NgControl } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';

import {
  isMockOf,
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

let factoryCalls = 0;

@Directive({
  selector: '[providedField15033]',
})
class ProvidedDirective {
  @Input() public formField = 'unrelated';
}

@Directive({
  selector: '[lazyFieldHint15033]',
  providers: [
    {
      provide: ProvidedDirective,
      useFactory: () => {
        factoryCalls += 1;

        return new ProvidedDirective();
      },
    },
  ],
})
class HintDirective {}

@Directive({
  selector: '[hostField15033]',
  hostDirectives: [
    {
      directive: FormField,
      inputs: ['formField: boundField'],
    },
  ],
})
class HostDirective {}

@Component({
  selector: 'target-host-field-15033',
  imports: [HostDirective, HintDirective],
  template: `
    <input
      name="inputName"
      value="native"
      hostField15033
      lazyFieldHint15033
      [boundField]="inputForm.inputValue"
    />
    <input
      name="siblingName"
      hostField15033
      [boundField]="inputForm.siblingValue"
    />
  `,
})
class HostComponent {
  public readonly inputModel = signal({
    inputValue: 'initial',
    siblingValue: 'unchanged',
  });
  public readonly inputForm = form(this.inputModel);
}

@Component({
  selector: 'target-ancestor-field-15033',
  imports: [FormField],
  template: `
    <div [formField]="inputForm.inputValue">
      <input
        name="inputName"
        value="native"
        (focus)="events.push('focus')"
        (blur)="events.push('blur')"
      />
    </div>
  `,
})
class AncestorComponent {
  public readonly inputModel = signal({ inputValue: 'initial' });
  public readonly inputForm = form(this.inputModel);
  public readonly events: string[] = [];
}

@Directive({
  selector: '[unrelatedField15033]',
  exportAs: 'unrelatedField',
})
class UnrelatedDirective {
  @Input() public formField?: unknown;
}

@Component({
  selector: 'target-unrelated-field-15033',
  imports: [UnrelatedDirective],
  template: `
    <input
      #input
      name="inputName"
      value="native"
      unrelatedField15033
      [formField]="inputForm.inputValue"
      (input)="inputValue = input.value"
      (focus)="events.push('focus')"
      (blur)="events.push('blur')"
    />
  `,
})
class UnrelatedComponent {
  public inputValue = 'native';
  public readonly inputModel = signal({ inputValue: 'initial' });
  public readonly inputForm = form(this.inputModel);
  public readonly events: string[] = [];
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15033
// Only the selected host's actual mocked FormField binding may receive field edits.
describe('issue-15033:selection', () => {
  describe('forwarded host input', () => {
    beforeEach(() => {
      factoryCalls = 0;

      return MockBuilder(HostComponent)
        .keep(HostDirective)
        .keep(HintDirective)
        .keep(ProvidedDirective)
        .mock(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS);
    });

    it('changes and touches the field exposed through the forwarded alias', () => {
      const fixture = MockRender(HostComponent);
      const component = fixture.point.componentInstance;
      const field = component.inputForm.inputValue;
      const input = ngMocks.find('[name="inputName"]');
      const directive = ngMocks.get(input, FormField);

      // The kept host forwards boundField to the mocked FormField's formField input.
      expect(
        isMockOf(ngMocks.get(input, HostDirective), HostDirective),
      ).toBe(false);
      expect(isMockOf(directive, FormField)).toBe(true);
      expect(directive.field()).toBe(field);
      expect(input.nativeElement.value).toBe('native');

      ngMocks.change(input, 'updated');
      fixture.detectChanges();

      expect(component.inputModel()).toEqual({
        inputValue: 'updated',
        siblingValue: 'unchanged',
      });
      expect(field().dirty()).toBe(true);
      expect(field().touched()).toBe(false);
      expect(directive.field()).toBe(field);
      expect(input.nativeElement.value).toBe('native');

      ngMocks.touch(input);

      expect(field().touched()).toBe(true);
      expect(field().value()).toBe('updated');
      expect(component.inputForm.siblingValue().value()).toBe(
        'unchanged',
      );
      expect(component.inputForm.siblingValue().dirty()).toBe(false);
      expect(component.inputForm.siblingValue().touched()).toBe(
        false,
      );
    });

    it('keeps a decorated DI-only provider lazy during binding discovery', () => {
      const fixture = MockRender(HostComponent);
      const component = fixture.point.componentInstance;
      const input = ngMocks.find('[name="inputName"]');

      expect(input.providerTokens).toContain(ProvidedDirective);
      expect(factoryCalls).toBe(0);

      // The provider has a formField input, but it is not an applied directive.
      ngMocks.change(input, 'updated');
      ngMocks.touch(input);

      expect(component.inputModel().inputValue).toBe('updated');
      expect(component.inputForm.inputValue().touched()).toBe(true);
      expect(factoryCalls).toBe(0);

      // Explicit injection still constructs the original provider exactly once.
      const dependency = input.injector.get(ProvidedDirective);
      expect(dependency.formField).toBe('unrelated');
      expect(factoryCalls).toBe(1);
      expect(input.injector.get(ProvidedDirective)).toBe(dependency);
      expect(factoryCalls).toBe(1);
    });
  });

  describe('ancestor binding', () => {
    beforeEach(() =>
      MockBuilder(AncestorComponent)
        .mock(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('keeps an unbound native descendant on its own event path', () => {
      const fixture = MockRender(AncestorComponent);
      const component = fixture.point.componentInstance;
      const initialModel = component.inputModel();
      const field = component.inputForm.inputValue;
      const parent = ngMocks.find('div');
      const input = ngMocks.find('[name="inputName"]');

      // Ancestor injection can resolve the field, but the input has no local binding.
      expect(
        isMockOf(ngMocks.get(parent, FormField), FormField),
      ).toBe(true);
      expect(input.providerTokens).not.toContain(FormField);
      expect(input.providerTokens).not.toContain(NgControl);
      expect(input.injector.get(NgControl)).toBe(
        parent.injector.get(NgControl),
      );

      ngMocks.change(input, 'updated');
      ngMocks.touch(input);

      expect(input.nativeElement.value).toBe('updated');
      expect(component.events).toEqual([
        'focus',
        'blur',
        'focus',
        'blur',
      ]);
      expect(component.inputModel()).toBe(initialModel);
      expect(field().value()).toBe('initial');
      expect(field().dirty()).toBe(false);
      expect(field().touched()).toBe(false);
      expect(ngMocks.get(parent, FormField).field()).toBe(field);
    });
  });

  describe('unrelated input', () => {
    beforeEach(() =>
      MockBuilder(UnrelatedComponent)
        .mock(UnrelatedDirective)
        .keep(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('does not write a field supplied to an unrelated mocked directive', () => {
      const fixture = MockRender(UnrelatedComponent);
      const component = fixture.point.componentInstance;
      const initialModel = component.inputModel();
      const field = component.inputForm.inputValue;
      const input = ngMocks.find('[name="inputName"]');
      const directive = ngMocks.get(input, UnrelatedDirective);

      expect(isMockOf(directive, UnrelatedDirective)).toBe(true);
      expect(directive.formField).toBe(field);
      expect(input.providerTokens).not.toContain(FormField);
      expect(input.providerTokens).not.toContain(NgControl);

      // An input named formField alone must not override the native event handler.
      ngMocks.change(input, 'updated');
      ngMocks.touch(input);

      expect(input.nativeElement.value).toBe('updated');
      expect(component.inputValue).toBe('updated');
      expect(component.events).toEqual([
        'focus',
        'blur',
        'focus',
        'blur',
      ]);
      expect(component.inputModel()).toBe(initialModel);
      expect(field().value()).toBe('initial');
      expect(field().dirty()).toBe(false);
      expect(field().touched()).toBe(false);
      expect(directive.formField).toBe(field);
    });
  });
});
