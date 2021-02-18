import { MockedDebugNode } from '../../mock-render/types';

import detectAttributeInSelectors from './detect-attribute-in-selectors';
import detectSelectorsFromNode from './detect-selectors-from-node';

export default (attribute: string): ((node: MockedDebugNode) => boolean) => node => {
  const [selectors, attributes] = detectSelectorsFromNode(node);

  if (attributes.indexOf(attribute) !== -1) {
    return true;
  }

  if (detectAttributeInSelectors(selectors, attribute)) {
    return true;
  }

  return false;
};
