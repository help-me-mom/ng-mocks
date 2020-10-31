export default <T>(service: T): string[] => {
  const result: string[] = [];
  let prototype = service;
  while (prototype && Object.getPrototypeOf(prototype) !== null) {
    for (const prop of Object.getOwnPropertyNames(prototype)) {
      if ((prop as any) === 'constructor') {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
      const isGetterSetter = descriptor && (descriptor.get || descriptor.set);
      if (!isGetterSetter || result.indexOf(prop) !== -1) {
        continue;
      }
      result.push(prop);
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  return result;
};
