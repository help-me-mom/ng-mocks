import funcExtractForwardRef from '../../common/func.extract-forward-ref';

// Extracts dependency among flags of parameters.
export default (decorators?: any[]): any => {
  if (!decorators) {
    return;
  }

  let provide: any;
  for (const decorator of decorators) {
    if (decorator && typeof decorator === 'object' && decorator.token) {
      provide = decorator.token;
    }
    if (!provide && decorator && (typeof decorator !== 'object' || !decorator.ngMetadataName)) {
      provide = decorator;
    }
  }

  return funcExtractForwardRef(provide);
};
