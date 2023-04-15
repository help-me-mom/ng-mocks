import { Component, EventEmitter, Output } from '@angular/core';

import collectDeclarations from './collect-declarations';

describe('collect-declarations', () => {
  describe('classic', () => {
    it('skips unknown annotations', () => {
      const actual = collectDeclarations({
        __annotations__: [
          undefined,
          {},
          { ngMetadataName: 'unknown' },
        ],
      });

      expect(actual).toBeDefined();
    });

    it('skips unknown propMetadata', () => {
      const actual = collectDeclarations({
        __prop__metadata__: {
          prop: [undefined, {}, { ngMetadataName: 'unknown' }],
        },
      });

      expect(actual).toBeDefined();
    });

    it('skips input duplicates', () => {
      const actual = collectDeclarations({
        __prop__metadata__: {
          prop: [
            { ngMetadataName: 'Input' },
            { ngMetadataName: 'Input' },
          ],
        },
      });

      expect(actual.inputs).toEqual(['prop']);
    });

    it('skips output duplicates', () => {
      const actual = collectDeclarations({
        __prop__metadata__: {
          prop: [
            { ngMetadataName: 'Output' },
            { ngMetadataName: 'Output' },
          ],
        },
      });

      expect(actual.outputs).toEqual(['prop']);
    });

    it('skips content query duplicates', () => {
      const actual = collectDeclarations({
        __prop__metadata__: {
          prop: [
            { selector: 'prop', ngMetadataName: 'ContentChild' },
            { selector: 'prop1', ngMetadataName: 'ContentChild' },
          ],
          props: [
            { selector: 'prop', ngMetadataName: 'ContentChildren' },
            { selector: 'prop1', ngMetadataName: 'ContentChildren' },
          ],
        },
      });

      expect(actual.queries).toEqual({
        prop: {
          isViewQuery: false,
          ngMetadataName: 'ContentChild',
          selector: 'prop',
        },
        props: {
          isViewQuery: false,
          ngMetadataName: 'ContentChildren',
          selector: 'prop',
        },
      });
    });

    it('skips view query duplicates', () => {
      const actual = collectDeclarations({
        __prop__metadata__: {
          prop: [
            { selector: 'prop', ngMetadataName: 'ViewChild' },
            { selector: 'prop1', ngMetadataName: 'ViewChild' },
          ],
          props: [
            { selector: 'prop', ngMetadataName: 'ViewChildren' },
            { selector: 'prop1', ngMetadataName: 'ViewChildren' },
          ],
        },
      });

      expect(actual.queries).toEqual({
        prop: {
          isViewQuery: true,
          ngMetadataName: 'ViewChild',
          selector: 'prop',
        },
        props: {
          isViewQuery: true,
          ngMetadataName: 'ViewChildren',
          selector: 'prop',
        },
      });
    });

    it('handles host bindings without args and with duplicates', () => {
      const actual = collectDeclarations({
        __prop__metadata__: {
          prop: [
            { args: 'arg1', ngMetadataName: 'HostBinding' },
            { args: 'arg2', ngMetadataName: 'HostBinding' },
          ],
        },
      });

      expect(actual.hostBindings).toEqual([
        ['prop', 'prop', 'arg1'],
        ['prop', 'prop', 'arg2'],
      ]);
    });

    it('handles host listeners without args and with duplicates', () => {
      const actual = collectDeclarations({
        __prop__metadata__: {
          prop: [
            { ngMetadataName: 'HostListener' },
            { ngMetadataName: 'HostListener' },
          ],
        },
      });

      expect(actual.hostListeners).toEqual([
        ['prop', 'prop'],
        ['prop', 'prop'],
      ]);
    });
  });

  describe('ivy', () => {
    it('skips unknown decorators', () => {
      const actual = collectDeclarations({
        decorators: [
          undefined,
          {},
          { type: {} },
          { type: { prototype: {} } },
          { type: { prototype: { ngMetadataName: 'unknown' } } },
        ],
      });

      expect(actual).toBeDefined();
    });

    it('skips unknown propDecorators', () => {
      const actual = collectDeclarations({
        propDecorators: {
          prop: [
            undefined,
            {},
            { type: {} },
            { type: { prototype: {} } },
            { type: { prototype: { ngMetadataName: 'unknown' } } },
          ],
        },
      });

      expect(actual).toBeDefined();
    });

    it('skips input duplicates', () => {
      const actual = collectDeclarations({
        propDecorators: {
          prop: [
            {
              args: [{ alias: 'alias', required: true }],
              type: { prototype: { ngMetadataName: 'Input' } },
            },
            {
              args: [{ alias: 'alias', required: true }],
              type: { prototype: { ngMetadataName: 'Input' } },
            },
          ],
        },
      });

      expect(actual.inputs).toEqual([
        {
          name: 'prop',
          alias: 'alias',
          required: true,
        },
      ]);
    });

    it('skips output duplicates', () => {
      const actual = collectDeclarations({
        propDecorators: {
          prop: [
            {
              args: [],
              type: { prototype: { ngMetadataName: 'Output' } },
            },
            {
              args: [],
              type: { prototype: { ngMetadataName: 'Output' } },
            },
          ],
        },
      });

      expect(actual.outputs).toEqual(['prop']);
    });

    it('handles queries without args', () => {
      const actual = collectDeclarations({
        propDecorators: {
          prop1: [
            {
              args: ['content'],
              type: { prototype: { ngMetadataName: 'ContentChild' } },
            },
            {
              args: ['content2'],
              type: { prototype: { ngMetadataName: 'ContentChild' } },
            },
          ],
          prop2: [
            {
              args: ['view'],
              type: { prototype: { ngMetadataName: 'ViewChild' } },
            },
            {
              args: ['view2'],
              type: { prototype: { ngMetadataName: 'ViewChild' } },
            },
          ],
        },
      });

      expect(actual.queries).toEqual({
        prop1: {
          isViewQuery: false,
          ngMetadataName: 'ContentChild',
          selector: 'content',
        },
        prop2: {
          isViewQuery: true,
          ngMetadataName: 'ViewChild',
          selector: 'view',
        },
      });
    });

    it('handles host bindings without args and with duplicates', () => {
      const actual = collectDeclarations({
        propDecorators: {
          prop: [
            {
              type: { prototype: { ngMetadataName: 'HostBinding' } },
            },
            {
              type: { prototype: { ngMetadataName: 'HostBinding' } },
            },
          ],
        },
      });

      expect(actual.hostBindings).toEqual([['prop'], ['prop']]);
    });

    it('handles host listeners without args and with duplicates', () => {
      const actual = collectDeclarations({
        propDecorators: {
          prop: [
            {
              type: { prototype: { ngMetadataName: 'HostListener' } },
            },
            {
              type: { prototype: { ngMetadataName: 'HostListener' } },
            },
          ],
        },
      });

      expect(actual.hostListeners).toEqual([['prop'], ['prop']]);
    });
  });

  it('skips declaration duplicates', () => {
    @Component({
      // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
      outputs: ['output'],
      selector: 'target',
      template: 'target',
    })
    class TargetComponent {
      @Output() public output = new EventEmitter<void>();
    }

    const actual = collectDeclarations(TargetComponent);
    expect(actual.outputs).toEqual(['output']);
  });
});
