import { Directive } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  rememberInjectedDeclaration,
  rememberMockDeclarations,
  resetInjectedDeclarations,
  resolveMockDeclaration,
} from './ng-mocks-injected-declarations';

@Directive({
  selector: '[target]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {}

@Directive({
  selector: '[other]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class OtherDirective {}

class MockTargetDirective {}
(MockTargetDirective as any).mockOf = TargetDirective;

class MockOtherDirective {}
(MockOtherDirective as any).mockOf = OtherDirective;

describe('ng-mocks-injected-declarations:performance', () => {
  afterEach(() => {
    resetInjectedDeclarations();
  });

  it('reuses its registry across additions without changing the input map', () => {
    const initial = new Map([[TargetDirective, MockTargetDirective]]);
    rememberMockDeclarations(initial);
    const registry = (TestBed as any).ngMocksMockDeclarations;
    const targetSeed = { echo: jasmine.createSpy() };
    expect(
      rememberInjectedDeclaration(TargetDirective, targetSeed),
    ).toBe(targetSeed);

    rememberMockDeclarations(
      new Map([[OtherDirective, MockOtherDirective]]),
    );

    // Appending declarations must not copy all previously registered entries again.
    expect((TestBed as any).ngMocksMockDeclarations).toBe(registry);
    expect(registry).not.toBe(initial);
    expect(initial.size).toBe(1);
    expect(initial.has(OtherDirective)).toBe(false);
    expect(registry.get(TargetDirective)).toBe(MockTargetDirective);
    expect(registry.get(OtherDirective)).toBe(MockOtherDirective);

    const otherSeed = { echo: jasmine.createSpy() };
    expect(
      rememberInjectedDeclaration(OtherDirective, otherSeed),
    ).toBe(otherSeed);
    const targetLocal: any = {};
    const otherLocal: any = {};
    expect(resolveMockDeclaration(TargetDirective, targetLocal)).toBe(
      targetLocal,
    );
    expect(resolveMockDeclaration(OtherDirective, otherLocal)).toBe(
      otherLocal,
    );
    expect(targetLocal.echo).toBe(targetSeed.echo);
    expect(otherLocal.echo).toBe(otherSeed.echo);
  });

  it('releases the reused registry and injected instances on reset', () => {
    const mocks = new Map([[TargetDirective, MockTargetDirective]]);
    rememberMockDeclarations(mocks);
    const registry = (TestBed as any).ngMocksMockDeclarations;
    const seed = {};
    expect(rememberInjectedDeclaration(TargetDirective, seed)).toBe(
      seed,
    );

    resetInjectedDeclarations();

    expect((TestBed as any).ngMocksMockDeclarations).toBeUndefined();
    expect(
      (TestBed as any).ngMocksInjectedDeclarations,
    ).toBeUndefined();

    rememberMockDeclarations(mocks);
    const fresh = {};
    expect((TestBed as any).ngMocksMockDeclarations).not.toBe(
      registry,
    );
    expect(rememberInjectedDeclaration(TargetDirective, fresh)).toBe(
      fresh,
    );
  });
});
