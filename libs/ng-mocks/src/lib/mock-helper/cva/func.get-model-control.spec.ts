import {
  Component,
  DebugNode,
  Directive,
  EventEmitter,
  InjectionToken,
  Injector,
  Input,
  Output,
  signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';

import funcGetModelControl from './func.get-model-control';

@Directive({ selector: '[valueModel]', standalone: false })
class ValueModel {
  // Compiler-equivalent model metadata keeps this unit independent of authoring transforms.
  // The signal-model-controls spread specs exercise real model() declarations.
  @Input({ alias: 'value', isSignal: true } as never)
  @Output('valueChange')
  public readonly current = signal('initial');
}

@Directive({ selector: '[legacyTouchModel]', standalone: false })
class LegacyTouchModel extends ValueModel {
  @Input({ alias: 'touched', isSignal: true } as never)
  @Output('touchedChange')
  public readonly wasTouched = signal(false);
}

@Component({
  selector: 'checked-model',
  standalone: false,
  template: '',
})
class CheckedModel {
  @Input({ alias: 'checked', isSignal: true } as never)
  @Output('checkedChange')
  public readonly current = signal(false);

  @Output('touch') public readonly notify = new EventEmitter<void>();
  @Output('touchedChange') public readonly legacy =
    new EventEmitter<boolean>();
}

@Directive({ selector: '[signalInputOnly]', standalone: false })
class SignalInputOnly {
  @Input({ alias: 'value', isSignal: true } as never)
  public readonly current = signal('initial');
}

@Directive({ selector: '[outputOnly]', standalone: false })
class OutputOnly {
  @Output('valueChange') public readonly changed =
    new EventEmitter<string>();
  @Output('touch') public readonly notify = new EventEmitter<void>();
}

describe('func.get-model-control', () => {
  it('emits inherited aliased classic value changes without writing the input', () => {
    @Directive({ selector: '[classicValue]', standalone: false })
    class ClassicValue {
      @Input('value') public inputValue = 'initial';
      @Output('valueChange') public readonly changed =
        new EventEmitter<string>();
    }
    @Component({
      selector: 'inherited-classic-value',
      standalone: false,
      template: '',
    })
    class InheritedClassicValue extends ClassicValue {}
    const instance = new InheritedClassicValue();
    const values: string[] = [];
    instance.changed.subscribe(value => values.push(value));
    // The stub exposes only the local injector and tokens used by the lookup.
    const node = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: InheritedClassicValue, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, InheritedClassicValue],
    } as unknown as DebugNode;

    const control = funcGetModelControl(node);
    expect(control?.touch).toBeUndefined();
    control!.change('updated');

    // Angular consumes the output and writes inputs during change detection.
    expect(values).toEqual(['updated']);
    expect(instance.inputValue).toBe('initial');
  });

  it('accepts undefined and object values without requiring a callable input', () => {
    @Component({
      selector: 'classic-object-value',
      standalone: false,
      template: '',
    })
    class ClassicObjectValue {
      @Input() public value: { id: number } | undefined;
      @Output() public readonly valueChange = new EventEmitter<
        { id: number } | undefined
      >();
    }
    const instance = new ClassicObjectValue();
    const initial = { id: 1 };
    const updated = { id: 2 };
    const values: Array<{ id: number } | undefined> = [];
    instance.valueChange.subscribe(value => values.push(value));
    const node = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: ClassicObjectValue, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, ClassicObjectValue],
    } as unknown as DebugNode;

    // An unset input still has a valid classic input/output connection.
    funcGetModelControl(node)!.change(updated);
    expect(values).toEqual([updated]);
    expect(values[0]).toBe(updated);
    expect(instance.value).toBeUndefined();

    instance.value = initial;
    funcGetModelControl(node)!.change(undefined);
    expect(values).toEqual([updated, undefined]);
    expect(instance.value).toBe(initial);
  });

  it('emits classic checked changes and an aliased touchedChange output', () => {
    @Component({
      selector: 'classic-checked',
      standalone: false,
      template: '',
    })
    class ClassicChecked {
      @Input('checked') public inputValue = false;
      @Output('checkedChange') public readonly changed =
        new EventEmitter<boolean>();
      @Output('touchedChange') public readonly touched =
        new EventEmitter<boolean>();
    }
    const instance = new ClassicChecked();
    const values: boolean[] = [];
    const touches: boolean[] = [];
    instance.changed.subscribe(value => values.push(value));
    instance.touched.subscribe(value => touches.push(value));
    const node = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: ClassicChecked, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, ClassicChecked],
    } as unknown as DebugNode;

    const control = funcGetModelControl(node);
    control!.change(true);
    control!.touch!();

    expect(values).toEqual([true]);
    expect(touches).toEqual([true]);
    expect(instance.inputValue).toBe(false);
  });

  it('prefers the value pair when checked is declared first', () => {
    @Component({
      selector: 'classic-value-and-checked',
      standalone: false,
      template: '',
    })
    class ClassicValueAndChecked {
      @Input() public checked = false;
      @Output() public readonly checkedChange =
        new EventEmitter<boolean>();
      @Input() public value = 'initial';
      @Output() public readonly valueChange =
        new EventEmitter<string>();
    }
    const instance = new ClassicValueAndChecked();
    const values: string[] = [];
    const checks: boolean[] = [];
    instance.valueChange.subscribe(value => values.push(value));
    instance.checkedChange.subscribe(value => checks.push(value));
    const node = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: ClassicValueAndChecked, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, ClassicValueAndChecked],
    } as unknown as DebugNode;

    // FormField chooses the value connection independently of declaration order.
    funcGetModelControl(node)!.change('updated');

    expect(values).toEqual(['updated']);
    expect(checks).toEqual([]);
    expect(instance.value).toBe('initial');
    expect(instance.checked).toBe(false);
  });

  it('skips declarations without inputs or outputs while preserving a co-located model control', () => {
    @Directive({ selector: '[unboundState]', standalone: false })
    class UnboundState {
      public readonly value = signal('unbound');
    }
    const unbound = new UnboundState();
    const instance = new ValueModel();
    const node: any = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: UnboundState, useValue: unbound },
          { provide: ValueModel, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, UnboundState, ValueModel],
    };

    const control = funcGetModelControl(node);
    expect(control?.touch).toBeUndefined();
    control!.change('updated');

    expect(instance.current()).toBe('updated');
    expect(unbound.value()).toBe('unbound');
  });

  it('changes an aliased real model without replacing its signal or requiring a touch output', () => {
    const instance = new ValueModel();
    const value = instance.current;
    const node: any = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: ValueModel, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, ValueModel],
    };

    const control = funcGetModelControl(node);

    expect(control).toBeDefined();
    expect(control?.touch).toBeUndefined();
    control!.change('updated');

    expect(instance.current).toBe(value);
    expect(value()).toBe('updated');
  });

  it('changes checked models and prefers an aliased touch output over touchedChange', () => {
    const instance = new CheckedModel();
    const touches: unknown[] = [];
    const legacyTouches: boolean[] = [];
    instance.notify.subscribe(value => touches.push(value));
    instance.legacy.subscribe(value => legacyTouches.push(value));
    const node: any = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: CheckedModel, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, CheckedModel],
    };

    const control = funcGetModelControl(node);
    control!.change(true);
    control!.touch!();

    expect(instance.current()).toBe(true);
    expect(touches).toEqual([undefined]);
    expect(legacyTouches).toEqual([]);
  });

  it('supports inherited model metadata and the Angular 21 touched model output', () => {
    const instance = new LegacyTouchModel();
    const touched = instance.wasTouched;
    const node: any = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: LegacyTouchModel, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, LegacyTouchModel],
    };

    const control = funcGetModelControl(node);
    control!.touch!();

    expect(instance.current()).toBe('initial');
    expect(instance.wasTouched).toBe(touched);
    expect(touched()).toBe(true);
  });

  it('uses separate configured mock emitters without replacing or writing the input signal', () => {
    const instance = Object.assign(new CheckedModel(), {
      __ngMocks: true,
      __ngMocksConfig: {
        outputs: [
          'other:unrelated',
          'changed:checkedChange',
          'touched:touch',
        ],
      },
      other: new EventEmitter<boolean>(),
      changed: new EventEmitter<boolean>(),
      touched: new EventEmitter<void>(),
    });
    const checked = instance.current;
    const values: boolean[] = [];
    const touches: unknown[] = [];
    const unrelated: boolean[] = [];
    const originalTouches: unknown[] = [];
    instance.changed.subscribe(value => values.push(value));
    instance.touched.subscribe(value => touches.push(value));
    instance.other.subscribe(value => unrelated.push(value));
    instance.notify.subscribe(value => originalTouches.push(value));
    const node: any = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: CheckedModel, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, CheckedModel],
    };

    const control = funcGetModelControl(node);
    control!.change(true);
    control!.touch!();

    expect(instance.current).toBe(checked);
    expect(checked()).toBe(false);
    expect(values).toEqual([true]);
    expect(touches).toEqual([undefined]);
    expect(unrelated).toEqual([]);
    expect(originalTouches).toEqual([]);
  });

  it('falls back to declared output metadata when a custom mock has no matching configured output', () => {
    const instance = Object.assign(new ValueModel(), {
      __ngMocks: true,
      __ngMocksConfig: {} as { outputs?: string[] },
    });
    const node: any = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: ValueModel, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, ValueModel],
    };

    funcGetModelControl(node)!.change('first');
    expect(instance.current()).toBe('first');

    instance.__ngMocksConfig.outputs = ['unrelated'];
    funcGetModelControl(node)!.change('second');
    expect(instance.current()).toBe('second');
  });

  it('does not bind an unbound model to an ancestor NgControl', () => {
    const instance = new ValueModel();
    const parent: any = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
        ],
      }),
      providerTokens: [NgControl],
    };
    const node: any = {
      nativeNode: {},
      parent,
      injector: Injector.create({
        parent: parent.injector,
        providers: [{ provide: ValueModel, useValue: instance }],
      }),
      providerTokens: [ValueModel],
    };

    expect(node.injector.get(NgControl)).toBe(
      parent.injector.get(NgControl),
    );
    expect(funcGetModelControl(node)).toBeUndefined();
    expect(instance.current()).toBe('initial');

    // A local alias of the ancestor control still does not create a local form binding.
    node.providerTokens = [NgControl, ValueModel];
    expect(funcGetModelControl(node)).toBeUndefined();
    expect(instance.current()).toBe('initial');
  });

  it('requires an actual local NgControl instance', () => {
    const instance = new ValueModel();
    const node: any = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: null },
          { provide: ValueModel, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, ValueModel],
    };

    expect(funcGetModelControl(node)).toBeUndefined();
    expect(instance.current()).toBe('initial');
  });

  it('skips a local provider alias that points to an ancestor model', () => {
    const ancestor = new ValueModel();
    const instance = new CheckedModel();
    const alias = new InjectionToken<ValueModel>('ancestor-model');
    const parent: any = {
      nativeNode: {},
      injector: Injector.create({
        providers: [{ provide: ValueModel, useValue: ancestor }],
      }),
      providerTokens: [ValueModel],
    };
    const node: any = {
      nativeNode: {},
      parent,
      injector: Injector.create({
        parent: parent.injector,
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: alias, useValue: ancestor },
          { provide: ValueModel, useValue: ancestor },
          { provide: CheckedModel, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, alias, ValueModel, CheckedModel],
    };

    funcGetModelControl(node)!.change(true);

    expect(ancestor.current()).toBe('initial');
    expect(instance.current()).toBe(true);
  });

  it('does not combine model input and output metadata from different declarations', () => {
    const instance = new SignalInputOnly();
    const output = new OutputOnly();
    const values: string[] = [];
    output.changed.subscribe(value => values.push(value));
    const node: any = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: SignalInputOnly, useValue: instance },
          { provide: OutputOnly, useValue: output },
        ],
      }),
      providerTokens: [NgControl, SignalInputOnly, OutputOnly],
    };

    expect(funcGetModelControl(node)).toBeUndefined();
    expect(instance.current()).toBe('initial');
    expect(values).toEqual([]);
  });

  it('does not take a touch output from a different declaration', () => {
    const instance = new ValueModel();
    const output = new OutputOnly();
    const touches: unknown[] = [];
    output.notify.subscribe(value => touches.push(value));
    const node: any = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: OutputOnly, useValue: output },
          { provide: ValueModel, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, OutputOnly, ValueModel],
    };

    const control = funcGetModelControl(node);
    expect(control?.touch).toBeUndefined();
    control!.change('updated');

    expect(instance.current()).toBe('updated');
    expect(touches).toEqual([]);
  });

  it('does not combine classic input and output metadata from different declarations', () => {
    @Directive({ selector: '[classicInputOnly]', standalone: false })
    class ClassicInputOnly {
      @Input('value') public inputValue = 'initial';
    }
    const instance = new ClassicInputOnly();
    const output = new OutputOnly();
    const values: string[] = [];
    output.changed.subscribe(value => values.push(value));
    const node = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: ClassicInputOnly, useValue: instance },
          { provide: OutputOnly, useValue: output },
        ],
      }),
      providerTokens: [NgControl, ClassicInputOnly, OutputOnly],
    } as unknown as DebugNode;

    expect(funcGetModelControl(node)).toBeUndefined();
    expect(instance.inputValue).toBe('initial');
    expect(values).toEqual([]);
  });

  it('ignores unpaired inputs and unrelated signal model aliases', () => {
    @Directive({ selector: '[unrelatedModels]', standalone: false })
    class UnrelatedModels {
      @Input() public readonly value = signal('ordinary');
      @Input({ alias: 'other', isSignal: true } as never)
      @Output('otherChange')
      public readonly other = signal('unrelated');
    }
    const instance = new UnrelatedModels();
    const node: any = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: UnrelatedModels, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, UnrelatedModels],
    };

    expect(funcGetModelControl(node)).toBeUndefined();
    expect(instance.value()).toBe('ordinary');
    expect(instance.other()).toBe('unrelated');
  });

  it('ignores missing and unusable model outputs', () => {
    @Directive({ selector: '[invalidModel]', standalone: false })
    class InvalidModel {
      @Input({ isSignal: true } as never) public value: any =
        undefined;
      @Output() public valueChange: any = undefined;
    }
    const instance = new InvalidModel();
    const node: any = {
      nativeNode: {},
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: InvalidModel, useValue: instance },
        ],
      }),
      providerTokens: [NgControl, InvalidModel],
    };

    expect(funcGetModelControl(node)).toBeUndefined();

    instance.value = signal('initial');
    expect(funcGetModelControl(node)).toBeUndefined();

    instance.valueChange = {};
    expect(funcGetModelControl(node)).toBeUndefined();
    expect(instance.value()).toBe('initial');
  });
});
