import { Directive } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  rememberInjectedDeclaration,
  rememberMockDeclarations,
  resetInjectedDeclarations,
  resolveInjectedDeclaration,
} from './ng-mocks-injected-declarations';
import ngMocksUniverse from './ng-mocks-universe';

@Directive({
  selector: '[target]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {}

class MockTargetDirective {}
(MockTargetDirective as any).mockOf = TargetDirective;

describe('ng-mocks-injected-declarations', () => {
  afterEach(() => {
    resetInjectedDeclarations();
    ngMocksUniverse.builtDeclarations.delete(TargetDirective);
    ngMocksUniverse.cacheDeclarations.delete(TargetDirective);
  });

  it('reuses a seed before a local declaration has been resolved', () => {
    // Explicit TestBed.inject should stay stable until Angular resolves a declaration-local instance.
    rememberMockDeclarations(
      new Map([[TargetDirective, MockTargetDirective]]),
    );
    const seed = {
      echo: jasmine.createSpy(),
    };

    expect(rememberInjectedDeclaration(TargetDirective, seed)).toBe(
      seed,
    );
    expect(rememberInjectedDeclaration(TargetDirective, {})).toBe(
      seed,
    );
  });

  it('tracks declaration mocks from built declarations', () => {
    // Once Angular resolves the local declaration instance, the seeded descriptors should be replayed
    // onto it and the local instance becomes the canonical result.
    ngMocksUniverse.builtDeclarations.set(
      TargetDirective,
      MockTargetDirective,
    );
    const seed = {
      echo: jasmine.createSpy(),
    };
    const local: any = {};

    expect(rememberInjectedDeclaration(TargetDirective, seed)).toBe(
      seed,
    );
    expect(resolveInjectedDeclaration(TargetDirective, local)).toBe(
      local,
    );
    expect(local.echo).toBe(seed.echo);
  });

  it('ignores mocked declarations whose source is not a class', () => {
    // Broken metadata should never create tracking state for arbitrary non-declaration tokens.
    const token: any = () => undefined;
    token.mockOf = 'broken';

    expect(rememberInjectedDeclaration(token, {})).toEqual({});
    expect(
      (TestBed as any).ngMocksInjectedDeclarations,
    ).toBeUndefined();
  });
});
