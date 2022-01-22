import { Component, Input } from '@angular/core';

import { MockedDebugNode } from '../../mock-render/types';

import crawlByAttributeValue from './crawl-by-attribute-value';

describe('crawl-by-attribute-value', () => {
  const attribute = 'attribute';
  const value = 'value';

  let callback: (node: MockedDebugNode) => boolean;
  beforeEach(
    () => (callback = crawlByAttributeValue(attribute, value)),
  );

  describe('classic', () => {
    it('finds via injector with classic elDef', () => {
      @Component({
        selector: 'target',
        template: 'target',
      })
      class TargetComponent {
        @Input() public [attribute]: string = value;
      }

      const instance = new TargetComponent();
      const node: any = {
        injector: {
          elDef: {
            element: {
              publicProviders: {
                test: {
                  bindings: [{ name: attribute }],
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
      };

      expect(callback(node)).toEqual(true);

      (instance as any)[attribute] = '';
      expect(callback(node)).toEqual(false);
    });

    it('finds via injector with classic elDef and alias', () => {
      @Component({
        selector: 'target',
        template: 'target',
      })
      class TargetComponent {
        @Input(attribute) public attr: string = value;
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
      };

      expect(callback(node)).toEqual(true);

      instance.attr = '';
      expect(callback(node)).toEqual(false);
    });

    it('does not find via injector with classic elDef', () => {
      @Component({
        selector: 'target',
        template: 'target',
      })
      class TargetComponent {
        @Input() public attr: string = value;
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
      };

      expect(callback(node)).toEqual(false);
    });
  });

  describe('ivy', () => {
    it('ignores empty nodes', () => {
      const node: any = {
        injector: {},
      };
      expect(callback(node)).toEqual(false);
    });

    it('scans attrs with empty inputs', () => {
      const node: any = {
        injector: {
          _tNode: {
            attrs: [attribute, value],
          },
        },
      };
      expect(callback(node)).toEqual(false);
    });

    it('scans attrs with proper step switch on inputs', () => {
      const node: any = {
        injector: {
          _lView: {
            5: {
              prop: value,
            },
          },
          _tNode: {
            attrs: ['1', '2', 3, attribute],
            inputs: {
              [attribute]: [5, 'prop'],
            },
          },
        },
      };
      expect(callback(node)).toEqual(true);
    });

    it('scans attrs with inputs but w/o values', () => {
      const node: any = {
        injector: {
          _tNode: {
            attrs: [attribute, value],
            inputs: {},
          },
        },
      };
      expect(callback(node)).toEqual(false);
    });

    it('scans attrs with inputs but w/ values w/o lView', () => {
      const node: any = {
        injector: {
          _tNode: {
            attrs: [attribute, value],
            inputs: {
              [attribute]: [5, 'prop'],
            },
          },
        },
      };
      expect(callback(node)).toEqual(false);
    });

    it('scans attrs with inputs but w/ values w/ lView', () => {
      const node: any = {
        injector: {
          _lView: {
            5: {
              prop: value,
            },
          },
          _tNode: {
            attrs: [attribute, value],
            inputs: {
              [attribute]: [5, 'prop'],
            },
          },
        },
      };
      expect(callback(node)).toEqual(true);
    });
  });
});
