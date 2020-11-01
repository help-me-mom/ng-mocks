export default <T>(service: T): string[] => {
  const result: string[] = [];
  let prototype = service;
  while (prototype && Object.getPrototypeOf(prototype) !== null) {
    for (const method of Object.getOwnPropertyNames(prototype)) {
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
