import detectTextNode from './detect-text-node';

export default (node: any) => {
  return detectTextNode(node)
    ? undefined
    : (undefined as any) ||
        node.injector._tNode || // ivy
        node.injector.elDef || // classic
        undefined;
};
