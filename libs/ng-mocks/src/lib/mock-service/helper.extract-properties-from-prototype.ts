import checkIsObjectPrototype from './check.is-object-prototype';

export default <T>(service: T): Array<string | symbol> => {
  const result: Array<string | symbol> = [];
  const properties = new Set<string | symbol>();
  let prototype = service;
  while (prototype && !checkIsObjectPrototype(prototype)) {
    for (const prop of [...Object.getOwnPropertyNames(prototype), ...Object.getOwnPropertySymbols(prototype)]) {
      if (prop === 'constructor') {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
      const isGetterSetter = descriptor && (descriptor.get || descriptor.set);
      if (!isGetterSetter || properties.has(prop)) {
        continue;
      }
      properties.add(prop);
      result.push(prop);
    }
    prototype = Object.getPrototypeOf(prototype);
  }

  return result;
};
