import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { DebugNodeSelector } from '../../common/core.types';
import mockHelperFind from '../find/mock-helper.find';
import isDebugNode from '../format/is-debug-node';
import isFixture from '../format/is-fixture';
import isHtmlElement from '../format/is-html-element';
import funcGetLastFixture from '../func.get-last-fixture';
import mockHelperStub from '../mock-helper.stub';

import mockHelperEvent from './mock-helper.event';

/**
 * @see https://developer.mozilla.org/de/docs/Web/Events
 */
const preventBubble = ['focus', 'blur', 'load', 'unload', 'change', 'reset', 'scroll'];

const toEventObj = (event: string | UIEvent | KeyboardEvent | MouseEvent | TouchEvent | Event): Event => {
  return typeof event === 'string'
    ? mockHelperEvent(event, {
        bubbles: preventBubble.indexOf(event) === -1,
        cancelable: true,
      })
    : event;
};

const getNativeElement = (
  debugElement: DebugElement | HTMLElement | ComponentFixture<any> | undefined | null,
): HTMLElement | undefined => {
  if (isDebugNode(debugElement) || isFixture(debugElement)) {
    return debugElement.nativeElement;
  }
  if (isHtmlElement(debugElement)) {
    return debugElement;
  }

  return undefined;
};

export default (
  selector: DebugElement | HTMLElement | ComponentFixture<any> | DebugNodeSelector,
  eventName: string | UIEvent | KeyboardEvent | MouseEvent | TouchEvent | Event,
  payload?: Partial<UIEvent | KeyboardEvent | MouseEvent | TouchEvent | Event>,
) => {
  const debugElement = isHtmlElement(selector) ? selector : mockHelperFind(funcGetLastFixture(), selector, undefined);
  const nativeElement = getNativeElement(debugElement);

  if (!nativeElement) {
    throw new Error(
      `Cannot trigger ${typeof eventName === 'string' ? eventName : eventName.type} event undefined element`,
    );
  }

  // nothing to emit on disabled elements
  if ((nativeElement as HTMLInputElement).disabled) {
    return;
  }

  const event = toEventObj(eventName);
  if (!event.target) {
    mockHelperStub(event, {
      target: nativeElement,
    });
  }
  if (payload) {
    mockHelperStub(event, payload);
  }
  nativeElement.dispatchEvent(event);
};
