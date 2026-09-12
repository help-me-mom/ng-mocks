import collectDeclarations from '../../resolve/collect-declarations';

export default (parameter: unknown) => {
  if (typeof parameter !== 'function') {
    return undefined;
  }

  const declarations = collectDeclarations(parameter);
  const injectable = declarations.Injectable ?? declarations.Service;
  const useFactory = injectable?.useFactory ?? injectable?.factory;
  if (useFactory) {
    return {
      ...(injectable.deps === undefined ? {} : { deps: injectable.deps }),
      provide: parameter,
      useFactory,
    };
  }

  if (injectable?.useClass) {
    return {
      ...(injectable.deps === undefined ? {} : { deps: injectable.deps }),
      provide: parameter,
      useClass: injectable.useClass,
    };
  }

  if (injectable && 'useValue' in injectable) {
    return {
      provide: parameter,
      useValue: injectable.useValue,
    };
  }

  if (injectable?.useExisting) {
    return {
      provide: parameter,
      useExisting: injectable.useExisting,
    };
  }

  return undefined;
};
