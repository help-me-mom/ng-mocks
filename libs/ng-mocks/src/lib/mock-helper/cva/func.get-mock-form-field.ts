import { DebugElement } from '@angular/core';

import coreForm from '../../common/core.form';
import coreReflectDirectiveResolve from '../../common/core.reflect.directive-resolve';
import funcDirectiveIoParse from '../../common/func.directive-io-parse';
import { getSourceOfMock } from '../../common/func.get-source-of-mock';
import funcIsMock from '../../common/func.is-mock';
import { MockControlValueAccessorProxy } from '../../common/mock-control-value-accessor-proxy';

interface FieldState {
  controlValue: (() => unknown) & { set(value: any): void };
  markAsTouched(): void;
}

interface NodeInputs {
  attrs?: unknown[];
  directiveStart: number;
  directiveEnd: number;
  inputs?: Record<string, Array<number | string>>;
  hostDirectiveInputs?: Record<string, Array<number | string>>;
}

interface MockFieldControl {
  change(value: any): void;
  touch(): void;
}

const hasBinding = (attrs: unknown[], name: string): boolean => {
  let bindings = false;
  for (const attribute of attrs) {
    if (typeof attribute === 'number') {
      // Angular stores template binding names after AttributeMarker.Bindings (3).
      bindings = attribute === 3;
    } else if (bindings && attribute === name) {
      return true;
    }
  }

  return false;
};

const readState = (instance: any): FieldState | undefined => {
  if (!funcIsMock(instance)) {
    return undefined;
  }

  try {
    const source = getSourceOfMock(instance.constructor);
    const metadata = coreReflectDirectiveResolve(source);
    if (
      metadata.selector !== '[formField]' ||
      metadata.exportAs !== 'formField' ||
      !metadata.providers?.some(provider => (provider as any)?.provide === coreForm.NgControl)
    ) {
      return undefined;
    }

    for (const definition of metadata.inputs!) {
      const input = funcDirectiveIoParse(definition);
      if (
        !input.isSignal ||
        (input.alias || input.name) !== 'formField' ||
        typeof instance[input.name] !== 'function'
      ) {
        continue;
      }
      const tree = instance[input.name]();
      const state = typeof tree === 'function' ? tree() : undefined;
      if (
        state?.fieldTree === tree &&
        typeof state?.controlValue === 'function' &&
        typeof state.controlValue.set === 'function' &&
        typeof state.markAsTouched === 'function'
      ) {
        return state;
      }
    }
  } catch {
    // An incomplete mock input is not a usable binding. Field updates happen outside this catch.
  }

  return undefined;
};

const findState = (node: NodeInputs, view: Record<number, any>): FieldState | undefined => {
  const tables = [node.inputs, node.hostDirectiveInputs];
  for (let tableIndex = 0; tableIndex < tables.length; tableIndex += 1) {
    const table = tables[tableIndex];
    if (!table) {
      continue;
    }
    const hostDirective = tableIndex === 1;
    for (const alias of Object.keys(table)) {
      if (!hasBinding(node.attrs || [], alias)) {
        continue;
      }
      const entries = table[alias];
      for (let position = 0; position < entries.length; position += hostDirective ? 2 : 1) {
        const index = entries[position];
        const publicName = hostDirective ? entries[position + 1] : alias;
        if (
          publicName !== 'formField' ||
          typeof index !== 'number' ||
          index < node.directiveStart ||
          index >= node.directiveEnd
        ) {
          continue;
        }
        const state = readState(view[index]);
        if (state) {
          return state;
        }
      }
    }
  }

  return undefined;
};

const change = (el: DebugElement, state: FieldState, value: any): void => {
  const element = el.nativeElement;
  if (element.tagName === 'INPUT') {
    if (element.type === 'checkbox') {
      value = !!value;
    } else if (element.type === 'radio' && typeof value === 'boolean') {
      if (!value) {
        return;
      }
      value = element.value;
    }
  }
  // Angular's field operation applies its debounce policy and marks the edit dirty once.
  state.controlValue.set(value);
};

export default (
  el: DebugElement,
  accessor?: Record<keyof any, any>,
  methodName?: string,
): MockFieldControl | undefined => {
  // Accessor lookup has already checked proxy registration for the requested operation.
  if (
    (accessor &&
      (methodName ||
        accessor instanceof MockControlValueAccessorProxy ||
        accessor instanceof coreForm.AbstractControl ||
        accessor instanceof coreForm.NgModel)) ||
    [coreForm.NgModel, coreForm.FormControlDirective, coreForm.FormControlName].some(
      token => el.providerTokens.indexOf(token) !== -1,
    )
  ) {
    return undefined;
  }

  // Input tables advertise unbound inputs too. Inspect the actual binding and rendered instance,
  // without constructing DI-only declarations or consulting an ancestor's forms provider.
  const injector = el.injector as { _tNode?: NodeInputs; _lView?: Record<number, any> };
  if (!injector._tNode || !injector._lView) {
    return undefined;
  }
  const state = findState(injector._tNode, injector._lView);

  return state ? { change: value => change(el, state, value), touch: () => state.markAsTouched() } : undefined;
};
