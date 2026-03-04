import { TemplateRef } from '@angular/core';

import { fallbackHide, fallbackRender } from './func.render-fallback';

const createInstance = ({
  isComponent = true,
  queryScanKeys = [],
  host,
  throwsOnGet = false,
}: {
  isComponent?: boolean;
  queryScanKeys?: any;
  host?: any;
  throwsOnGet?: boolean;
} = {}): any => ({
  __ngMocksConfig: {
    queryScanKeys,
  },
  __ngMocksCtor: {
    mockOf: isComponent ? { ɵcmp: {} } : {},
  },
  __ngMocksInjector: throwsOnGet
    ? {
        get: () => {
          throw new Error('missing element');
        },
      }
    : host
      ? {
          get: () => ({
            nativeElement: host,
          }),
        }
      : undefined,
});

const createTemplate = (
  nativeElement: object,
  rootNodes: any = [],
): {
  calls: Array<Record<keyof any, any>>;
  state: {
    detectChanges: number;
    destroy: number;
  };
  template: TemplateRef<any>;
} => {
  const calls: Array<Record<keyof any, any>> = [];
  const state = {
    destroy: 0,
    detectChanges: 0,
  };
  const view: any = {
    rootNodes,
    detectChanges: () => {
      state.detectChanges += 1;
    },
    destroy: () => {
      state.destroy += 1;
    },
  };

  return {
    calls,
    state,
    template: {
      elementRef: {
        nativeElement,
      },
      createEmbeddedView: (context: Record<keyof any, any>) => {
        calls.push(context);

        return view;
      },
    } as any,
  };
};

describe('func.render-fallback', () => {
  it('does not render when fallback cannot be used', () => {
    const { template } = createTemplate({});
    const host = {
      appendChild: () => undefined,
    };

    expect(fallbackRender({} as any, template, {})).toEqual(false);
    expect(
      fallbackRender(
        {
          __ngMocksCtor: null,
          __ngMocksConfig: null,
        } as any,
        template,
        {},
      ),
    ).toEqual(false);
    expect(
      fallbackRender(
        {
          __ngMocksCtor: {
            mockOf: {
              ɵcmp: {},
            },
          },
          __ngMocksConfig: null,
          __ngMocksInjector: {
            get: () => ({
              nativeElement: host,
            }),
          },
        } as any,
        template,
        {},
      ),
    ).toEqual(false);
    expect(
      fallbackRender(
        {
          __ngMocksCtor: {
            mockOf: {
              ɵcmp: {},
            },
          },
          __ngMocksInjector: {
            get: () => ({
              nativeElement: host,
            }),
          },
        } as any,
        template,
        {},
      ),
    ).toEqual(false);
    expect(
      fallbackRender(
        {
          __ngMocksCtor: {
            mockOf: {
              ɵcmp: {},
            },
          },
          __ngMocksConfig: {},
          __ngMocksInjector: {
            get: () => ({
              nativeElement: host,
            }),
          },
        } as any,
        template,
        {},
      ),
    ).toEqual(false);
    expect(
      fallbackRender(
        createInstance({
          isComponent: false,
          host,
        }),
        template,
        {},
      ),
    ).toEqual(false);
    expect(
      fallbackRender(
        createInstance({
          host,
          queryScanKeys: null,
        }),
        template,
        {},
      ),
    ).toEqual(false);
    expect(
      fallbackRender(
        createInstance({
          host,
          queryScanKeys: ['header'],
        }),
        template,
        {},
      ),
    ).toEqual(false);
    expect(
      fallbackHide(
        createInstance({
          isComponent: false,
        }),
      ),
    ).toEqual(false);
    expect(fallbackHide({} as any)).toEqual(false);
  });

  it('does not render when host cannot be found', () => {
    const { template } = createTemplate({});

    expect(
      fallbackRender(
        createInstance({
          queryScanKeys: [],
        }),
        template,
        {},
      ),
    ).toEqual(false);
    expect(
      fallbackRender(
        createInstance({
          queryScanKeys: [],
          throwsOnGet: true,
        }),
        template,
        {},
      ),
    ).toEqual(false);
  });

  it('renders into host and clears previous fallback view', () => {
    const host = {
      appended: [] as any[],
      removed: [] as any[],
      appendChild(node: any) {
        this.appended.push(node);
      },
      removeChild(node: any) {
        this.removed.push(node);
      },
    };
    const nodeWithParent: any = {
      parentNode: host,
    };
    const nodeWithoutParent: any = {};
    const nullNode: any = null;
    const first = createTemplate(
      {
        id: 'first',
      },
      [nodeWithParent, nodeWithoutParent, nullNode],
    );
    const second = createTemplate(
      {
        id: 'second',
      },
      [],
    );
    const instance = createInstance({
      host,
      queryScanKeys: [],
    });

    expect(
      fallbackRender(instance, first.template, {
        $implicit: 'first',
      }),
    ).toEqual(true);
    expect(first.state.detectChanges).toEqual(1);
    expect(first.calls).toEqual([
      {
        $implicit: 'first',
      },
    ]);
    expect(host.appended).toEqual([
      nodeWithParent,
      nodeWithoutParent,
      nullNode,
    ]);

    expect(
      fallbackRender(instance, second.template, {
        $implicit: 'second',
      }),
    ).toEqual(true);
    expect(first.state.destroy).toEqual(1);
    expect(host.removed).toEqual([nodeWithParent]);
    expect(second.state.detectChanges).toEqual(1);
    expect(second.calls).toEqual([
      {
        $implicit: 'second',
      },
    ]);
  });

  it('hides matching template and keeps unmatched one', () => {
    const host = {
      appendChild: () => undefined,
      removeChild: () => undefined,
    };
    const rendered = createTemplate({
      id: 'rendered',
    });
    const unmatched = createTemplate({
      id: 'unmatched',
    });
    const instance = createInstance({
      host,
      queryScanKeys: [],
    });

    expect(fallbackRender(instance, rendered.template, {})).toEqual(
      true,
    );
    expect(fallbackHide(instance, unmatched.template)).toEqual(false);
    expect(fallbackHide(instance, rendered.template)).toEqual(true);
    expect(fallbackHide(instance, rendered.template)).toEqual(false);
    expect(instance.__ngMocksRenderFallbackViews).toEqual([]);
  });

  it('clears all views on hide without template', () => {
    const host = {
      appendChild: () => undefined,
      removeChild: () => undefined,
    };
    const template = createTemplate({
      id: 'rendered',
    });
    const instance = createInstance({
      host,
      queryScanKeys: [],
    });

    expect(fallbackHide(instance, template.template)).toEqual(false);
    expect(fallbackRender(instance, template.template, {})).toEqual(
      true,
    );
    expect(fallbackHide(instance)).toEqual(true);
  });

  it('supports views without root nodes', () => {
    const host = {
      appendChild: () => undefined,
      removeChild: () => undefined,
    };
    const template = createTemplate(
      {
        id: 'without-root-nodes',
      },
      null,
    );
    const instance = createInstance({
      host,
      queryScanKeys: [],
    });

    expect(fallbackRender(instance, template.template, {})).toEqual(
      true,
    );
    expect(fallbackHide(instance)).toEqual(true);
  });
});
