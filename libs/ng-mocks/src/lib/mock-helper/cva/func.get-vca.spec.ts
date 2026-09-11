import { Injector } from '@angular/core';
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
