import { DebugElement } from '@angular/core';

import coreForm from '../../common/core.form';
import coreReflectDirectiveResolve from '../../common/core.reflect.directive-resolve';
import funcDirectiveIoParse from '../../common/func.directive-io-parse';
import funcIsMock from '../../common/func.is-mock';

import funcFindBoundFormField from './func.find-bound-form-field';

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

  // Angular 22.2.3 registers native field listeners outside DebugElement.listeners.
  return !!funcFindBoundFormField(el, instance => isRealField(instance) || undefined);
};
