export default (value: any, funcName: string) => {
  if (value === undefined || value === null) {
    throw new Error(`An empty parameter has been passed into ${funcName}. Please check that its import is correct.`);
  }
};
