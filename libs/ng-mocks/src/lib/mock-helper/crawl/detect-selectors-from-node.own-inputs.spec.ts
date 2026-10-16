import { DebugElement } from '@angular/core';

import coreDefineProperty from '../../common/core.define-property';

import detectSelectorsFromNode from './detect-selectors-from-node';

describe('detect-selectors-from-node:own inputs', () => {
  for (const inputMap of ['inputs', 'hostDirectiveInputs']) {
    it(`ignores Object.prototype names in ${inputMap}`, () => {
      const node = new DebugElement(document.createElement('div'));
      coreDefineProperty(node, 'providerTokens', []);
      coreDefineProperty(node, 'injector', {
        _tNode: {
          attrs: [
            'constructor',
            'value',
            'toString',
            'value',
            'hasOwnProperty',
            'value',
            3,
            'exposed',
          ],
          [inputMap]: { exposed: [5, 'original'] },
        },
      });

      expect(detectSelectorsFromNode(node)).toEqual([
        [],
        ['exposed'],
      ]);
    });

    it(`does not read inherited input getters in ${inputMap}`, () => {
      let reads = 0;
      class InputMap {
        public readonly exposed = [5, 'original'];

        public get inherited(): number[] {
          reads += 1;

          return [5];
        }
      }
      const node = new DebugElement(document.createElement('div'));
      coreDefineProperty(node, 'providerTokens', []);
      coreDefineProperty(node, 'injector', {
        _tNode: {
          attrs: ['inherited', 'value', 3, 'exposed'],
          [inputMap]: new InputMap(),
        },
      });

      expect(detectSelectorsFromNode(node)).toEqual([
        [],
        ['exposed'],
      ]);
      expect(reads).toBe(0);
    });
  }
});
