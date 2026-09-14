export default (prototype: object): boolean => {
  if (prototype === Object.prototype) {
    return true;
  }
  if (Object.getPrototypeOf(prototype) !== null) {
    return false;
  }

  const constructor: unknown = Object.getOwnPropertyDescriptor(prototype, 'constructor')?.value;

  // Native Object.prototype can belong to another realm; user terminal prototypes still need inspection.
  return (
    typeof constructor === 'function' &&
    Object.getOwnPropertyDescriptor(constructor, 'prototype')?.value === prototype &&
    Function.prototype.toString.call(constructor) === Function.prototype.toString.call(Object)
  );
};
