export default (def: any): void => {
  if (!def) {
    throw new Error(
      [
        'undefined / null has been passed into ng-mocks as a declaration / provider.',
        'Please ensure that the current test file has correct imports:',
        'imported files exist and imported declarations have been exported in the file.',
      ].join(' '),
    );
  }
};
