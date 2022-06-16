import { DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Type } from '../common/core.types';
import funcGetName from '../common/func.get-name';
import { getSourceOfMock } from '../common/func.get-source-of-mock';
import { MockedDebugElement } from '../mock-render/types';

import nestedCheckParent from './crawl/nested-check-parent';
import mockHelperFind from './find/mock-helper.find';
import funcGetFromNode from './func.get-from-node';
import funcGetLastFixture from './func.get-last-fixture';
import funcParseFindArgsName from './func.parse-find-args-name';

const defaultNotFoundValue = {}; // simulating Symbol

const parseArgs = <T>(
  args: any[],
): {
  el: MockedDebugElement | null | undefined;
  notFoundValue: any;
  sel: Type<T>;
} => ({
  el: args[0],
  notFoundValue: args.length === 3 ? args[2] : defaultNotFoundValue,
  sel: args[1],
});

export default <T>(...args: any[]) => {
  if (args.length === 1) {
    try {
      return TestBed.inject ? TestBed.inject(args[0]) : /* istanbul ignore next */ TestBed.get(args[0]);
    } catch {
      throw new Error(`Cannot find an instance via ngMocks.get(${funcParseFindArgsName(args[0])})`);
    }
  }

  const { el, sel, notFoundValue } = parseArgs<T>(args);
  const root: DebugElement | undefined = mockHelperFind(funcGetLastFixture(), el, undefined);
  const source = getSourceOfMock(sel);

  // Looking in the root.
  if (root) {
    const result = funcGetFromNode([], root, source);
    if (result.length > 0) {
      return result[0];
    }
  }

  // Looking for a related structural directive.
  if (root) {
    const parent = nestedCheckParent(root, undefined);
    if (parent && parent.nativeNode.nodeName === '#comment') {
      const result = funcGetFromNode([], parent, source);
      if (result.length > 0) {
        return result[0];
      }
    }
  }

  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find ${funcGetName(sel)} instance via ngMocks.get`);
};
