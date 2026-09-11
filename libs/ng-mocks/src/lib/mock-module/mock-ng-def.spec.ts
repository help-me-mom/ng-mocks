import CoreDefStack from '../common/core.def-stack';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { MockBuilderStash } from '../mock-builder/mock-builder-stash';

import mockNgDef from './mock-ng-def';

// @see https://github.com/help-me-mom/ng-mocks/issues/14911
describe('mock-ng-def', () => {
  const stash = new MockBuilderStash();

  beforeEach(() => stash.backup());
  afterEach(() => stash.restore());

  for (const cachePipe of [false, true]) {
    it(`cleans its resolver after metadata failure with cachePipe=${cachePipe}`, () => {
      const failure = new Error('metadata failure');
      let actual: unknown;
      if (cachePipe) {
        ngMocksUniverse.flags.add('cachePipe');
      }

      try {
        mockNgDef({
          get providers(): never {
            expect(
              ngMocksUniverse.config.has('mockNgDefResolver'),
            ).toBe(true);
            expect(ngMocksUniverse.flags.has('cachePipe')).toBe(true);
            throw failure;
          },
        });
      } catch (error) {
        actual = error;
      }

      expect(actual).toBe(failure);
      expect(ngMocksUniverse.config.has('mockNgDefResolver')).toBe(
        false,
      );
      expect(ngMocksUniverse.flags.has('cachePipe')).toBe(cachePipe);
    });

    it(`unwinds a caller's frame after export failure with cachePipe=${cachePipe}`, () => {
      class Dependency {}
      class MockDependency {}
      const callerToken = {};
      const callerValue = {};
      const resolver = new CoreDefStack();
      resolver.set(callerToken, callerValue);
      ngMocksUniverse.config.set('mockNgDefResolver', resolver);
      ngMocksUniverse.builtDeclarations.set(
        Dependency,
        MockDependency,
      );
      if (cachePipe) {
        ngMocksUniverse.flags.add('cachePipe');
      }
      const failure = new Error('export failure');
      let importsReads = 0;
      let actual: unknown;

      try {
        mockNgDef({
          declarations: [Dependency],
          get imports(): any[] {
            importsReads += 1;
            // Empty imports are read once in processMeta and again in addExports.
            if (importsReads > 1) {
              expect(ngMocksUniverse.flags.has('cachePipe')).toBe(
                cachePipe,
              );
              throw failure;
            }
            return [];
          },
        });
      } catch (error) {
        actual = error;
      }

      expect(actual).toBe(failure);
      expect(importsReads).toBe(2);
      expect(ngMocksUniverse.config.get('mockNgDefResolver')).toBe(
        resolver,
      );
      expect(ngMocksUniverse.flags.has('cachePipe')).toBe(cachePipe);
      expect(resolver.get(callerToken)).toBe(callerValue);
      expect(resolver.get(Dependency)).toBe(MockDependency);

      // Completed resolutions propagate outward; only the temporary frame is removed.
      const callerFrame = resolver.pop();
      expect(callerFrame.get(callerToken)).toBe(callerValue);
      expect(callerFrame.get(Dependency)).toBe(MockDependency);
      expect(resolver.pop().size).toBe(0);
    });
  }

  it('unwinds every nested frame while restoring the outer cache flag', () => {
    const callerToken = {};
    const callerValue = {};
    const resolver = new CoreDefStack();
    resolver.set(callerToken, callerValue);
    ngMocksUniverse.config.set('mockNgDefResolver', resolver);
    const failure = new Error('nested metadata failure');
    let actual: unknown;

    try {
      mockNgDef({
        get imports(): any[] {
          mockNgDef({
            get providers(): never {
              expect(ngMocksUniverse.flags.has('cachePipe')).toBe(
                true,
              );
              throw failure;
            },
          });
          return [];
        },
      });
    } catch (error) {
      actual = error;
    }

    expect(actual).toBe(failure);
    expect(ngMocksUniverse.config.get('mockNgDefResolver')).toBe(
      resolver,
    );
    expect(ngMocksUniverse.flags.has('cachePipe')).toBe(false);
    expect(resolver.pop().get(callerToken)).toBe(callerValue);
    expect(resolver.pop().size).toBe(0);
  });

  it('returns completed resolutions after cleaning its own resolver', () => {
    class Dependency {}
    class MockDependency {}
    ngMocksUniverse.builtDeclarations.set(Dependency, MockDependency);

    const [changed, definition, resolutions] = mockNgDef({
      declarations: [Dependency],
      exports: [Dependency],
      skipExports: true,
    });

    expect(changed).toBe(true);
    expect(definition.declarations).toEqual([MockDependency]);
    expect(definition.exports).toEqual([MockDependency]);
    expect(resolutions.get(Dependency)).toBe(MockDependency);
    expect(ngMocksUniverse.config.has('mockNgDefResolver')).toBe(
      false,
    );
    expect(ngMocksUniverse.flags.has('cachePipe')).toBe(false);
  });

  it('preserves the caller resolver and enabled pipe cache after success', () => {
    class Dependency {}
    class MockDependency {}
    const callerToken = {};
    const callerValue = {};
    const resolver = new CoreDefStack();
    resolver.set(callerToken, callerValue);
    ngMocksUniverse.config.set('mockNgDefResolver', resolver);
    ngMocksUniverse.flags.add('cachePipe');
    ngMocksUniverse.builtDeclarations.set(Dependency, MockDependency);

    const [changed, definition, resolutions] = mockNgDef({
      declarations: [Dependency],
      exports: [Dependency],
      skipExports: true,
    });

    expect(changed).toBe(true);
    expect(definition.declarations).toEqual([MockDependency]);
    expect(definition.exports).toEqual([MockDependency]);
    expect(resolutions.get(Dependency)).toBe(MockDependency);
    expect(resolutions.has(callerToken)).toBe(false);
    expect(ngMocksUniverse.config.get('mockNgDefResolver')).toBe(
      resolver,
    );
    expect(ngMocksUniverse.flags.has('cachePipe')).toBe(true);

    const callerFrame = resolver.pop();
    expect(callerFrame).not.toBe(resolutions);
    expect(callerFrame.get(callerToken)).toBe(callerValue);
    expect(callerFrame.get(Dependency)).toBe(MockDependency);
    expect(resolver.pop().size).toBe(0);
  });
});
