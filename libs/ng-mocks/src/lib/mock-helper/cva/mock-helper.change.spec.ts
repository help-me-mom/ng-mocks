import { Directive, InjectionToken, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  DefaultValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';

import { MockControlValueAccessor } from '../../common/mock-control-value-accessor';
import { MockControlValueAccessorProxy } from '../../common/mock-control-value-accessor-proxy';
import { MockBuilder } from '../../mock-builder/mock-builder';
import { MockDirective } from '../../mock-directive/mock-directive';
import { MockInstance } from '../../mock-instance/mock-instance';
import { MockRender } from '../../mock-render/mock-render';
import { ngMocks } from '../mock-helper';

describe('mock-helper.change', () => {
  describe('disconnected native mock accessors', () => {
    MockInstance.scope();

    it('changes and touches only the DOM for a mocked named control without invoking unregistered callbacks', async () => {
      await MockBuilder().mock(ReactiveFormsModule);
      const simulateChange = jasmine.createSpy('unregistered change');
      const simulateTouch = jasmine.createSpy('unregistered touch');
      MockInstance(DefaultValueAccessor, instance => {
        (
          instance as DefaultValueAccessor & MockControlValueAccessor
        ).__simulateChange = simulateChange;
        (
          instance as DefaultValueAccessor & MockControlValueAccessor
        ).__simulateTouch = simulateTouch;
      });
      const form = new FormGroup({
        inputValue: new FormControl('initial'),
      });
      const fixture = MockRender(
        '<form [formGroup]="form"><input formControlName="inputValue" /></form>',
        { form },
      );
      const input = ngMocks.find('input');
      const child = ngMocks.get(input, DefaultValueAccessor);
      const accessor = input.injector.get(
        NG_VALUE_ACCESSOR,
      )[0] as MockControlValueAccessorProxy;
      const values: object[] = [];
      const subscription = form.valueChanges.subscribe(value =>
        values.push(value),
      );
      const events: string[] = [];
      for (const event of ['focus', 'input', 'change', 'blur']) {
        input.nativeElement.addEventListener(event, () =>
          events.push(event),
        );
      }

      expect(accessor.instance).toBe(child);
      expect(
        (child as DefaultValueAccessor & MockControlValueAccessor)
          .__simulateChange,
      ).toBe(simulateChange);
      expect(
        (child as DefaultValueAccessor & MockControlValueAccessor)
          .__simulateTouch,
      ).toBe(simulateTouch);
      expect(input.nativeElement.value).toBe('');

      // A mocked name does not resolve its parent's group; preserve the native edit only.
      ngMocks.change(input, 'updated');
      fixture.detectChanges();
      expect(events).toEqual(['focus', 'input', 'change', 'blur']);

      // Touch still emits native events without fabricating a forms connection.
      ngMocks.touch(input);
      subscription.unsubscribe();

      expect(input.nativeElement.value).toBe('updated');
      expect(form.value).toEqual({ inputValue: 'initial' });
      expect(ngMocks.input(input, 'formControlName')).toBe(
        'inputValue',
      );
      expect(form.pristine).toBe(true);
      expect(form.untouched).toBe(true);
      expect(values).toEqual([]);
      expect(simulateChange).not.toHaveBeenCalled();
      expect(simulateTouch).not.toHaveBeenCalled();
      expect(events).toEqual([
        'focus',
        'input',
        'change',
        'blur',
        'focus',
        'blur',
      ]);
    });

    it('rejects a bound native input when its proxy has no attached mock accessor', () => {
      const accessor = new MockControlValueAccessorProxy();
      @Directive({
        selector: '[formBinding]',
        standalone: false,
        providers: [
          {
            provide: NgControl,
            useValue: { valueAccessor: accessor },
          },
        ],
      })
      class FormBindingDirective {
        @Input() public formControlName = '';
      }

      TestBed.configureTestingModule({
        declarations: [FormBindingDirective],
      });
      MockRender(
        '<input formBinding formControlName="inputName" value="initial" />',
      );
      const input = ngMocks.find('input');
      const nativeEvent = jasmine.createSpy('native event');
      for (const event of ['focus', 'input', 'change', 'blur']) {
        input.nativeElement.addEventListener(event, nativeEvent);
      }

      // An unattached proxy must not make an unsupported forms binding look editable.
      let message = '';
      let touchMessage = '';
      try {
        ngMocks.change(input, 'unsupported');
      } catch (error) {
        message = (error as Error).message;
      }
      try {
        ngMocks.touch(input);
      } catch (error) {
        touchMessage = (error as Error).message;
      }

      expect(message).toContain('ControlValueAccessor');
      expect(touchMessage).toContain('ControlValueAccessor');
      expect(accessor.instance).toBeUndefined();
      expect(input.nativeElement.value).toBe('initial');
      expect(ngMocks.input(input, 'formControlName')).toBe(
        'inputName',
      );
      expect(nativeEvent).not.toHaveBeenCalled();
    });
  });

  it('writes before calling the registered CVA callback exactly once', () => {
    const calls: string[] = [];
    const accessor = {
      writeValue: (value: string): void => {
        calls.push(`write:${value}`);
      },
      _controlValueAccessorChangeFn: (value: string): void => {
        calls.push(`change:${value}`);
      },
    };

    @Directive({
      selector: '[customControl]',
      standalone: false,
      providers: [
        { provide: NgControl, useValue: { valueAccessor: accessor } },
      ],
    })
    class ControlDirective {}

    TestBed.configureTestingModule({
      declarations: [ControlDirective],
    });
    MockRender('<div customControl></div>');

    // This custom host has no native event handler to update the control.
    ngMocks.change('[customControl]', 'updated');

    expect(calls).toEqual(['write:updated', 'change:updated']);
  });

  it('preserves existing callback precedence when the new name also exists', () => {
    const accessor = {
      writeValue: jasmine.createSpy('writeValue'),
      onChange: jasmine.createSpy('onChange'),
      _controlValueAccessorChangeFn: jasmine.createSpy(
        'registeredChange',
      ),
    };

    @Directive({
      selector: '[customControl]',
      standalone: false,
      providers: [
        { provide: NgControl, useValue: { valueAccessor: accessor } },
      ],
    })
    class ControlDirective {}

    TestBed.configureTestingModule({
      declarations: [ControlDirective],
    });
    MockRender('<div customControl></div>');

    ngMocks.change('[customControl]', 'updated');

    expect(accessor.writeValue).toHaveBeenCalledOnceWith('updated');
    expect(accessor.onChange).toHaveBeenCalledOnceWith('updated');
    expect(
      accessor._controlValueAccessorChangeFn,
    ).not.toHaveBeenCalled();
  });

  it('respects explicit callback names without falling back on an invalid name', () => {
    const accessor = {
      writeValue: jasmine.createSpy('writeValue'),
      customChange: jasmine.createSpy('customChange'),
      _controlValueAccessorChangeFn: jasmine.createSpy(
        'registeredChange',
      ),
    };

    @Directive({
      selector: '[customControl]',
      standalone: false,
      providers: [
        { provide: NgControl, useValue: { valueAccessor: accessor } },
      ],
    })
    class ControlDirective {}

    TestBed.configureTestingModule({
      declarations: [ControlDirective],
    });
    MockRender('<div customControl></div>');

    ngMocks.change('[customControl]', 'updated', 'customChange');
    expect(() =>
      ngMocks.change('[customControl]', 'ignored', 'missingChange'),
    ).toThrowError(/please ensure it has 'missingChange' method/);

    expect(accessor.writeValue).toHaveBeenCalledOnceWith('updated');
    expect(accessor.customChange).toHaveBeenCalledOnceWith('updated');
    expect(
      accessor._controlValueAccessorChangeFn,
    ).not.toHaveBeenCalled();
  });

  it('preserves native event dispatch when the accessor has the new callback name', () => {
    const accessor = {
      writeValue: jasmine.createSpy('writeValue'),
      _controlValueAccessorChangeFn: jasmine.createSpy(
        'registeredChange',
      ),
    };

    @Directive({
      selector: '[customControl]',
      standalone: false,
      providers: [
        { provide: NgControl, useValue: { valueAccessor: accessor } },
      ],
    })
    class ControlDirective {}

    TestBed.configureTestingModule({
      declarations: [ControlDirective],
    });
    MockRender(
      '<input customControl (input)="change($event.target.value)" />',
      {
        change: accessor._controlValueAccessorChangeFn,
      },
    );

    // The input event already notifies the CVA; do not call it a second time.
    ngMocks.change('[customControl]', 'updated');

    expect(ngMocks.find('input').nativeElement.value).toBe('updated');
    expect(
      accessor._controlValueAccessorChangeFn,
    ).toHaveBeenCalledOnceWith('updated');
    expect(accessor.writeValue).not.toHaveBeenCalled();
  });

  it('rejects a template node without rendering or changing its content', () => {
    @Directive({ selector: '[nativeTemplate]', standalone: false })
    class TemplateDirective {}

    TestBed.configureTestingModule({
      declarations: [TemplateDirective],
    });
    MockRender(
      '<ng-template nativeTemplate><input value="initial" /></ng-template>',
    );
    const template = ngMocks.reveal(TemplateDirective);

    expect(template.nativeNode.nodeType).toBe(Node.COMMENT_NODE);
    expect(ngMocks.find('input', undefined)).toBeUndefined();

    expect(() => ngMocks.change(template, 'updated')).toThrowError(
      'Expecting instance of DOM Element',
    );

    expect(ngMocks.find('input', undefined)).toBeUndefined();
  });

  it('changes a native input with a directive that declares no inputs', () => {
    @Directive({ selector: '[nativeMarker]', standalone: false })
    class MarkerDirective {}

    TestBed.configureTestingModule({
      declarations: [MarkerDirective],
    });
    MockRender('<input nativeMarker value="initial" />');
    const input = ngMocks.find('input');
    const marker = ngMocks.get(input, MarkerDirective);

    ngMocks.change(input, 'updated');

    expect(input.nativeElement.value).toBe('updated');
    expect(ngMocks.get(input, MarkerDirective)).toBe(marker);
  });

  it('does not treat a provided directive stub as a bound form input', () => {
    @Directive({ selector: '[providedControl]', standalone: false })
    class ProvidedControlDirective {
      @Input() public formField = '';
    }

    // This token is a dependency override, not a directive on the input.
    const dependency = {};
    @Directive({
      selector: '[nativeProvider]',
      standalone: false,
      providers: [
        { provide: ProvidedControlDirective, useValue: dependency },
      ],
    })
    class ProviderDirective {}

    TestBed.configureTestingModule({
      declarations: [ProviderDirective],
    });
    MockRender('<input nativeProvider value="initial" />');
    const input = ngMocks.find('input');

    expect<object>(input.injector.get(ProvidedControlDirective)).toBe(
      dependency,
    );

    ngMocks.change(input, 'updated');

    expect(input.nativeElement.value).toBe('updated');
    expect<object>(input.injector.get(ProvidedControlDirective)).toBe(
      dependency,
    );
  });

  it('changes an unbound native input without instantiating its unrelated providers', () => {
    const lazy = new InjectionToken<object>('unused-native-provider');
    const value = {};
    const create = jasmine.createSpy('create').and.returnValue(value);

    @Directive({
      selector: '[nativeHint]',
      standalone: false,
      providers: [{ provide: lazy, useFactory: create }],
    })
    class HintDirective {
      @Input('nativeHint') public hint = '';
    }

    TestBed.configureTestingModule({ declarations: [HintDirective] });
    MockRender('<input nativeHint="Name" value="initial" />');
    const input = ngMocks.find('input');

    expect(create).not.toHaveBeenCalled();
    expect(input.nativeElement.value).toBe('initial');

    ngMocks.change(input, 'updated');

    expect(input.nativeElement.value).toBe('updated');
    expect(ngMocks.get(input, HintDirective).hint).toBe('Name');
    expect(create).not.toHaveBeenCalled();

    // The provider remains available and lazy until it is explicitly requested.
    expect(input.injector.get(lazy)).toBe(value);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('keeps an unrelated decorated provider lazy without treating it as a form binding', () => {
    @Directive({ selector: '[providedControl]', standalone: false })
    class ProvidedControlDirective {
      @Input() public formField = 'unrelated';
    }

    const create = jasmine
      .createSpy('create')
      .and.callFake(() => new ProvidedControlDirective());

    @Directive({
      selector: '[nativeHint]',
      standalone: false,
      providers: [
        { provide: ProvidedControlDirective, useFactory: create },
      ],
    })
    class HintDirective {}

    TestBed.configureTestingModule({ declarations: [HintDirective] });
    MockRender('<input nativeHint value="initial" />');
    const input = ngMocks.find('input');

    expect(create).not.toHaveBeenCalled();
    expect(input.nativeElement.value).toBe('initial');

    // A decorated DI token is not necessarily a directive applied to this host.
    expect(() => ngMocks.change(input, 'updated')).not.toThrow();

    expect(input.nativeElement.value).toBe('updated');
    expect(create).not.toHaveBeenCalled();

    expect(
      input.injector.get(ProvidedControlDirective).formField,
    ).toBe('unrelated');
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('changes a native input listener without instantiating its unrelated directive provider', () => {
    @Directive({
      selector: '[unusedListenerProvider]',
      standalone: false,
    })
    class UnusedDirective {}

    const dependency = {};
    const create = jasmine
      .createSpy('create')
      .and.returnValue(dependency);

    @Directive({
      selector: '[nativeHint]',
      standalone: false,
      providers: [{ provide: UnusedDirective, useFactory: create }],
    })
    class HintDirective {}

    TestBed.configureTestingModule({ declarations: [HintDirective] });
    const params = { value: 'initial' };
    MockRender(
      '<input nativeHint value="initial" (input)="value = $event.target.value" />',
      params,
    );
    const input = ngMocks.find('input');

    expect(create).not.toHaveBeenCalled();
    expect(input.nativeElement.value).toBe('initial');

    ngMocks.change(input, 'updated');

    expect(input.nativeElement.value).toBe('updated');
    expect(params.value).toBe('updated');
    expect(create).not.toHaveBeenCalled();

    expect(input.injector.get(UnusedDirective)).toBe(dependency);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('preserves a mocked form binding declared without an input alias', () => {
    @Directive({ selector: '[plainBinding]', standalone: false })
    class FormBindingDirective {
      @Input() public formControl = '';
    }

    TestBed.configureTestingModule({
      declarations: [MockDirective(FormBindingDirective)],
    });
    const params = { value: 'initial' };
    MockRender(
      '<input plainBinding [formControl]="value" />',
      params,
    );
    const input = ngMocks.find('input');

    expect(ngMocks.input(input, 'formControl')).toBe('initial');

    expect(() => ngMocks.change(input, 'updated')).toThrowError(
      /Cannot find ControlValueAccessor on the element/,
    );

    expect(params.value).toBe('initial');
    expect(ngMocks.input(input, 'formControl')).toBe('initial');
    expect(input.nativeElement.value).toBe('');
  });

  for (const binding of [
    { name: 'field' },
    { name: 'a', nonMinifiedName: 'field' },
    { name: 'formControl' },
  ]) {
    it(`preserves a View Engine form binding through ${binding.name}${binding.nonMinifiedName ? ' with nonMinifiedName' : ''}`, () => {
      @Directive({ selector: '[legacyBinding]', standalone: false })
      class FormBindingDirective {
        @Input('formField') public field = '';
        @Input() public formControl = '';
      }

      TestBed.configureTestingModule({
        declarations: [MockDirective(FormBindingDirective)],
      });
      const params = { value: 'initial' };
      MockRender(
        '<input legacyBinding [formField]="value" [formControl]="value" />',
        params,
      );
      const input = ngMocks.find('input');
      const injector = input.injector;
      const elDef: any = { element: { publicProviders: {} } };
      elDef.element.publicProviders.binding = {
        parent: elDef,
        bindings: [binding],
        provider: { value: FormBindingDirective },
      };
      Object.defineProperty(input, 'injector', {
        configurable: true,
        value: { elDef, get: injector.get.bind(injector) },
      });
      const events: string[] = [];
      for (const event of ['focus', 'input', 'change', 'blur']) {
        input.nativeElement.addEventListener(event, () =>
          events.push(event),
        );
      }

      expect(() => ngMocks.change(input, 'updated')).toThrowError(
        /Cannot find ControlValueAccessor on the element/,
      );

      expect(params.value).toBe('initial');
      expect(ngMocks.input(input, 'formField')).toBe('initial');
      expect(ngMocks.input(input, 'formControl')).toBe('initial');
      expect(input.nativeElement.value).toBe('');
      expect(events).toEqual([]);
    });
  }

  it('ignores unbound and ancestor View Engine form inputs without constructing local providers', () => {
    @Directive({ selector: '[providedControl]', standalone: false })
    class ProvidedControlDirective {
      @Input() public formField = 'unrelated';
    }

    const create = jasmine
      .createSpy('create')
      .and.callFake(() => new ProvidedControlDirective());

    @Directive({
      selector: '[nativeHint]',
      standalone: false,
      providers: [
        { provide: ProvidedControlDirective, useFactory: create },
      ],
    })
    class HintDirective {
      @Input() public formControl = 'unbound';
      @Input('nativeHint') public hint = '';
    }

    TestBed.configureTestingModule({ declarations: [HintDirective] });
    MockRender('<input nativeHint="Hint" value="initial" />');
    const input = ngMocks.find('input');
    const injector = input.injector;
    const elDef: any = { element: { publicProviders: {} } };
    elDef.element.publicProviders = {
      hint: {
        parent: elDef,
        bindings: [{ name: 'hint' }],
        provider: { value: HintDirective },
      },
      dependency: {
        parent: elDef,
        bindings: [],
        provider: { value: ProvidedControlDirective },
      },
      ancestor: {
        parent: {},
        bindings: [{ name: 'formField' }],
        provider: { value: ProvidedControlDirective },
      },
    };
    Object.defineProperty(input, 'injector', {
      configurable: true,
      value: { elDef, get: injector.get.bind(injector) },
    });

    expect(create).not.toHaveBeenCalled();

    ngMocks.change(input, 'updated');

    expect(input.nativeElement.value).toBe('updated');
    expect(ngMocks.get(input, HintDirective).hint).toBe('Hint');
    expect(ngMocks.get(input, HintDirective).formControl).toBe(
      'unbound',
    );
    expect(create).not.toHaveBeenCalled();

    expect(
      input.injector.get(ProvidedControlDirective).formField,
    ).toBe('unrelated');
    expect(create).toHaveBeenCalledTimes(1);
  });

  for (const exposedInput of ['formField', 'nativeHint']) {
    it(`uses the public ${exposedInput} alias of an Ivy host directive`, () => {
      @Directive({ standalone: true })
      class BindingDirective {
        @Input() public field = '';
      }

      @Directive({
        selector: '[hostBinding]',
        standalone: false,
        hostDirectives: [
          {
            directive: BindingDirective,
            inputs: [`field: ${exposedInput}`],
          },
        ],
      })
      class HostDirective {}

      TestBed.configureTestingModule({
        declarations: [HostDirective],
      });
      const params = { value: 'initial' };
      MockRender(
        `<input hostBinding [${exposedInput}]="value" value="initial" />`,
        params,
      );
      const input = ngMocks.find('input');
      const directive = ngMocks.get(input, BindingDirective);

      expect(directive.field).toBe('initial');
      expect(input.nativeElement.value).toBe('initial');

      if (exposedInput === 'formField') {
        expect(() => ngMocks.change(input, 'updated')).toThrowError(
          /Cannot find ControlValueAccessor on the element/,
        );
        expect(input.nativeElement.value).toBe('initial');
      } else {
        ngMocks.change(input, 'updated');
        expect(input.nativeElement.value).toBe('updated');
      }

      expect(directive.field).toBe('initial');
      expect(params.value).toBe('initial');
    });
  }

  for (const formInput of [
    'ngModel',
    'formControl',
    'formControlName',
    'formField',
  ]) {
    it(`does not replace a mocked ${formInput} binding with an unbound native change`, () => {
      @Directive({ selector: '[formBinding]', standalone: false })
      class FormBindingDirective {
        @Input(formInput) public field = '';
      }

      TestBed.configureTestingModule({
        declarations: [MockDirective(FormBindingDirective)],
      });
      const params = { value: 'initial' };
      MockRender(
        `<input formBinding [${formInput}]="value" />`,
        params,
      );
      const input = ngMocks.find('input');
      const events: string[] = [];
      for (const event of ['focus', 'input', 'change', 'blur']) {
        input.nativeElement.addEventListener(event, () =>
          events.push(event),
        );
      }

      expect(ngMocks.input(input, formInput)).toBe('initial');
      expect(input.nativeElement.value).toBe('');

      expect(() => ngMocks.change(input, 'updated')).toThrowError(
        /Cannot find ControlValueAccessor on the element/,
      );

      expect(params.value).toBe('initial');
      expect(ngMocks.input(input, formInput)).toBe('initial');
      expect(input.nativeElement.value).toBe('');
      expect(events).toEqual([]);
    });
  }
});
