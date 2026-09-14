import { DebugElement } from '@angular/core';

import coreForm from '../../common/core.form';
import helperDefinePropertyDescriptor from '../../mock-service/helper.define-property-descriptor';
import mockHelperTrigger from '../events/mock-helper.trigger';
import mockHelperStubMember from '../mock-helper.stub-member';

const setNativeNumber = (element: any, value: number): boolean => {
  // Older DOM test environments do not implement numeric input accessors.
  if (typeof element.valueAsNumber !== 'number') {
    return false;
  }
  element.valueAsNumber = value;

  return true;
};

const setNativeValue = (element: any, value: any, valueAccessor?: any): boolean => {
  if (element.tagName === 'SELECT') {
    if (element.multiple && Array.isArray(value)) {
      if (valueAccessor instanceof coreForm.SelectMultipleControlValueAccessor) {
        // Angular maps model values to encoded option values, including ngValue and compareWith.
        valueAccessor.writeValue(value);
      } else {
        for (const option of element.options) {
          option.selected = value.indexOf(option.value) !== -1;
        }
      }

      return true;
    }
    element.value = value;

    // Update selection state while retaining raw event values for unmatched or coerced options.
    return element.value === value;
  }
  if (element.tagName !== 'INPUT') {
    return false;
  }

  switch (element.type) {
    case 'radio': {
      if (typeof value !== 'boolean') {
        // Preserve the legacy raw-value event path for nonboolean arguments.
        return false;
      }
      element.checked = value;
      return true;
    }
    case 'checkbox': {
      // Keep the original DOM coercion for nonboolean arguments.
      element.checked = value;
      return true;
    }
    case 'number':
    case 'range':
    case 'datetime-local': {
      if (typeof value === 'number') {
        return setNativeNumber(element, value);
      }
      element.value = value ?? '';
      return true;
    }
    case 'date':
    case 'month':
    case 'time':
    case 'week': {
      if (value instanceof Date || value === null) {
        if (element.valueAsDate === undefined) {
          return false;
        }
        element.valueAsDate = value;
      } else if (typeof value === 'number') {
        return setNativeNumber(element, value);
      } else {
        element.value = value;
      }
      return true;
    }
    default: {
      return false;
    }
  }
};

const restoreValue = (element: any, value: any, descriptor?: PropertyDescriptor): void => {
  if (descriptor) {
    helperDefinePropertyDescriptor(element, 'value', descriptor);
    element.value = value;
  } else if (
    (element.tagName === 'INPUT' && element.type !== 'file') ||
    element.tagName === 'TEXTAREA' ||
    element.tagName === 'SELECT'
  ) {
    // File inputs keep their synthetic value because their native setter rejects nonempty strings.
    // Remove the temporary own property so later browser and Angular writes use the DOM setter.
    const updatedValue = element.value;
    delete element.value;
    // A select already received its value before the events; listeners may have changed selectedIndex.
    if (element.tagName !== 'SELECT' || updatedValue !== value) {
      element.value = updatedValue;
    }
  }
};

export default (el: DebugElement, value: any, valueAccessor?: any): void => {
  mockHelperTrigger(el, 'focus');

  const element = el.nativeElement;
  const descriptor = Object.getOwnPropertyDescriptor(element, 'value');
  const nativeValue = setNativeValue(element, value, valueAccessor);
  if (!nativeValue) {
    // Text and custom controls historically receive the original value, including numbers.
    mockHelperStubMember(element, 'value', value);
  }

  let restore = !nativeValue;
  try {
    // Unchecking with false must not emit a radio selection; legacy value calls still emit their events.
    if (element.tagName !== 'INPUT' || element.type !== 'radio' || value !== false) {
      mockHelperTrigger(el, 'input');
      mockHelperTrigger(el, 'change');
    }
    if (restore && descriptor) {
      // Existing accessors were restored before blur; new raw values remain visible through blur.
      restore = false;
      restoreValue(element, value, descriptor);
    }
    mockHelperTrigger(el, 'blur');
  } finally {
    if (restore) {
      restoreValue(element, value, descriptor);
    }
  }
};
