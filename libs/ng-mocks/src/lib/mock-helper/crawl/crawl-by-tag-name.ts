import { MockedDebugNode } from '../../mock-render/types';

import detectSelectorsFromNode from './detect-selectors-from-node';
import detectTagNameInSelectors from './detect-tag-name-in-selectors';

export default (attribute: string): ((node: MockedDebugNode) => boolean) =>
  node => {
    const [selectors] = detectSelectorsFromNode(node);

    return detectTagNameInSelectors(selectors, attribute);
  };
