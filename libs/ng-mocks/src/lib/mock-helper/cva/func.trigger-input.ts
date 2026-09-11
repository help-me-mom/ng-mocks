import { DebugElement } from '@angular/core';

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

const setNativeValue = (element: any, value: any): boolean => {
  if (element.tagName === 'SELECT') {
    element.value = value;

    // Update selection state while retaining raw event values for unmatched or coerced options.
    return element.value === value;
  }
  if (element.tagName !== 'INPUT') {
    return false;
  }

  switch (element.type) {
    case 'checkbox': {
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

export default (el: DebugElement, value: any): void => {
  mockHelperTrigger(el, 'focus');

  const element = el.nativeElement;
  const descriptor = Object.getOwnPropertyDescriptor(element, 'value');
  const nativeValue = setNativeValue(element, value);
  if (!nativeValue) {
    // Text and custom controls historically receive the original value, including numbers.
    mockHelperStubMember(element, 'value', value);
  }

  let restore = !nativeValue;
  try {
    mockHelperTrigger(el, 'input');
    mockHelperTrigger(el, 'change');
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
