import funcGetName from '../common/func.get-name';

const sanitizerMethods = [
  'sanitize',
  'bypassSecurityTrustHtml',
  'bypassSecurityTrustStyle',
  'bypassSecurityTrustScript',
  'bypassSecurityTrustUrl',
  'bypassSecurityTrustResourceUrl',
];

const extraMethods: Record<string, undefined | string[]> = {
  DomSanitizer: sanitizerMethods,
  Sanitizer: sanitizerMethods,
};

const getOwnKeys = (prototype: object): Array<string | symbol> => {
  const result = [...Object.getOwnPropertyNames(prototype), ...Object.getOwnPropertySymbols(prototype)];
  for (const method of extraMethods[funcGetName(prototype)] ?? []) {
    result.push(method);
  }

  return result;
};

// Callers that need accessors too can collect both in the same prototype walk.
export default <T>(service: T, properties?: Array<string | symbol>): Array<string | symbol> => {
  const result: Array<string | symbol> = [];
  const methods = new Set<string | symbol>();
  const accessors = properties ? new Set(properties) : undefined;

  let prototype = service;
  while (prototype && Object.getPrototypeOf(prototype) !== null) {
    for (const method of getOwnKeys(prototype)) {
      if (method === 'constructor') {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(prototype, method);
      const isGetterSetter = descriptor && (descriptor.get || descriptor.set);
      if (isGetterSetter) {
        if (properties && accessors && !accessors.has(method)) {
          accessors.add(method);
          properties.push(method);
        }
        continue;
      }
      if (methods.has(method)) {
        continue;
      }
      methods.add(method);
      result.push(method);
    }
    prototype = Object.getPrototypeOf(prototype);
  }

  return result;
};
