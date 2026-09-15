import { DebugNode, Injector } from '@angular/core';
import {
  DefaultValueAccessor,
  FormControl,
  FormControlDirective,
  NG_VALUE_ACCESSOR,
  NgControl,
  NgModel,
} from '@angular/forms';

import coreForm from '../../common/core.form';
import { MockControlValueAccessorProxy } from '../../common/mock-control-value-accessor-proxy';

import funcGetVca from './func.get-vca';

describe('func.get-vca', () => {
  // These focused stubs expose only the injector and local tokens used by the lookup.
  for (const operation of [
    '__simulateChange',
    '__simulateTouch',
  ] as const) {
    it(`uses the local FormControl for an unregistered ${operation} proxy`, () => {
      const accessor = new MockControlValueAccessorProxy();
      accessor.instance = {
        __simulateChange: () => undefined,
        __simulateTouch: () => undefined,
      };
      const control = new FormControl('initial');
      const node = {
        injector: Injector.create({
          providers: [
            {
              provide: NgControl,
              useValue: { valueAccessor: accessor },
            },
            {
              provide: FormControlDirective,
              useValue: { form: control },
            },
          ],
        }),
        providerTokens: [NgControl, FormControlDirective],
      } as unknown as DebugNode;

      // A placeholder on the mock is not a callback registered by Angular forms.
      expect(funcGetVca(node, true, operation)).toBe(control);
      expect(funcGetVca(node, false, operation)).toBe(control);
      expect(control.value).toBe('initial');
      expect(control.touched).toBe(false);

      // A real registration restores the selected proxy's priority for this operation.
      const callback = jasmine.createSpy('callback');
      if (operation === '__simulateChange') {
        accessor.registerOnChange(callback);
      } else {
        accessor.registerOnTouched(callback);
      }
      expect(funcGetVca(node, false, operation)).toBe(accessor);
      expect(callback).not.toHaveBeenCalled();
    });

    it(`does not replace an unregistered selected ${operation} proxy with another candidate`, () => {
      const accessor = new MockControlValueAccessorProxy();
      const otherAccessor = new MockControlValueAccessorProxy();
      otherAccessor.instance = {};
      otherAccessor.registerOnChange(jasmine.createSpy('change'));
      otherAccessor.registerOnTouched(jasmine.createSpy('touch'));
      const createCandidates = jasmine
        .createSpy('candidates')
        .and.returnValue([otherAccessor]);
      const node = {
        injector: Injector.create({
          providers: [
            {
              provide: NgControl,
              useValue: { valueAccessor: accessor },
            },
            {
              provide: NG_VALUE_ACCESSOR,
              useFactory: createCandidates,
            },
          ],
        }),
        providerTokens: [NgControl, NG_VALUE_ACCESSOR],
      } as unknown as DebugNode;

      expect(funcGetVca(node, true, operation)).toBeUndefined();
      expect(() => funcGetVca(node, false, operation)).toThrowError(
        /Cannot find ControlValueAccessor/,
      );
      expect(createCandidates).not.toHaveBeenCalled();
    });

    it(`checks registration after recovering a local ${operation} candidate`, () => {
      const accessor = new MockControlValueAccessorProxy();
      const ngControl = { valueAccessor: null };
      const node = {
        injector: Injector.create({
          providers: [
            { provide: NgControl, useValue: ngControl },
            { provide: NG_VALUE_ACCESSOR, useValue: [accessor] },
          ],
        }),
        providerTokens: [NgControl, NG_VALUE_ACCESSOR],
      } as unknown as DebugNode;

      expect(funcGetVca(node, true, operation)).toBeUndefined();
      expect(() => funcGetVca(node, false, operation)).toThrowError(
        /Cannot find ControlValueAccessor/,
      );

      accessor.instance = {};
      const callback = jasmine.createSpy('callback');
      if (operation === '__simulateChange') {
        accessor.registerOnChange(callback);
      } else {
        accessor.registerOnTouched(callback);
      }
      expect(funcGetVca(node, false, operation)).toBe(accessor);
      expect(ngControl.valueAccessor).toBeNull();
      expect(callback).not.toHaveBeenCalled();
    });

    it(`does not use ancestor bindings for an unregistered local ${operation} proxy`, () => {
      const control = new FormControl('parent');
      const emit = jasmine.createSpy('emit');
      const parent = Injector.create({
        providers: [
          {
            provide: FormControlDirective,
            useValue: { form: control },
          },
          { provide: NgModel, useValue: { update: { emit } } },
        ],
      });
      const node = {
        injector: Injector.create({
          parent,
          providers: [
            {
              provide: NgControl,
              useValue: {
                valueAccessor: new MockControlValueAccessorProxy(),
              },
            },
          ],
        }),
        providerTokens: [NgControl],
      } as unknown as DebugNode;

      expect(funcGetVca(node, true, operation)).toBeUndefined();
      expect(() => funcGetVca(node, false, operation)).toThrowError(
        /Cannot find ControlValueAccessor/,
      );
      expect(control.value).toBe('parent');
      expect(control.untouched).toBe(true);
      expect(emit).not.toHaveBeenCalled();
    });
  }

  it('uses mocked NgModel for change without inventing a touch fallback', () => {
    const accessor = new MockControlValueAccessorProxy();
    accessor.instance = {};
    const emit = jasmine.createSpy('emit');
    const ngModel = { update: { emit } };
    const node = {
      injector: Injector.create({
        providers: [
          {
            provide: NgControl,
            useValue: { valueAccessor: accessor },
          },
          { provide: NgModel, useValue: ngModel },
        ],
      }),
      providerTokens: [NgControl, NgModel],
    } as unknown as DebugNode;

    expect(funcGetVca(node, false, '__simulateChange')).toBe(ngModel);
    expect(funcGetVca(node, true, '__simulateTouch')).toBeUndefined();
    expect(() =>
      funcGetVca(node, false, '__simulateTouch'),
    ).toThrowError(/Cannot find ControlValueAccessor/);

    // Registering change does not connect touch, or invoke the output during lookup.
    const change = jasmine.createSpy('change');
    accessor.registerOnChange(change);
    expect(funcGetVca(node, false, '__simulateChange')).toBe(
      accessor,
    );
    expect(funcGetVca(node, true, '__simulateTouch')).toBeUndefined();
    expect(emit).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
  });

  it('preserves duplicate candidate errors before checking mock registration', () => {
    const node = {
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          {
            provide: NG_VALUE_ACCESSOR,
            useValue: [
              new MockControlValueAccessorProxy(),
              new MockControlValueAccessorProxy(),
            ],
          },
        ],
      }),
      providerTokens: [NgControl, NG_VALUE_ACCESSOR],
    } as unknown as DebugNode;

    expect(() =>
      funcGetVca(node, true, '__simulateChange'),
    ).toThrowError(/More than one custom value accessor/);
    expect(() =>
      funcGetVca(node, true, '__simulateTouch'),
    ).toThrowError(/More than one custom value accessor/);
  });

  it('preserves a selected real accessor without requiring mock registration', () => {
    const accessor = {
      onChange: jasmine.createSpy('change'),
      onTouched: jasmine.createSpy('touch'),
    };
    const control = new FormControl('initial');
    const node = {
      injector: Injector.create({
        providers: [
          {
            provide: NgControl,
            useValue: { valueAccessor: accessor },
          },
          {
            provide: FormControlDirective,
            useValue: { form: control },
          },
        ],
      }),
      providerTokens: [NgControl, FormControlDirective],
    } as unknown as DebugNode;

    expect(funcGetVca(node, false, '__simulateChange')).toBe(
      accessor,
    );
    expect(funcGetVca(node, false, '__simulateTouch')).toBe(accessor);
    expect(accessor.onChange).not.toHaveBeenCalled();
    expect(accessor.onTouched).not.toHaveBeenCalled();
    expect(control.value).toBe('initial');
  });

  for (const missing of [null, undefined]) {
    it(`does not instantiate an accessor when the local NgControl resolves to ${missing}`, () => {
      const accessor = new MockControlValueAccessorProxy();
      const createAccessor = jasmine
        .createSpy('createAccessor')
        .and.returnValue([accessor]);
      const node: any = {
        injector: Injector.create({
          providers: [
            { provide: NgControl, useValue: missing },
            {
              provide: NG_VALUE_ACCESSOR,
              useFactory: createAccessor,
            },
          ],
        }),
        providerTokens: [NgControl, NG_VALUE_ACCESSOR],
      };

      expect(funcGetVca(node, true)).toBeUndefined();
      expect(() => funcGetVca(node)).toThrowError(
        /Cannot find ControlValueAccessor on the element/,
      );
      expect(createAccessor).not.toHaveBeenCalled();
    });

    it(`does not fall back to a parent accessor when the local accessor provider resolves to ${missing}`, () => {
      const parentAccessor = new MockControlValueAccessorProxy();
      const parent = Injector.create({
        providers: [
          { provide: NG_VALUE_ACCESSOR, useValue: [parentAccessor] },
        ],
      });
      const node: any = {
        injector: Injector.create({
          parent,
          providers: [
            { provide: NgControl, useValue: { valueAccessor: null } },
            { provide: NG_VALUE_ACCESSOR, useValue: missing },
          ],
        }),
        providerTokens: [NgControl, NG_VALUE_ACCESSOR],
      };

      expect(funcGetVca(node, true)).toBeUndefined();
      expect(() => funcGetVca(node)).toThrowError(
        /Cannot find ControlValueAccessor on the element/,
      );
      expect(parent.get(NG_VALUE_ACCESSOR)).toEqual([parentAccessor]);
    });
  }

  it('preserves the accessor already selected by NgControl', () => {
    const accessor = new MockControlValueAccessorProxy();
    const otherAccessor = new MockControlValueAccessorProxy();
    const control = new FormControl('initial');
    const ngModel = { update: { emit: jasmine.createSpy('emit') } };
    const node: any = {
      injector: Injector.create({
        providers: [
          {
            provide: NgControl,
            useValue: { valueAccessor: accessor },
          },
          {
            provide: FormControlDirective,
            useValue: { form: control },
          },
          { provide: NgModel, useValue: ngModel },
          { provide: NG_VALUE_ACCESSOR, useValue: [otherAccessor] },
        ],
      }),
      providerTokens: [
        NgControl,
        FormControlDirective,
        NgModel,
        NG_VALUE_ACCESSOR,
      ],
    };

    expect(funcGetVca(node)).toBe(accessor);
    expect(funcGetVca(node, true)).toBe(accessor);
    expect(control.value).toBe('initial');
    expect(ngModel.update.emit).not.toHaveBeenCalled();
  });

  it('preserves the FormControlDirective fallback before other providers', () => {
    const control = new FormControl('initial');
    const ngModel = { update: { emit: jasmine.createSpy('emit') } };
    const node: any = {
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          {
            provide: FormControlDirective,
            useValue: { form: control },
          },
          { provide: NgModel, useValue: ngModel },
          {
            provide: NG_VALUE_ACCESSOR,
            useValue: [new MockControlValueAccessorProxy()],
          },
        ],
      }),
      providerTokens: [
        NgControl,
        FormControlDirective,
        NgModel,
        NG_VALUE_ACCESSOR,
      ],
    };

    expect(funcGetVca(node)).toBe(control);
    expect(funcGetVca(node, true)).toBe(control);
    expect(control.value).toBe('initial');
    expect(control.touched).toBe(false);
    expect(ngModel.update.emit).not.toHaveBeenCalled();
  });

  it('preserves the NgModel fallback when a form directive has no control', () => {
    const ngModel = { update: { emit: jasmine.createSpy('emit') } };
    const node: any = {
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: FormControlDirective, useValue: { form: null } },
          { provide: NgModel, useValue: ngModel },
          {
            provide: NG_VALUE_ACCESSOR,
            useValue: [new MockControlValueAccessorProxy()],
          },
        ],
      }),
      providerTokens: [
        NgControl,
        FormControlDirective,
        NgModel,
        NG_VALUE_ACCESSOR,
      ],
    };

    expect(funcGetVca(node)).toBe(ngModel);
    expect(funcGetVca(node, true)).toBe(ngModel);
    expect(ngModel.update.emit).not.toHaveBeenCalled();
  });

  it('recovers a local mock accessor when NgControl has no selected accessor', () => {
    const accessor = new MockControlValueAccessorProxy();
    const node: any = {
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: NG_VALUE_ACCESSOR, useValue: [accessor] },
        ],
      }),
      providerTokens: [NgControl, NG_VALUE_ACCESSOR],
    };

    expect(funcGetVca(node)).toBe(accessor);
    expect(funcGetVca(node, true)).toBe(accessor);
  });

  it('skips a null form directive provider and resolves the local NgModel', () => {
    const ngModel = { update: { emit: jasmine.createSpy('emit') } };
    const node: any = {
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: FormControlDirective, useValue: null },
          { provide: NgModel, useValue: ngModel },
        ],
      }),
      providerTokens: [NgControl, FormControlDirective, NgModel],
    };

    expect(funcGetVca(node)).toBe(ngModel);
    expect(ngModel.update.emit).not.toHaveBeenCalled();
  });

  it('selects a local custom accessor before the default accessor', () => {
    const defaultAccessor = new DefaultValueAccessor(
      {} as never,
      {} as never,
      false,
    );
    const customAccessor = new MockControlValueAccessorProxy();
    const node: any = {
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          {
            provide: NG_VALUE_ACCESSOR,
            useValue: [defaultAccessor, customAccessor],
          },
        ],
      }),
      providerTokens: [NgControl, NG_VALUE_ACCESSOR],
    };

    expect(funcGetVca(node)).toBe(customAccessor);
    expect(funcGetVca(node, true)).toBe(customAccessor);
  });

  it('does not recover an accessor inherited from the parent injector', () => {
    const accessor = new MockControlValueAccessorProxy();
    const parent = Injector.create({
      providers: [
        { provide: NG_VALUE_ACCESSOR, useValue: [accessor] },
      ],
    });
    const node: any = {
      injector: Injector.create({
        parent,
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
        ],
      }),
      providerTokens: [NgControl],
    };

    expect(node.injector.get(NG_VALUE_ACCESSOR)).toEqual([accessor]);
    expect(() => funcGetVca(node)).toThrowError(
      /Cannot find ControlValueAccessor on the element/,
    );
    expect(funcGetVca(node, true)).toBeUndefined();
  });

  it('uses the first accessor when Angular does not export its selector', () => {
    const first = new MockControlValueAccessorProxy();
    const second = new MockControlValueAccessorProxy();
    const node: any = {
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: NG_VALUE_ACCESSOR, useValue: [first, second] },
        ],
      }),
      providerTokens: [NgControl, NG_VALUE_ACCESSOR],
    };
    const selectValueAccessor = coreForm.selectValueAccessor;
    coreForm.selectValueAccessor = undefined;
    try {
      expect(funcGetVca(node)).toBe(first);
    } finally {
      coreForm.selectValueAccessor = selectValueAccessor;
    }
  });

  it('treats an empty accessor provider as missing', () => {
    const node: any = {
      injector: Injector.create({
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
          { provide: NG_VALUE_ACCESSOR, useValue: [] },
        ],
      }),
      providerTokens: [NgControl, NG_VALUE_ACCESSOR],
    };

    expect(() => funcGetVca(node)).toThrowError(
      /Cannot find ControlValueAccessor on the element/,
    );
    expect(funcGetVca(node, true)).toBeUndefined();
  });

  it('does not recover an unbound value accessor without NgControl', () => {
    const accessor = new MockControlValueAccessorProxy();
    const node: any = {
      injector: Injector.create({
        providers: [
          { provide: NG_VALUE_ACCESSOR, useValue: [accessor] },
        ],
      }),
      providerTokens: [NG_VALUE_ACCESSOR],
    };

    expect(() => funcGetVca(node)).toThrowError(
      /Cannot find ControlValueAccessor on the element/,
    );
    expect(funcGetVca(node, true)).toBeUndefined();
  });

  it('does not bind an unbound child accessor through an ancestor NgControl', () => {
    const parentAccessor = new MockControlValueAccessorProxy();
    const childAccessor = new MockControlValueAccessorProxy();
    const parent = Injector.create({
      providers: [
        {
          provide: NgControl,
          useValue: { valueAccessor: parentAccessor },
        },
      ],
    });
    const node: any = {
      injector: Injector.create({
        parent,
        providers: [
          { provide: NG_VALUE_ACCESSOR, useValue: [childAccessor] },
        ],
      }),
      providerTokens: [NG_VALUE_ACCESSOR],
    };

    expect(node.injector.get(NgControl).valueAccessor).toBe(
      parentAccessor,
    );
    expect(() => funcGetVca(node)).toThrowError(
      /Cannot find ControlValueAccessor on the element/,
    );
    expect(funcGetVca(node, true)).toBeUndefined();
  });

  it('does not resolve a local signal field through an ancestor legacy control', () => {
    const accessor = new MockControlValueAccessorProxy();
    const control = new FormControl('parent');
    const ngModel = { update: { emit: jasmine.createSpy('emit') } };
    const parent = Injector.create({
      providers: [
        { provide: NgControl, useValue: { valueAccessor: accessor } },
        {
          provide: FormControlDirective,
          useValue: { form: control },
        },
        { provide: NgModel, useValue: ngModel },
        { provide: NG_VALUE_ACCESSOR, useValue: [accessor] },
      ],
    });
    const node: any = {
      injector: Injector.create({
        parent,
        providers: [
          { provide: NgControl, useValue: { valueAccessor: null } },
        ],
      }),
      providerTokens: [NgControl],
    };

    expect(node.injector.get(FormControlDirective).form).toBe(
      control,
    );
    expect(node.injector.get(NgModel)).toBe(ngModel);
    expect(() => funcGetVca(node)).toThrowError(
      /Cannot find ControlValueAccessor on the element/,
    );
    expect(funcGetVca(node, true)).toBeUndefined();
    expect(control.value).toBe('parent');
    expect(control.touched).toBe(false);
    expect(ngModel.update.emit).not.toHaveBeenCalled();
  });

  it('keeps the missing-accessor error unless lookup is optional', () => {
    const node: any = {
      injector: Injector.create({ providers: [] }),
      providerTokens: [],
    };

    expect(() => funcGetVca(node)).toThrowError(
      /Cannot find ControlValueAccessor on the element/,
    );
    expect(funcGetVca(node, true)).toBeUndefined();
  });
});
