import { DirectiveIo } from '../../common/core.types';
import { MockedDebugNode } from '../../mock-render/types';
import funcParseProviderTokensDirectives from '../func.parse-provider-tokens-directives';

export default (node: MockedDebugNode, key: string): [Array<DirectiveIo>, string[], number] => {
  const config = (node.injector as any).elDef.element.publicProviders[key];
  const token = config.provider.value;
  if (!token) {
    return [[], [], 0];
  }
  const meta = funcParseProviderTokensDirectives(node, token);

  const requiredAttributes = config.bindings.map((binding: any) => binding.nonMinifiedName || binding.name);

  return [meta?.inputs || [], requiredAttributes, config.nodeIndex];
};
