import {
  Component,
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

  it('ignores ordinary inputs and unrelated signal model aliases', () => {
    @Directive({ selector: '[unrelatedModels]', standalone: false })
    class UnrelatedModels {
      @Input() @Output('valueChange') public readonly value =
        signal('ordinary');
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

  it('ignores missing signal instances and unusable model outputs', () => {
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
