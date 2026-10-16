import { DebugElement } from '@angular/core';

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
      // Angular stores template binding names after AttributeMarker.Bindings (3).
      bindings = attribute === 3;
    } else if (bindings && attribute === name) {
      return true;
    }
  }

  return false;
};

export default <T>(el: DebugElement, read: (instance: unknown) => T | undefined): T | undefined => {
  const injector = el.injector as { _tNode?: NodeInputs; _lView?: Record<number, unknown> };
  const node = injector._tNode;
  const view = injector._lView;
  if (!node || !view) {
    return undefined;
  }

  // Input tables advertise unbound inputs too. Read only rendered local bindings,
  // without constructing DI providers or consulting an ancestor's forms control.
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
        const result = read(view[index]);
        if (result !== undefined) {
          return result;
        }
      }
    }
  }

  return undefined;
};
