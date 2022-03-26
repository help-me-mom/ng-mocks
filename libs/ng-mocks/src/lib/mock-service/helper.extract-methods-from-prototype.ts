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

const getOwnPropertyNames = (prototype: any): string[] => {
  const result: string[] = Object.getOwnPropertyNames(prototype);
  for (const method of extraMethods[funcGetName(prototype)] ?? []) {
    result.push(method);
  }

  return result;
};

export default <T>(service: T): string[] => {
  const result: string[] = [];

  let prototype = service;
  while (prototype && Object.getPrototypeOf(prototype) !== null) {
    for (const method of getOwnPropertyNames(prototype)) {
      if ((method as any) === 'constructor') {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(prototype, method);
      const isGetterSetter = descriptor && (descriptor.get || descriptor.set);
      if (isGetterSetter || result.indexOf(method) !== -1) {
        continue;
      }
      result.push(method);
    }
    prototype = Object.getPrototypeOf(prototype);
  }

  return result;
};
