import errorEmptyDef from './error.empty-def';
import errorJestMock from './error.jest-mock';
import errorMissingDecorators from './error.missing-decorators';

export default (callback: any) => (def: any) => {
  errorEmptyDef(def);

  try {
    return callback(def);
  } catch {
    errorJestMock(def);
    errorMissingDecorators(def);
  }
};
