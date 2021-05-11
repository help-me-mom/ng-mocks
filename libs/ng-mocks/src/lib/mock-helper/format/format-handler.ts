import nestedCheckChildren from '../crawl/nested-check-children';

import handleArray from './handle-array';
import isDebugNode from './is-debug-node';
import isFixture from './is-fixture';
import { FORMAT_SET, FORMAT_SINGLE } from './types';

export default (handlePrimitives: any) =>
  (html: any, outer = false) => {
    const format = (value: Text | Comment | FORMAT_SINGLE | FORMAT_SET, innerOuter = false): any => {
      if (Array.isArray(value)) {
        return handleArray(format, value);
      }
      if (isFixture(value)) {
        return format(value.debugElement, outer);
      }
      const result = handlePrimitives(format, value, innerOuter);
      if (result !== undefined) {
        return result;
      }

      if (isDebugNode(value) && value.nativeNode.nodeName === '#comment') {
        return format(nestedCheckChildren(value), true);
      }

      return isDebugNode(value) ? format(value.nativeNode, innerOuter) : '';
    };

    return Array.isArray(html) ? html.map((item: any) => format(item, outer)) : format(html, outer);
  };
