import collectDeclarations from '../resolve/collect-declarations';

export default (def: any): any[] => {
  const declaration = collectDeclarations(def);

  return declaration.parameters ?? [];
};
