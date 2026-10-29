import { MetadataOverride } from '@angular/core/testing';

import { flatten } from '../common/core.helpers';
import { NG_MOCKS, NG_MOCKS_OVERRIDES, NG_MOCKS_TOUCHES } from '../common/core.tokens';
import { AnyType, MetadataSubstitutions } from '../common/core.types';

export type NgMocksOverrides = Map<
  AnyType<unknown>,
  [MetadataOverride<unknown>, MetadataOverride<unknown>, MetadataSubstitutions]
>;

export default (
  providers: any,
): {
  mocks?: Map<any, any>;
  overrides?: NgMocksOverrides;
  touches?: Set<any>;
} => {
  let mocks: Map<any, any> | undefined;
  let overrides: NgMocksOverrides | undefined;
  let touches: Set<any> | undefined;

  for (const provide of flatten(providers || [])) {
    if (typeof provide !== 'object') {
      continue;
    }
    if (provide.provide === NG_MOCKS) {
      mocks = provide.useValue;
    }
    if (provide.provide === NG_MOCKS_OVERRIDES) {
      overrides = provide.useValue;
    }
    if (provide.provide === NG_MOCKS_TOUCHES) {
      touches = provide.useValue;
    }
  }

  return {
    mocks,
    overrides,
    touches,
  };
};
