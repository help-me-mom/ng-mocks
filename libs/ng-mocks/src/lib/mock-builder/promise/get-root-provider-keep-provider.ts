import collectDeclarations from '../../resolve/collect-declarations';

export default (parameter: any): undefined | any => {
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

  return undefined;
};
