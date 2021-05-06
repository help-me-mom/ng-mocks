// Extracts dependency among flags of parameters.

const detectForwardRed = (provide: any): any => {
  if (typeof provide === 'function' && provide.__forward_ref__) {
    return provide();
  }

  return provide;
};

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

  return detectForwardRed(provide);
};
