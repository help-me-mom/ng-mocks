export default (value: any): boolean => {
  if (typeof value !== 'function') {
    return false;
  }
  const proto = value.toString();
  // istanbul ignore next
  if (proto.match(/^\(/) !== null) {
    return true;
  }

  return proto.match(/^function\s*\(/) !== null;
};
