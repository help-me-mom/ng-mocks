import { DebugElement } from '@angular/core';

import coreDefineProperty from '../../common/core.define-property';
import helperDefinePropertyDescriptor from '../../mock-service/helper.define-property-descriptor';

import crawlById from './crawl-by-id';

describe('crawl-by-id', () => {
  it('ignores names inherited from Object.prototype', () => {
    const node = new DebugElement(document.createElement('div'));
    coreDefineProperty(node, 'references', {});

    for (const id of ['constructor', 'toString', 'hasOwnProperty']) {
      expect(crawlById(id)(node)).toBe(false);
    }
  });

  it('does not read inherited reference getters', () => {
    let reads = 0;
    const prototype = {};
    helperDefinePropertyDescriptor(prototype, 'inherited', {
      get: () => {
        reads += 1;

        return {};
      },
    });
    const node = new DebugElement(document.createElement('div'));
    coreDefineProperty(node, 'references', Object.create(prototype));

    expect(crawlById('inherited')(node)).toBe(false);
    expect(reads).toBe(0);
  });

  it('preserves own references and their truthiness', () => {
    const node = new DebugElement(document.createElement('div'));
    coreDefineProperty(node, 'references', {
      constructor: {},
      empty: undefined,
      toString: {},
    });

    expect(crawlById('constructor')(node)).toBe(true);
    expect(crawlById('toString')(node)).toBe(true);
    expect(crawlById('empty')(node)).toBe(false);
    expect(crawlById('missing')(node)).toBe(false);
  });
});
