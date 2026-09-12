import { DebugNode } from '@angular/core';

import coreForm from '../../common/core.form';
import { DirectiveIo, DirectiveIoParsed } from '../../common/core.types';
import funcDirectiveIoParse from '../../common/func.directive-io-parse';
import funcIsMock from '../../common/func.is-mock';
import { isNgDef } from '../../common/func.is-ng-def';
import funcGetFromNode from '../func.get-from-node';
import funcParseProviderTokensDirectives from '../func.parse-provider-tokens-directives';

interface ModelControl {
  change: (value: any) => void;
  touch?: () => void;
}

const findOutput = (outputs: DirectiveIo[], publicName: string): DirectiveIoParsed | undefined => {
  for (const definition of outputs) {
    const output = funcDirectiveIoParse(definition);
    if ((output.alias || output.name) === publicName) {
      return output;
    }
  }

  return undefined;
};

const resolveOutput = (
  instance: any,
  outputs: DirectiveIo[],
  publicName: string,
): ((value?: any) => void) | undefined => {
  const declared = findOutput(outputs, publicName);
  if (!declared) {
    return undefined;
  }

  // Mock model inputs remain signals, with their emitters stored separately.
  const mockOutputs: DirectiveIo[] | undefined = funcIsMock(instance) ? instance.__ngMocksConfig.outputs : undefined;
  const configured = findOutput(mockOutputs || [], publicName);
  const output = instance[configured ? configured.name : declared.name];
  if (typeof output?.emit === 'function') {
    return value => output.emit(value);
  }
  if (typeof output?.set === 'function') {
    return value => output.set(value);
  }

  return undefined;
};

export default (el: DebugNode): ModelControl | undefined => {
  if (
    !coreForm ||
    el.providerTokens.indexOf(coreForm.NgControl) === -1 ||
    !funcGetFromNode([], el, coreForm.NgControl)[0]
  ) {
    return undefined;
  }

  for (const token of el.providerTokens) {
    if (!isNgDef(token, 'c') && !isNgDef(token, 'd')) {
      continue;
    }
    const instance = funcGetFromNode<any>([], el, token)[0];
    const meta = instance && funcParseProviderTokensDirectives(el, token);
    if (!meta) {
      continue;
    }

    const outputs = meta.outputs!;
    for (const definition of meta.inputs!) {
      const input = funcDirectiveIoParse(definition);
      const name = input.alias || input.name;
      if (!input.isSignal || (name !== 'value' && name !== 'checked') || typeof instance[input.name] !== 'function') {
        continue;
      }

      const change = resolveOutput(instance, outputs, `${name}Change`);
      if (!change) {
        continue;
      }

      const touch = resolveOutput(instance, outputs, 'touch');
      const touchedChange = resolveOutput(instance, outputs, 'touchedChange');

      return {
        change,
        touch: touch ? () => touch() : touchedChange ? () => touchedChange(true) : undefined,
      };
    }
  }

  return undefined;
};
