// handles forwardRef on useExisting
export default (provide: any): any => {
  if (typeof provide === 'function' && provide.__forward_ref__) {
    return provide();
  }

  return provide;
};
