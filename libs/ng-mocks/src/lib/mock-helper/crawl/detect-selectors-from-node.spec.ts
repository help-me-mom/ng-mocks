import { Component, Input } from '@angular/core';

import detectSelectorsFromNode from './detect-selectors-from-node';

describe('detect-selectors-from-node', () => {
  describe('classic', () => {
    it('goes via public providers', () => {
      @Component({
        selector: 'target',
        template: 'target',
      })
      class TargetComponent {
        @Input() public attr = 'value';
      }

      const instance = new TargetComponent();
      const node: any = {
        injector: {
          elDef: {
            element: {
              publicProviders: {
                test: {
                  bindings: [{ name: 'attr' }],
                  nodeIndex: 0,
                  provider: {
                    value: TargetComponent,
                  },
                },
                testDuplicate: {
                  bindings: [{ name: 'attr' }],
                  nodeIndex: 0,
                  provider: {
                    value: TargetComponent,
                  },
                },
              },
            },
          },
          get: (def: any) =>
            def === TargetComponent ? instance : undefined,
          view: {
            nodes: [
              {
                instance,
              },
            ],
          },
        },
        providerTokens: [],
      };

      expect(detectSelectorsFromNode(node)).toEqual([[], ['attr']]);
    });
  });

  describe('ivy', () => {
    it('handles empty node', () => {
      const node: any = {
        injector: {},
        providerTokens: [],
      };
      expect(detectSelectorsFromNode(node)).toEqual([[], []]);
    });

    it('scans attributes', () => {
      const node: any = {
        injector: {
          _tNode: {
            attrs: ['1', '2', '3', '4', 3, '5', '6'],
          },
        },
        providerTokens: [],
      };
      expect(detectSelectorsFromNode(node)).toEqual([[], []]);
    });

    it('scans attributes and inputs', () => {
      const node: any = {
        injector: {
          _tNode: {
            attrs: ['1', '2', '3', '4', 3, '5', '6'],
            inputs: {
              1: true,
              3: true,
              5: true,
              6: true,
            },
          },
        },
        providerTokens: [],
      };
      expect(detectSelectorsFromNode(node)).toEqual([
        [],
        ['1', '3', '5', '6'],
      ]);
    });
  });
});
