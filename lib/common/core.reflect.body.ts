export default (callback: any) => (def: any) => {
  try {
    return callback(def);
  } catch (e) {
    // istanbul ignore next
    throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
  }
};
