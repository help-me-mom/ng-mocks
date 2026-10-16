import { DebugElement } from '@angular/core';

import coreDefineProperty from '../../common/core.define-property';
import helperDefinePropertyDescriptor from '../../mock-service/helper.define-property-descriptor';

import crawlByAttributeValue from './crawl-by-attribute-value';

describe('crawl-by-attribute-value:own-inputs', () => {
  for (const table of ['inputs', 'hostDirectiveInputs']) {
    describe(table, () => {
      it('ignores inherited Object.prototype input names', () => {
        const node = new DebugElement(document.createElement('div'));
        coreDefineProperty(node, 'injector', {
          _tNode: {
            attrs: ['constructor', 'static'],
            directiveStart: 5,
            [table]: {},
          },
        });

        expect(
          crawlByAttributeValue('constructor', 'static')(node),
        ).toBe(false);
      });

      it('does not read inherited input getters', () => {
        let reads = 0;
        const prototype = {};
        helperDefinePropertyDescriptor(prototype, 'value', {
          get: () => {
            reads += 1;

            return [5, 'value'];
          },
        });
        const inputs: Record<
          string,
          Array<number | string>
        > = Object.create(prototype);
        const node = new DebugElement(document.createElement('div'));
        coreDefineProperty(node, 'injector', {
          _lView: { 5: { value: 'matched' } },
          _tNode: {
            attrs: [3, 'value'],
            directiveStart: 5,
            [table]: inputs,
          },
        });

        expect(crawlByAttributeValue('value', 'matched')(node)).toBe(
          false,
        );
        expect(reads).toBe(0);
      });

      it('preserves own input aliases that shadow Object.prototype', () => {
        const node = new DebugElement(document.createElement('div'));
        coreDefineProperty(node, 'injector', {
          _lView: { 5: { current: 'matched' } },
          _tNode: {
            attrs: [3, 'constructor'],
            directiveStart: 5,
            [table]: { constructor: [5, 'current'] },
          },
        });

        expect(
          crawlByAttributeValue('constructor', 'matched')(node),
        ).toBe(true);
        expect(
          crawlByAttributeValue('constructor', 'missing')(node),
        ).toBe(false);
      });

      it('ignores own undefined input entries', () => {
        const node = new DebugElement(document.createElement('div'));
        coreDefineProperty(node, 'injector', {
          _tNode: {
            attrs: [3, 'value'],
            directiveStart: 5,
            [table]: { value: undefined },
          },
        });

        expect(crawlByAttributeValue('value', undefined)(node)).toBe(
          false,
        );
      });
    });
  }
});
