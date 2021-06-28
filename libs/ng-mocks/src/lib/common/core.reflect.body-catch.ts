export default (callback: any) => (def: any) => {
  // istanbul ignore if
  if (!def) {
    throw new Error(
      'An undefined declaration / provider has been passed into a mock function. Please check that its import is correct.',
    );
  }

  try {
    return callback(def);
  } catch (e) {
    // istanbul ignore next
    throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
  }
};
