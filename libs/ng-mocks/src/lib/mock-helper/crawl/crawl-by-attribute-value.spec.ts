import { MockedDebugNode } from '../../mock-render/types';

import crawlByAttributeValue from './crawl-by-attribute-value';

describe('crawl-by-attribute-value:ivy', () => {
  const attribute = 'attribute';
  const value = 'value';

  let callback: (node: MockedDebugNode) => boolean;
  beforeEach(
    () => (callback = crawlByAttributeValue(attribute, value)),
  );

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
