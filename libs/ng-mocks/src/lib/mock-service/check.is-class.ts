import checkIsFunc from './check.is-func';

export default (value: any): boolean => {
  if (typeof value !== 'function') {
    return false;
  }
  if (checkIsFunc(value)) {
    return false;
  }
  const proto = value.toString();
  // istanbul ignore next
  if (proto.match(/^class\b/) !== null) {
    return true;
  }

  return proto.match(/^function\s*\(/) === null;
};
