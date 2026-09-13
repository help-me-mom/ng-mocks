import { ChangeDetectorRef, DebugElement } from '@angular/core';

import coreForm from '../../common/core.form';
import coreReflectDirectiveResolve from '../../common/core.reflect.directive-resolve';
import { DebugNodeSelector } from '../../common/core.types';
import funcDirectiveIoParse from '../../common/func.directive-io-parse';
import { isMockControlValueAccessor } from '../../common/func.is-mock-control-value-accessor';
import helperExtractMethodsFromPrototype from '../../mock-service/helper.extract-methods-from-prototype';
import funcGetPublicProviderKeys from '../crawl/func.get-public-provider-keys';
import mockHelperFind from '../find/mock-helper.find';
import funcGetLastFixture from '../func.get-last-fixture';
import funcParseFindArgsName from '../func.parse-find-args-name';

import funcGetModelControl from './func.get-model-control';
import funcGetVca from './func.get-vca';
import triggerInput from './func.trigger-input';

const handleKnown = (valueAccessor: any, value: any): boolean => {
  if (coreForm && valueAccessor instanceof coreForm.AbstractControl) {
    valueAccessor.setValue(value);

    return true;
  }

  if (coreForm && valueAccessor instanceof coreForm.NgModel) {
    valueAccessor.update.emit(value);

    return true;
  }

  if (isMockControlValueAccessor(valueAccessor.instance)) {
    valueAccessor.instance.__simulateChange(value);

    return true;
  }

  return false;
};

const hasListener = (el: DebugElement): boolean =>
  el.listeners.some(listener => listener.name === 'input' || listener.name === 'change');

const formInputs = ['ngModel', 'formControl', 'formControlName', 'formField'];

const isUnboundNativeControl = (el: DebugElement): boolean => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(el.nativeNode.tagName) === -1) {
    return false;
  }

  // Inspect attached input bindings without constructing unrelated DI providers.
  const injector = el.injector as any;
  const node = injector._tNode;
  if (node) {
    for (const input of formInputs) {
      if (node.inputs?.[input] || node.hostDirectiveInputs?.[input]) {
        return false;
      }
    }

    return true;
  }

  return !funcGetPublicProviderKeys(el).some(key => {
    const config = injector.elDef.element.publicProviders[key];
    if (config.bindings.length === 0) {
      return false;
    }
    const bindings = config.bindings.map(
      (binding: { name: string; nonMinifiedName?: string }) => binding.nonMinifiedName || binding.name,
    );
    return coreReflectDirectiveResolve(config.provider.value).inputs!.some(input => {
      const { name, alias } = funcDirectiveIoParse(input);

      return bindings.indexOf(name) !== -1 && formInputs.indexOf(alias || name) !== -1;
    });
  });
};

// ngMocks.change can update a CVA without Angular's normal input event path.
// Mark the changed element so OnPush views render on the next fixture check.
const markForNextCheck = (el: DebugElement): void => {
  try {
    el.injector.get(ChangeDetectorRef).markForCheck();
  } catch {
    // not all debug nodes expose ChangeDetectorRef
  }
};

const keys = [
  'onChange',
  'onChangeCallback',
  'onChangeCb',
  'onChangeClb',
  'onChangeFn',

  '_onChange',
  '_onChangeCallback',
  '_onChangeCb',
  '_onChangeClb',
  '_onChangeFn',

  'changeFn',
  '_changeFn',

  'onModelChange',

  'cvaOnChange',
  'cvaOnChangeCallback',
  'cvaOnChangeCb',
  'cvaOnChangeClb',
  'cvaOnChangeFn',

  '_cvaOnChange',
  '_cvaOnChangeCallback',
  '_cvaOnChangeCb',
  '_cvaOnChangeClb',
  '_cvaOnChangeFn',
];

export default (selector: DebugNodeSelector, value: any, methodName?: string): void => {
  const el = mockHelperFind(funcGetLastFixture(), selector, undefined);
  if (!el) {
    throw new Error(`Cannot find an element via ngMocks.change(${funcParseFindArgsName(selector)})`);
  }

  let valueAccessor = funcGetVca(el, true);
  let nativeControl = false;
  if (!valueAccessor) {
    const modelControl = funcGetModelControl(el);
    if (modelControl) {
      modelControl.change(value);
      markForNextCheck(el);

      return;
    }
    nativeControl = !hasListener(el) && isUnboundNativeControl(el);
    valueAccessor = funcGetVca(el, hasListener(el) || nativeControl) || {};
  }
  if (handleKnown(valueAccessor, value) || hasListener(el) || nativeControl) {
    triggerInput(el, value, valueAccessor);
    markForNextCheck(el);

    return;
  }

  for (const key of methodName ? [methodName] : keys) {
    if (typeof valueAccessor[key] === 'function') {
      valueAccessor.writeValue(value);
      valueAccessor[key](value);
      markForNextCheck(el);

      return;
    }
  }

  const methods = helperExtractMethodsFromPrototype(valueAccessor).filter(method => typeof method === 'string');
  throw new Error(
    [
      'Unsupported type of ControlValueAccessor,',
      `please ensure it has '${methodName || 'onChange'}' method.`,
      `If it is a 3rd-party library, please provide the correct name of the method in the 'methodName' parameter.`,
      'Possible Names: ' + methods.join(', ') + '.',
    ].join(' '),
  );
};
