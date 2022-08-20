import { DebugElement } from '@angular/core';

import coreForm from '../../common/core.form';
import { DebugNodeSelector } from '../../common/core.types';
import { isMockControlValueAccessor } from '../../common/func.is-mock-control-value-accessor';
import helperDefinePropertyDescriptor from '../../mock-service/helper.define-property-descriptor';
import helperExtractMethodsFromPrototype from '../../mock-service/helper.extract-methods-from-prototype';
import mockHelperTrigger from '../events/mock-helper.trigger';
import mockHelperFind from '../find/mock-helper.find';
import funcGetLastFixture from '../func.get-last-fixture';
import funcParseFindArgsName from '../func.parse-find-args-name';
import mockHelperStubMember from '../mock-helper.stub-member';

import funcGetVca from './func.get-vca';

// default html behavior
const triggerInput = (el: DebugElement, value: any): void => {
  mockHelperTrigger(el, 'focus');

  const descriptor = Object.getOwnPropertyDescriptor(el.nativeElement, 'value');
  mockHelperStubMember(el.nativeElement, 'value', value);
  mockHelperTrigger(el, 'input');
  mockHelperTrigger(el, 'change');
  if (descriptor) {
    helperDefinePropertyDescriptor(el.nativeElement, 'value', descriptor);
    el.nativeElement.value = value;
  }

  mockHelperTrigger(el, 'blur');
};

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

  const valueAccessor = funcGetVca(el);
  if (handleKnown(valueAccessor, value) || hasListener(el)) {
    triggerInput(el, value);

    return;
  }

  for (const key of methodName ? [methodName] : keys) {
    if (typeof valueAccessor[key] === 'function') {
      valueAccessor.writeValue(value);
      valueAccessor[key](value);

      return;
    }
  }

  const methods = helperExtractMethodsFromPrototype(valueAccessor);
  throw new Error(
    [
      'Unsupported type of ControlValueAccessor,',
      `please ensure it has '${methodName || 'onChange'}' method.`,
      `If it is a 3rd-party library, please provide the correct name of the method in the 'methodName' parameter.`,
      'Possible Names: ' + methods.join(', ') + '.',
    ].join(' '),
  );
};
