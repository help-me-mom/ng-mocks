import { DebugElement, DebugNode } from '@angular/core';

import coreDefineProperty from '../../common/core.define-property';

import elDefGetParent from './el-def-get-parent';

describe('el-def-get-parent', () => {
  it('reads each embedded view once and selects the smallest root index', () => {
    const node = new DebugElement(document.createElement('span'));
    const parent = new DebugElement(document.createElement('div'));
    const first = new DebugNode(document.createComment('first'));
    const second = new DebugNode(document.createComment('second'));
    const firstDefinition = {};
    const secondDefinition = {};
    let firstReads = 0;
    let secondReads = 0;
    const firstView = {
      get rootNodes() {
        firstReads += 1;

        return [document.createTextNode('before'), node.nativeNode];
      },
    };
    const secondView = {
      get rootNodes() {
        secondReads += 1;

        return [node.nativeNode];
      },
    };
    coreDefineProperty(node, 'injector', { _tNode: {} });
    coreDefineProperty(node, 'parent', parent);
    coreDefineProperty(parent, 'childNodes', [first, node, second]);
    coreDefineProperty(first, 'injector', {
      _tNode: firstDefinition,
      get: () => ({
        length: 2,
        get: (index: number) => (index === 0 ? null : firstView),
      }),
    });
    coreDefineProperty(second, 'injector', {
      _tNode: secondDefinition,
      get: () => ({ length: 1, get: () => secondView }),
    });

    expect(elDefGetParent(node)).toBe(secondDefinition);
    expect(firstReads).toBe(1);
    expect(secondReads).toBe(1);
  });
});
