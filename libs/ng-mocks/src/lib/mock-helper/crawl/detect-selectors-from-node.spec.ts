import { Component, DebugElement, Input } from '@angular/core';

import coreDefineProperty from '../../common/core.define-property';

import detectSelectorsFromNode from './detect-selectors-from-node';

describe('detect-selectors-from-node', () => {
  describe('classic', () => {
    it('goes via public providers', () => {
      @Component({
        selector: 'target',
        standalone: false,
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

      node.injector.elDef.element.publicProviders.test.parent =
        node.injector.elDef;
      node.injector.elDef.element.publicProviders.testDuplicate.parent =
        node.injector.elDef;

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

    it('finds exposed host inputs without an ordinary input map', () => {
      const node = new DebugElement(document.createElement('div'));
      coreDefineProperty(node, 'providerTokens', []);
      coreDefineProperty(node, 'injector', {
        _tNode: {
          attrs: [3, 'exposed'],
          hostDirectiveInputs: { exposed: [5, 'original'] },
          inputs: null,
        },
      });

      expect(detectSelectorsFromNode(node)).toEqual([
        [],
        ['exposed'],
      ]);
    });

    it('deduplicates ordinary and exposed host inputs in binding order', () => {
      const node = new DebugElement(document.createElement('div'));
      coreDefineProperty(node, 'providerTokens', []);
      coreDefineProperty(node, 'injector', {
        _tNode: {
          attrs: [
            'ordinary',
            'value',
            3,
            'shared',
            'exposed',
            'shared',
          ],
          hostDirectiveInputs: {
            exposed: [5, 'original'],
            shared: [5, 'shared'],
          },
          inputs: { ordinary: [6], shared: [6] },
        },
      });

      expect(detectSelectorsFromNode(node)).toEqual([
        [],
        ['ordinary', 'shared', 'exposed'],
      ]);
    });

    it('requires a host input binding on the current node', () => {
      const node = new DebugElement(document.createElement('div'));
      coreDefineProperty(node, 'providerTokens', []);
      coreDefineProperty(node, 'injector', {
        _tNode: {
          attrs: [3, 'ordinary'],
          hostDirectiveInputs: { exposed: [5, 'original'] },
          inputs: { ordinary: [6] },
        },
      });

      expect(detectSelectorsFromNode(node)).toEqual([
        [],
        ['ordinary'],
      ]);
    });
  });
});
