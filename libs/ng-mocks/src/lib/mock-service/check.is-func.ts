const isAngularClass = (value: Record<keyof any, unknown>): boolean => {
  if (value.ɵprov) {
    return true;
  }
  if (value.__annotations__) {
    return true;
  }
  if (value.__parameters__) {
    return true;
  }
  if (value.parameters) {
    return true;
  }

  return false;
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const guessClass = (name: string, proto: string, value: any): boolean => {
  // unnamed classes can be class_N
  if (/^class_\d+$/.test(name)) {
    return true;
  }

  // let's consider an existing 'prototype' as a class
  if (Object.keys(value.prototype).length > 0) {
    return true;
  }

  // let's consider a capital name and 'this' usage as a class
  const clsCode = name.codePointAt(0);
  if (clsCode && clsCode >= 65 && clsCode <= 90 && /\bthis\./.test(proto)) {
    return true;
  }

  // webpack es5 class
  const regEx = new RegExp(`\\(this,\\s*${escapeRegExp(name)}\\)`);
  // istanbul ignore if
  if (regEx.test(proto)) {
    return true;
  }

  return false;
};

export default (value: any): boolean => {
  if (typeof value !== 'function') {
    return false;
  }
  if (isAngularClass(value)) {
    return false;
  }
  if (!value.prototype) {
    return true;
  }

  const proto = value.toString();

  // es2015 class
  // istanbul ignore if
  if (proto.match(/^class\b/) !== null) {
    return false;
  }

  const cls = proto.match(/^function\s+([^\s(]+)\(/);
  if (cls === null) {
    return true;
  }
  if (guessClass(cls[1], proto, value)) {
    return false;
  }

  return true;
};
