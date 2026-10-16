import { DebugElement } from '@angular/core';

import coreForm from '../../common/core.form';
import coreReflectDirectiveResolve from '../../common/core.reflect.directive-resolve';
import funcDirectiveIoParse from '../../common/func.directive-io-parse';
import funcIsMock from '../../common/func.is-mock';

interface NodeInputs {
  attrs?: unknown[];
  directiveStart: number;
  directiveEnd: number;
  inputs?: Record<string, Array<number | string>>;
  hostDirectiveInputs?: Record<string, Array<number | string>>;
}

const hasBinding = (attrs: unknown[], name: string): boolean => {
  let bindings = false;
  for (const attribute of attrs) {
    if (typeof attribute === 'number') {
      bindings = attribute === 3;
    } else if (bindings && attribute === name) {
      return true;
    }
  }

  return false;
};

const isRealField = (instance: unknown): boolean => {
  if (!instance || typeof instance !== 'object' || funcIsMock(instance)) {
    return false;
  }

  try {
    const metadata = coreReflectDirectiveResolve(instance.constructor);
    if (
      metadata.selector !== '[formField]' ||
      metadata.exportAs !== 'formField' ||
      !metadata.providers?.some(
        provider =>
          provider && typeof provider === 'object' && 'provide' in provider && provider.provide === coreForm.NgControl,
      )
    ) {
      return false;
    }

    return metadata.inputs!.some(definition => {
      const input = funcDirectiveIoParse(definition);

      return !!input.isSignal && (input.alias || input.name) === 'formField';
    });
  } catch {
    return false;
  }
};

export default (el: DebugElement): boolean => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(el.nativeElement?.tagName) === -1) {
    return false;
  }

  const injector = el.injector as { _tNode?: NodeInputs; _lView?: Record<number, unknown> };
  const node = injector._tNode;
  const view = injector._lView;
  if (!node || !view) {
    return false;
  }

  // Angular 22.2.3 registers native field listeners outside DebugElement.listeners.
  // Inspect bound, rendered directives only; provider lookup could create unrelated services.
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
          publicName === 'formField' &&
          typeof index === 'number' &&
          index >= node.directiveStart &&
          index < node.directiveEnd &&
          isRealField(view[index])
        ) {
          return true;
        }
      }
    }
  }

  return false;
};
