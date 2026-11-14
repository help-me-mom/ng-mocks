import { Sanitizer } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import checkIsObjectPrototype from './check.is-object-prototype';

const sanitizerMethods = [
  'sanitize',
  'bypassSecurityTrustHtml',
  'bypassSecurityTrustStyle',
  'bypassSecurityTrustScript',
  'bypassSecurityTrustUrl',
  'bypassSecurityTrustResourceUrl',
];

const extraMethods = new Map<object, string[]>([
  [DomSanitizer.prototype, sanitizerMethods],
  [Sanitizer.prototype, sanitizerMethods],
]);

const getOwnKeys = (prototype: object): Array<string | symbol> => {
  const result = [...Object.getOwnPropertyNames(prototype), ...Object.getOwnPropertySymbols(prototype)];
  for (const method of extraMethods.get(prototype) ?? []) {
    result.push(method);
  }

  return result;
};

// Callers that need accessors too can collect both in the same prototype walk.
export default <T>(service: T, properties?: Array<string | symbol>): Array<string | symbol> => {
  const result: Array<string | symbol> = [];
  const seen = new Set<string | symbol>();
  const accessors = properties ? new Set(properties) : undefined;

  let prototype = service;
  while (prototype && !checkIsObjectPrototype(prototype)) {
    for (const method of getOwnKeys(prototype)) {
      if (method === 'constructor' || seen.has(method)) {
        continue;
      }

      seen.add(method);
      const descriptor = Object.getOwnPropertyDescriptor(prototype, method);
      const isGetterSetter = descriptor && (descriptor.get || descriptor.set);
      if (isGetterSetter) {
        if (properties && accessors && !accessors.has(method)) {
          accessors.add(method);
          properties.push(method);
        }
        continue;
      }
      result.push(method);
    }
    prototype = Object.getPrototypeOf(prototype);
  }

  return result;
};
