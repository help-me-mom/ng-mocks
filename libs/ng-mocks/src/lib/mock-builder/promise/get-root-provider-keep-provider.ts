import collectDeclarations from '../../resolve/collect-declarations';

export default (parameter: any): undefined | any => {
  if (typeof parameter !== 'function') {
    return undefined;
  }

  const injectable = collectDeclarations(parameter).Injectable;
  if (injectable?.useFactory) {
    return {
      ...(injectable.deps === undefined ? {} : { deps: injectable.deps }),
      provide: parameter,
      useFactory: injectable.useFactory,
    };
  }

  return undefined;
};
