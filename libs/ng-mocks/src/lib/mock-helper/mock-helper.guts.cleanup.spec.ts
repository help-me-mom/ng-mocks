import { Directive, forwardRef, InjectionToken } from '@angular/core';

import CoreDefStack from '../common/core.def-stack';
import { isMockedNgDefOf } from '../common/func.is-mocked-ng-def-of';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { MockBuilderStash } from '../mock-builder/mock-builder-stash';
import collectDeclarations from '../resolve/collect-declarations';

import { ngMocks } from './mock-helper';

const failure = new Error('broken directive provider');
const TOKEN = new InjectionToken('provider');

@Directive({
  selector: '[target]',
  standalone: false,
})
class TargetDirective {}

@Directive({
  selector: '[kept]',
  standalone: false,
})
class KeptDirective {}

@Directive({
  selector: '[excluded]',
  standalone: false,
})
class ExcludedDirective {}

@Directive({
  providers: [
    {
      provide: TOKEN,
      useExisting: forwardRef(() => {
        throw failure;
      }),
    },
  ],
  selector: '[broken]',
  standalone: false,
})
class BrokenDirective {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14911
describe('mock-helper.guts:cleanup', () => {
  const stash = new MockBuilderStash();

  beforeEach(() => stash.backup());
  afterEach(() => stash.restore());

  it('removes its resolver and dependency policies after a successful call', () => {
    const meta = ngMocks.guts(
      KeptDirective,
      [TargetDirective, ExcludedDirective],
      ExcludedDirective,
    );

    expect(meta.declarations?.length).toBe(2);
    expect(
      isMockedNgDefOf(meta.declarations?.[0], TargetDirective, 'd'),
    ).toBe(true);
    expect(meta.declarations?.[1]).toBe(KeptDirective);
    expect(meta.imports).toEqual([]);
    expect(meta.providers).toEqual([]);
    expect(ngMocksUniverse.config.has('mockNgDefResolver')).toBe(
      false,
    );
    expect(ngMocksUniverse.config.has('ngMocksDepsResolution')).toBe(
      false,
    );
  });

  it('removes its resolver and dependency policies when mocking throws', () => {
    let caught: unknown;

    try {
      ngMocks.guts(null, BrokenDirective);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(failure);
    expect(ngMocksUniverse.config.has('mockNgDefResolver')).toBe(
      false,
    );
    expect(ngMocksUniverse.config.has('ngMocksDepsResolution')).toBe(
      false,
    );
  });

  it('uses local policies and restores existing maps after a successful call', () => {
    const outerToken = new InjectionToken('outer');
    const outerValue = {};
    const resolver = new CoreDefStack();
    resolver.set(outerToken, outerValue);
    resolver.set(TargetDirective, TargetDirective);
    const resolutions = new Map<any, any>([
      [TargetDirective, 'keep'],
      [KeptDirective, 'mock'],
      [ExcludedDirective, 'keep'],
    ]);
    ngMocksUniverse.config.set('mockNgDefResolver', resolver);
    ngMocksUniverse.config.set('ngMocksDepsResolution', resolutions);

    const meta = ngMocks.guts(
      KeptDirective,
      [TargetDirective, ExcludedDirective],
      ExcludedDirective,
    );

    expect(meta.declarations?.length).toBe(2);
    expect(
      isMockedNgDefOf(meta.declarations?.[0], TargetDirective, 'd'),
    ).toBe(true);
    expect(meta.declarations?.[1]).toBe(KeptDirective);
    expect(meta.imports).toEqual([]);
    expect(meta.providers).toEqual([]);
    expect(ngMocksUniverse.config.get('mockNgDefResolver')).toBe(
      resolver,
    );
    expect(ngMocksUniverse.config.get('ngMocksDepsResolution')).toBe(
      resolutions,
    );
    expect(resolver.get(outerToken)).toBe(outerValue);
    expect(resolver.get(TargetDirective)).toBe(TargetDirective);
    expect([...resolver.pop()]).toEqual([
      [outerToken, outerValue],
      [TargetDirective, TargetDirective],
    ]);
    expect([...resolutions]).toEqual([
      [TargetDirective, 'keep'],
      [KeptDirective, 'mock'],
      [ExcludedDirective, 'keep'],
    ]);
  });

  it('restores existing maps and their entries when mocking throws', () => {
    const outerToken = new InjectionToken('outer');
    const outerValue = {};
    const resolver = new CoreDefStack();
    resolver.set(outerToken, outerValue);
    resolver.set(BrokenDirective, BrokenDirective);
    const resolutions = new Map<any, any>([
      [outerToken, 'keep'],
      [BrokenDirective, 'exclude'],
    ]);
    ngMocksUniverse.config.set('mockNgDefResolver', resolver);
    ngMocksUniverse.config.set('ngMocksDepsResolution', resolutions);
    let caught: unknown;

    try {
      ngMocks.guts(null, BrokenDirective);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(failure);
    expect(ngMocksUniverse.config.get('mockNgDefResolver')).toBe(
      resolver,
    );
    expect(ngMocksUniverse.config.get('ngMocksDepsResolution')).toBe(
      resolutions,
    );
    expect(resolver.get(outerToken)).toBe(outerValue);
    expect(resolver.get(BrokenDirective)).toBe(BrokenDirective);
    expect([...resolver.pop()]).toEqual([
      [outerToken, outerValue],
      [BrokenDirective, BrokenDirective],
    ]);
    expect([...resolutions]).toEqual([
      [outerToken, 'keep'],
      [BrokenDirective, 'exclude'],
    ]);
  });

  it('resumes an outer directive after successful and failing nested guts calls', () => {
    const keptProvider = {
      provide: new InjectionToken('kept alias'),
      useExisting: KeptDirective,
      multi: true,
    };
    let calls = 0;

    @Directive({
      providers: [
        {
          provide: TOKEN,
          useExisting: forwardRef(() => {
            calls += 1;
            const resolver = ngMocksUniverse.config.get(
              'mockNgDefResolver',
            );
            const resolutions = ngMocksUniverse.config.get(
              'ngMocksDepsResolution',
            );
            const entries = [...resolutions];

            expect(resolver).toEqual(jasmine.any(CoreDefStack));
            expect(resolutions.get(KeptDirective)).toBe('keep');
            expect(resolutions.get(ExcludedDirective)).toBe(
              'exclude',
            );
            const inner = ngMocks.guts(
              ExcludedDirective,
              KeptDirective,
              TargetDirective,
            );

            expect(
              isMockedNgDefOf(
                inner.declarations?.[0],
                KeptDirective,
                'd',
              ),
            ).toBe(true);
            expect(inner.declarations?.[1]).toBe(ExcludedDirective);
            expect(
              ngMocksUniverse.config.get('mockNgDefResolver'),
            ).toBe(resolver);
            expect(
              ngMocksUniverse.config.get('ngMocksDepsResolution'),
            ).toBe(resolutions);
            expect([...resolutions]).toEqual(entries);
            let caught: unknown;

            try {
              ngMocks.guts(null, BrokenDirective);
            } catch (error) {
              caught = error;
            }

            expect(caught).toBe(failure);
            expect(
              ngMocksUniverse.config.get('mockNgDefResolver'),
            ).toBe(resolver);
            expect(
              ngMocksUniverse.config.get('ngMocksDepsResolution'),
            ).toBe(resolutions);
            expect([...resolutions]).toEqual(entries);

            return OuterDirective;
          }),
        },
        keptProvider,
      ],
      selector: '[outer]',
      standalone: false,
    })
    class OuterDirective {}

    const meta = ngMocks.guts(
      KeptDirective,
      [OuterDirective, ExcludedDirective],
      ExcludedDirective,
    );
    const mock = meta.declarations?.[0];
    const providers = collectDeclarations(mock).Directive.providers;

    expect(calls).toBe(1);
    expect(isMockedNgDefOf(mock, OuterDirective, 'd')).toBe(true);
    expect(meta.declarations).toEqual([mock, KeptDirective]);
    expect(providers).toEqual([
      { provide: TOKEN, useExisting: mock },
      keptProvider,
      { provide: OuterDirective, useExisting: mock },
    ]);
    expect(providers[1]).toBe(keptProvider);
    expect(ngMocksUniverse.config.has('mockNgDefResolver')).toBe(
      false,
    );
    expect(ngMocksUniverse.config.has('ngMocksDepsResolution')).toBe(
      false,
    );
    expect(ngMocksUniverse.config.has('mockNgDefConstruction')).toBe(
      false,
    );
  });
});
