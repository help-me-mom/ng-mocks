import { Component, Directive, Input, signal } from '@angular/core';

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
        standalone: false,
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

      node.injector.elDef.element.publicProviders.test.parent =
        node.injector.elDef;

      expect(callback(node)).toEqual(true);

      (instance as any)[attribute] = '';
      expect(callback(node)).toEqual(false);
    });

    it('finds via injector with classic elDef and alias', () => {
      @Component({
        selector: 'target',
        standalone: false,
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

      node.injector.elDef.element.publicProviders.test.parent =
        node.injector.elDef;

      expect(callback(node)).toEqual(true);

      instance.attr = '';
      expect(callback(node)).toEqual(false);
    });

    it('does not find via injector with classic elDef', () => {
      @Component({
        selector: 'target',
        standalone: false,
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

      node.injector.elDef.element.publicProviders.test.parent =
        node.injector.elDef;

      expect(callback(node)).toEqual(false);
    });
  });

  describe('ivy', () => {
    for (const reversed of [false, true]) {
      it(`matches each shared input alias in ${reversed ? 'reversed' : 'original'} directive order`, () => {
        @Directive({ selector: '[first]', standalone: false })
        class FirstDirective {
          @Input(attribute) public firstValue = 'first';
        }

        @Directive({ selector: '[second]', standalone: false })
        class SecondDirective {
          @Input(attribute) public secondValue = 'second';
        }

        const first = new FirstDirective();
        const second = new SecondDirective();
        const instances = new Map<unknown, unknown>([
          [FirstDirective, first],
          [SecondDirective, second],
        ]);
        // Include provider lookup so the test cannot pass via the raw lView fallback.
        const node = {
          nativeNode: { nodeName: '#comment' },
          providerTokens: reversed
            ? [SecondDirective, FirstDirective]
            : [FirstDirective, SecondDirective],
          injector: {
            get: (token: unknown) => instances.get(token),
            _lView: { 5: first, 6: second },
            _tNode: {
              attrs: [3, attribute],
              inputs: {
                [attribute]: reversed
                  ? [6, 'secondValue', 5, 'firstValue']
                  : [5, 'firstValue', 6, 'secondValue'],
              },
            },
          },
        } as unknown as MockedDebugNode;

        expect(crawlByAttributeValue(attribute, 'first')(node)).toBe(
          true,
        );
        expect(crawlByAttributeValue(attribute, 'second')(node)).toBe(
          true,
        );
        expect(
          crawlByAttributeValue(attribute, 'missing')(node),
        ).toBe(false);

        first.firstValue = 'updated';

        expect(crawlByAttributeValue(attribute, 'first')(node)).toBe(
          false,
        );
        expect(
          crawlByAttributeValue(attribute, 'updated')(node),
        ).toBe(true);
        expect(crawlByAttributeValue(attribute, 'second')(node)).toBe(
          true,
        );
      });
    }

    it('unwraps only marked callable signal inputs and reads their current values', () => {
      @Directive({ selector: '[signalInputs]', standalone: false })
      class SignalDirective {
        // Compiler-equivalent metadata keeps this unit independent of signal input compilation.
        @Input({ alias: 'current', isSignal: true } as never)
        public readonly state = signal('initial');

        @Input('callable') public readonly callback = jasmine
          .createSpy('callable')
          .and.returnValue('called');

        @Input({ alias: 'nonCallable', isSignal: true } as never)
        public missing: unknown = null;
      }

      const instance = new SignalDirective();
      const state = instance.state;
      const node = {
        nativeNode: { nodeName: '#comment' },
        providerTokens: [SignalDirective],
        injector: {
          get: (token: unknown) =>
            token === SignalDirective ? instance : undefined,
          _lView: { 5: instance },
          _tNode: {
            attrs: [3, 'current', 'callable', 'nonCallable'],
            inputs: {
              current: [5, 'state'],
              callable: [5, 'callback'],
              nonCallable: [5, 'missing'],
            },
          },
        },
      } as unknown as MockedDebugNode;

      expect(crawlByAttributeValue('current', 'initial')(node)).toBe(
        true,
      );
      expect(crawlByAttributeValue('current', state)(node)).toBe(
        false,
      );
      expect(
        crawlByAttributeValue('callable', instance.callback)(node),
      ).toBe(true);
      expect(crawlByAttributeValue('callable', 'called')(node)).toBe(
        false,
      );
      expect(instance.callback).not.toHaveBeenCalled();
      expect(crawlByAttributeValue('nonCallable', null)(node)).toBe(
        true,
      );

      state.set('updated');
      instance.missing = undefined;

      expect(instance.state).toBe(state);
      expect(crawlByAttributeValue('current', 'updated')(node)).toBe(
        true,
      );
      expect(crawlByAttributeValue('current', 'initial')(node)).toBe(
        false,
      );
      expect(
        crawlByAttributeValue('nonCallable', undefined)(node),
      ).toBe(true);
      expect(crawlByAttributeValue('nonCallable', null)(node)).toBe(
        false,
      );
      expect(instance.callback).not.toHaveBeenCalled();
    });

    it('does not interpret input flags as directive indices', () => {
      @Directive({ selector: '[flaggedInput]', standalone: false })
      class TargetDirective {
        @Input(attribute) public current = value;
      }

      const instance = new TargetDirective();
      for (const flags of [0, 1, 2]) {
        const node = {
          nativeNode: { nodeName: '#comment' },
          providerTokens: [TargetDirective],
          injector: {
            get: (token: unknown) =>
              token === TargetDirective ? instance : undefined,
            _lView: {
              0: { nodeName: '#comment' },
              1: {},
              2: 0,
              5: instance,
            },
            _tNode: {
              attrs: [3, attribute],
              directiveStart: 5,
              inputs: { [attribute]: [5, 'current', flags] },
            },
          },
        } as unknown as MockedDebugNode;

        expect(crawlByAttributeValue(attribute, value)(node)).toBe(
          true,
        );
        expect(
          crawlByAttributeValue(attribute, undefined)(node),
        ).toBe(false);
      }
    });

    it('matches unchanged host aliases alongside ordinary inputs and on their own', () => {
      @Directive({ selector: '[hostInput]', standalone: false })
      class HostDirective {
        @Input(attribute) public hostValue = 'host';
      }

      @Directive({ selector: '[ordinaryInput]', standalone: false })
      class OrdinaryDirective {
        @Input(attribute) public ordinaryValue = 'ordinary';
      }

      const host = new HostDirective();
      const ordinary = new OrdinaryDirective();
      const instances = new Map<unknown, unknown>([
        [HostDirective, host],
        [OrdinaryDirective, ordinary],
      ]);
      for (const hostOnly of [false, true]) {
        const node = {
          nativeNode: { nodeName: '#comment' },
          providerTokens: hostOnly
            ? [HostDirective]
            : [HostDirective, OrdinaryDirective],
          injector: {
            get: (token: unknown) => instances.get(token),
            _lView: hostOnly ? { 5: host } : { 5: host, 6: ordinary },
            _tNode: {
              attrs: [3, attribute],
              directiveStart: 5,
              inputs: hostOnly ? null : { [attribute]: [6] },
              hostDirectiveInputs: { [attribute]: [5, attribute] },
            },
          },
        } as unknown as MockedDebugNode;

        expect(crawlByAttributeValue(attribute, 'host')(node)).toBe(
          true,
        );
        expect(
          crawlByAttributeValue(attribute, 'ordinary')(node),
        ).toBe(!hostOnly);
        expect(
          crawlByAttributeValue(attribute, 'missing')(node),
        ).toBe(false);
        expect(
          crawlByAttributeValue(attribute, undefined)(node),
        ).toBe(false);
      }
    });

    it('uses the original host input alias instead of an unrelated exposed-name property', () => {
      @Directive({
        selector: '[aliasedHostInput]',
        standalone: false,
      })
      class HostDirective {
        @Input('original') public backingField: string | undefined =
          'value';
        public readonly exposed = 'decoy';
      }

      const instance = new HostDirective();
      const node = {
        nativeNode: { nodeName: '#comment' },
        providerTokens: [HostDirective],
        injector: {
          get: (token: unknown) =>
            token === HostDirective ? instance : undefined,
          _lView: { 5: instance },
          _tNode: {
            attrs: [3, 'exposed'],
            directiveStart: 5,
            hostDirectiveInputs: { exposed: [5, 'original'] },
          },
        },
      } as unknown as MockedDebugNode;

      expect(crawlByAttributeValue('exposed', 'value')(node)).toBe(
        true,
      );
      expect(crawlByAttributeValue('exposed', 'decoy')(node)).toBe(
        false,
      );
      expect(crawlByAttributeValue('exposed', 'missing')(node)).toBe(
        false,
      );
      expect(crawlByAttributeValue('exposed', undefined)(node)).toBe(
        false,
      );

      instance.backingField = 'updated';

      expect(crawlByAttributeValue('exposed', 'updated')(node)).toBe(
        true,
      );
      expect(crawlByAttributeValue('exposed', 'value')(node)).toBe(
        false,
      );

      instance.backingField = undefined;

      expect(crawlByAttributeValue('exposed', undefined)(node)).toBe(
        true,
      );
      expect(crawlByAttributeValue('exposed', 'updated')(node)).toBe(
        false,
      );
      expect(crawlByAttributeValue('exposed', 'decoy')(node)).toBe(
        false,
      );
    });

    it('resolves remapped host private names alongside ordinary owners in older input tuples', () => {
      @Directive({ selector: '[remappedHost]', standalone: false })
      class HostDirective {
        @Input('backingField') public collision = 'collision';
        @Input('original') public backingField: string | undefined =
          'host';
        public readonly exposed = 'decoy';
      }

      @Directive({ selector: '[ordinaryOwner]', standalone: false })
      class OrdinaryDirective {
        @Input('exposed') public ordinaryValue = 'ordinary';
      }

      // Angular 15 stores private-name pairs; Angular 17 adds input flags to each tuple.
      for (const withFlags of [false, true]) {
        const host = new HostDirective();
        const ordinary = new OrdinaryDirective();
        const instances = new Map<unknown, unknown>([
          [HostDirective, host],
          [OrdinaryDirective, ordinary],
        ]);
        const inputs = withFlags
          ? [5, 'backingField', 0, 6, 'ordinaryValue', 0]
          : [5, 'backingField', 6, 'ordinaryValue'];
        const node = {
          nativeNode: { nodeName: '#comment' },
          providerTokens: [HostDirective, OrdinaryDirective],
          injector: {
            get: (token: unknown) => instances.get(token),
            _lView: {
              0: { nodeName: '#comment' },
              1: {},
              2: 0,
              5: host,
              6: ordinary,
            },
            _tNode: {
              attrs: [3, 'exposed'],
              directiveStart: 5,
              inputs: { exposed: inputs },
            },
          },
        } as unknown as MockedDebugNode;

        expect(crawlByAttributeValue('exposed', 'host')(node)).toBe(
          true,
        );
        expect(
          crawlByAttributeValue('exposed', 'ordinary')(node),
        ).toBe(true);
        expect(crawlByAttributeValue('exposed', 'decoy')(node)).toBe(
          false,
        );
        expect(
          crawlByAttributeValue('exposed', 'collision')(node),
        ).toBe(false);
        expect(
          crawlByAttributeValue('exposed', 'missing')(node),
        ).toBe(false);
        expect(
          crawlByAttributeValue('exposed', undefined)(node),
        ).toBe(false);
        expect(
          crawlByAttributeValue('missing', undefined)(node),
        ).toBe(false);

        host.backingField = 'updated';

        expect(
          crawlByAttributeValue('exposed', 'updated')(node),
        ).toBe(true);
        expect(crawlByAttributeValue('exposed', 'host')(node)).toBe(
          false,
        );
        expect(
          crawlByAttributeValue('exposed', 'ordinary')(node),
        ).toBe(true);

        host.backingField = undefined;

        expect(
          crawlByAttributeValue('exposed', undefined)(node),
        ).toBe(true);
        expect(
          crawlByAttributeValue('exposed', 'updated')(node),
        ).toBe(false);
        expect(crawlByAttributeValue('exposed', 'decoy')(node)).toBe(
          false,
        );
        expect(inputs).toEqual(
          withFlags
            ? [5, 'backingField', 0, 6, 'ordinaryValue', 0]
            : [5, 'backingField', 6, 'ordinaryValue'],
        );
      }
    });

    it('unwraps remapped signal inputs identified by private names in older flagged tuples', () => {
      @Directive({ selector: '[remappedSignal]', standalone: false })
      class HostDirective {
        // Compiler-equivalent metadata keeps this unit independent of signal input compilation.
        @Input({ alias: 'original', isSignal: true } as never)
        public readonly backingField = signal<string | undefined>(
          'initial',
        );
        public readonly exposed = 'decoy';
      }

      const instance = new HostDirective();
      const state = instance.backingField;
      const node = {
        nativeNode: { nodeName: '#comment' },
        providerTokens: [HostDirective],
        injector: {
          get: (token: unknown) =>
            token === HostDirective ? instance : undefined,
          _lView: {
            0: { nodeName: '#comment' },
            1: {},
            2: 0,
            5: instance,
          },
          _tNode: {
            attrs: [3, 'exposed'],
            directiveStart: 5,
            inputs: { exposed: [5, 'backingField', 1] },
          },
        },
      } as unknown as MockedDebugNode;

      expect(crawlByAttributeValue('exposed', 'initial')(node)).toBe(
        true,
      );
      expect(crawlByAttributeValue('exposed', state)(node)).toBe(
        false,
      );
      expect(crawlByAttributeValue('exposed', 'decoy')(node)).toBe(
        false,
      );
      expect(crawlByAttributeValue('exposed', undefined)(node)).toBe(
        false,
      );

      state.set('updated');

      expect(instance.backingField).toBe(state);
      expect(crawlByAttributeValue('exposed', 'updated')(node)).toBe(
        true,
      );
      expect(crawlByAttributeValue('exposed', 'initial')(node)).toBe(
        false,
      );

      state.set(undefined);

      expect(crawlByAttributeValue('exposed', undefined)(node)).toBe(
        true,
      );
      expect(crawlByAttributeValue('exposed', 'updated')(node)).toBe(
        false,
      );
      expect(crawlByAttributeValue('exposed', 'decoy')(node)).toBe(
        false,
      );
    });

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
              [attribute]: value,
            },
          },
          _tNode: {
            attrs: ['1', '2', 3, attribute],
            inputs: {
              [attribute]: [5, attribute],
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
              [attribute]: value,
            },
          },
          _tNode: {
            attrs: [attribute, value],
            inputs: {
              [attribute]: [5, attribute],
            },
          },
        },
      };
      expect(callback(node)).toEqual(true);
    });
  });
});
