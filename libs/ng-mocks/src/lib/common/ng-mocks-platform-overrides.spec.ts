import {
  Directive,
  forwardRef,
  Injectable,
  NgModule,
} from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';

import coreDefineProperty from './core.define-property';
import { NG_MOCKS_TOUCHES } from './core.tokens';
import { defineTouches } from './ng-mocks-platform-overrides';
import ngMocksUniverse from './ng-mocks-universe';

@Injectable({ providedIn: 'root' })
class OutsideService {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14930
describe('ng-mocks-platform-overrides:touches', () => {
  let defaults: ReturnType<typeof ngMocksUniverse.getDefaults>;
  let testBed: TestBed;

  beforeEach(() => {
    defaults = ngMocksUniverse.getDefaults();
    ngMocksUniverse.global.set(
      'defaults',
      new Map([[OutsideService, ['mock']]]),
    );
    testBed = Object.create(getTestBed());
    coreDefineProperty(testBed, '_providers', []);
  });

  afterEach(() => ngMocksUniverse.global.set('defaults', defaults));

  for (const firstEntry of ['A', 'B']) {
    it(`reaches every dependency after warming the mutual cycle from ${firstEntry}`, () => {
      class A {}
      class B {}
      class C {}
      class Leaf {}

      Directive({
        selector: '[a]',
        standalone: false,
        providers: [B, C],
      })(A);
      Directive({
        selector: '[b]',
        standalone: false,
        providers: [A],
      })(B);
      Directive({
        selector: '[c]',
        standalone: false,
        providers: [Leaf],
      })(C);
      const first = firstEntry === 'A' ? A : B;
      const second = firstEntry === 'A' ? B : A;

      const warm = defineTouches(testBed, { declarations: [first] });
      const later = defineTouches(testBed, {
        declarations: [second],
      });

      // The first visit to B can observe A before A has discovered C and Leaf.
      for (const dependency of [A, B, C, Leaf]) {
        expect(warm?.has(dependency)).toBe(true);
        expect(later?.has(dependency)).toBe(true);
      }
      expect(warm?.size).toBe(5);
      expect(later?.size).toBe(5);
      expect(warm?.has(NG_MOCKS_TOUCHES)).toBe(true);
      expect(later?.has(NG_MOCKS_TOUCHES)).toBe(true);
      expect(warm?.has(OutsideService)).toBe(false);
      expect(later?.has(OutsideService)).toBe(false);
    });
  }

  it('follows a forward reference to its declaration and later descendants', () => {
    class A {}
    class B {}
    class C {}
    class Leaf {}
    const reference = forwardRef(() => A);

    Directive({
      selector: '[a]',
      standalone: false,
      providers: [B, C],
    })(A);
    Directive({
      selector: '[b]',
      standalone: false,
      providers: [reference],
    })(B);
    Directive({
      selector: '[c]',
      standalone: false,
      providers: [Leaf],
    })(C);

    const actual = defineTouches(testBed, { declarations: [B] });

    for (const dependency of [A, B, C, Leaf]) {
      expect(actual?.has(dependency)).toBe(true);
    }
    expect(actual?.size).toBe(5);
    expect(actual?.has(reference)).toBe(false);
    expect(actual?.has(OutsideService)).toBe(false);
  });

  it('preserves descendants when a provider declaration refers to itself', () => {
    class RecursiveDirective {}
    class Leaf {}
    Directive({
      selector: '[recursive]',
      standalone: false,
      providers: [
        {
          provide: RecursiveDirective,
          useExisting: RecursiveDirective,
        },
        Leaf,
      ],
    })(RecursiveDirective);

    const first = defineTouches(testBed, {
      declarations: [RecursiveDirective],
    });
    const later = defineTouches(testBed, {
      declarations: [RecursiveDirective],
    });

    expect(first?.has(RecursiveDirective)).toBe(true);
    expect(first?.has(Leaf)).toBe(true);
    expect(later?.has(RecursiveDirective)).toBe(true);
    expect(later?.has(Leaf)).toBe(true);
    expect(first?.size).toBe(3);
    expect(later?.size).toBe(3);
    expect(later?.has(OutsideService)).toBe(false);
  });

  it('reuses shared acyclic descendants without adding an unrelated branch', () => {
    class Leaf {}
    @NgModule({ providers: [Leaf] })
    class SharedModule {}
    @NgModule({ imports: [SharedModule] })
    class LeftModule {}
    @NgModule({ imports: [SharedModule] })
    class RightModule {}

    const first = defineTouches(testBed, {
      imports: [LeftModule, RightModule],
    });
    const later = defineTouches(testBed, { imports: [RightModule] });

    expect(first?.has(LeftModule)).toBe(true);
    expect(first?.has(RightModule)).toBe(true);
    expect(first?.has(SharedModule)).toBe(true);
    expect(first?.has(Leaf)).toBe(true);
    expect(first?.size).toBe(5);
    expect(later?.has(RightModule)).toBe(true);
    expect(later?.has(SharedModule)).toBe(true);
    expect(later?.has(Leaf)).toBe(true);
    expect(later?.size).toBe(4);
    expect(later?.has(LeftModule)).toBe(false);
    expect(later?.has(OutsideService)).toBe(false);
  });

  it('keeps invocation providers out of a later bare module traversal', () => {
    class SharedProvider {}
    class InvocationProvider {}
    @NgModule({ providers: [SharedProvider] })
    class TargetModule {}
    const providers = [InvocationProvider];
    const moduleWithProviders = { ngModule: TargetModule, providers };

    const first = defineTouches(testBed, {
      imports: [moduleWithProviders],
    });
    const later = defineTouches(testBed, { imports: [TargetModule] });

    expect(first?.has(TargetModule)).toBe(true);
    expect(first?.has(SharedProvider)).toBe(true);
    expect(first?.has(InvocationProvider)).toBe(true);
    expect(first?.size).toBe(4);
    expect(later?.has(TargetModule)).toBe(true);
    expect(later?.has(SharedProvider)).toBe(true);
    expect(later?.has(InvocationProvider)).toBe(false);
    expect(later?.has(OutsideService)).toBe(false);
    expect(later?.size).toBe(3);
    expect(moduleWithProviders.providers).toBe(providers);
    expect(providers).toEqual([InvocationProvider]);
  });

  it('follows module and invocation providers through a forward reference', () => {
    class SharedProvider {}
    class InvocationProvider {}
    @NgModule({ providers: [SharedProvider] })
    class TargetModule {}
    const providers = [InvocationProvider];
    const moduleWithProviders = { ngModule: TargetModule, providers };
    const reference = forwardRef(() => moduleWithProviders);
    const imports = [reference];

    const actual = defineTouches(testBed, { imports });

    expect(actual?.has(TargetModule)).toBe(true);
    expect(actual?.has(SharedProvider)).toBe(true);
    expect(actual?.has(InvocationProvider)).toBe(true);
    expect(actual?.size).toBe(4);
    expect(actual?.has(reference)).toBe(false);
    expect(actual?.has(moduleWithProviders)).toBe(false);
    expect(actual?.has(OutsideService)).toBe(false);
    expect(imports).toEqual([reference]);
    expect(moduleWithProviders.providers).toBe(providers);
    expect(providers).toEqual([InvocationProvider]);
  });
});
