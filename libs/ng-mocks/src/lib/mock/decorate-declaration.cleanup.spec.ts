import { forwardRef, InjectionToken } from '@angular/core';

import CoreDefStack from '../common/core.def-stack';
import { extendClass } from '../common/core.helpers';
import { Mock } from '../common/mock';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { MockBuilderStash } from '../mock-builder/mock-builder-stash';

import decorateDeclaration from './decorate-declaration';

// @see https://github.com/help-me-mom/ng-mocks/issues/14911
describe('decorate-declaration:cleanup', () => {
  const stash = new MockBuilderStash();

  beforeEach(() => stash.backup());
  afterEach(() => stash.restore());

  it('removes its resolver after successfully cloning both provider lists', () => {
    class TargetComponent {}

    const token = new InjectionToken('provider');
    const viewToken = new InjectionToken('view provider');
    const mock = extendClass(Mock);
    const options = decorateDeclaration(
      TargetComponent,
      mock,
      {
        providers: [
          {
            provide: token,
            useExisting: forwardRef(() => TargetComponent),
          },
        ],
        viewProviders: [
          {
            provide: viewToken,
            useExisting: forwardRef(() => TargetComponent),
          },
        ],
      },
      {},
    );

    expect(options.providers).toEqual([
      { provide: token, useExisting: mock },
      { provide: TargetComponent, useExisting: mock },
    ]);
    expect(options.viewProviders).toEqual([
      { provide: viewToken, useExisting: mock },
    ]);
    expect(ngMocksUniverse.config.has('mockNgDefResolver')).toBe(
      false,
    );
  });

  it('preserves an existing resolver after successfully cloning both provider lists', () => {
    class TargetComponent {}

    const token = new InjectionToken('provider');
    const viewToken = new InjectionToken('view provider');
    const outerToken = new InjectionToken('outer');
    const outerValue = {};
    const resolver = new CoreDefStack();
    resolver.set(outerToken, outerValue);
    ngMocksUniverse.config.set('mockNgDefResolver', resolver);
    const mock = extendClass(Mock);
    const options = decorateDeclaration(
      TargetComponent,
      mock,
      {
        providers: [
          {
            provide: token,
            useExisting: forwardRef(() => TargetComponent),
          },
        ],
        viewProviders: [
          {
            provide: viewToken,
            useExisting: forwardRef(() => TargetComponent),
          },
        ],
      },
      {},
    );

    expect(options.providers).toEqual([
      { provide: token, useExisting: mock },
      { provide: TargetComponent, useExisting: mock },
    ]);
    expect(options.viewProviders).toEqual([
      { provide: viewToken, useExisting: mock },
    ]);
    expect(ngMocksUniverse.config.get('mockNgDefResolver')).toBe(
      resolver,
    );
    expect(resolver.get(outerToken)).toBe(outerValue);
    expect([...resolver.pop()]).toEqual([[outerToken, outerValue]]);
  });

  it('removes its resolver when cloning providers throws', () => {
    class TargetComponent {}

    const failure = new Error('broken provider');
    let caught: unknown;

    try {
      decorateDeclaration(
        TargetComponent,
        extendClass(Mock),
        {
          providers: [
            {
              provide: new InjectionToken('provider'),
              useExisting: forwardRef(() => {
                throw failure;
              }),
            },
          ],
        },
        {},
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(failure);
    expect(ngMocksUniverse.config.has('mockNgDefResolver')).toBe(
      false,
    );
  });

  it('removes its resolver when cloning viewProviders throws', () => {
    class TargetComponent {}

    const failure = new Error('broken view provider');
    let caught: unknown;

    try {
      decorateDeclaration(
        TargetComponent,
        extendClass(Mock),
        {
          viewProviders: [
            {
              provide: new InjectionToken('view provider'),
              useExisting: forwardRef(() => {
                throw failure;
              }),
            },
          ],
        },
        {},
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(failure);
    expect(ngMocksUniverse.config.has('mockNgDefResolver')).toBe(
      false,
    );
  });

  it('preserves an existing resolver when cloning providers throws', () => {
    class TargetComponent {}

    const failure = new Error('broken provider');
    const outerToken = new InjectionToken('outer');
    const outerValue = {};
    const resolver = new CoreDefStack();
    resolver.set(outerToken, outerValue);
    ngMocksUniverse.config.set('mockNgDefResolver', resolver);
    let caught: unknown;

    try {
      decorateDeclaration(
        TargetComponent,
        extendClass(Mock),
        {
          providers: [
            {
              provide: new InjectionToken('provider'),
              useExisting: forwardRef(() => {
                throw failure;
              }),
            },
          ],
        },
        {},
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(failure);
    expect(ngMocksUniverse.config.get('mockNgDefResolver')).toBe(
      resolver,
    );
    expect(resolver.get(outerToken)).toBe(outerValue);
    expect([...resolver.pop()]).toEqual([[outerToken, outerValue]]);
  });

  it('preserves an existing resolver when cloning viewProviders throws', () => {
    class TargetComponent {}

    const failure = new Error('broken view provider');
    const outerToken = new InjectionToken('outer');
    const outerValue = {};
    const resolver = new CoreDefStack();
    resolver.set(outerToken, outerValue);
    ngMocksUniverse.config.set('mockNgDefResolver', resolver);
    let caught: unknown;

    try {
      decorateDeclaration(
        TargetComponent,
        extendClass(Mock),
        {
          viewProviders: [
            {
              provide: new InjectionToken('view provider'),
              useExisting: forwardRef(() => {
                throw failure;
              }),
            },
          ],
        },
        {},
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(failure);
    expect(ngMocksUniverse.config.get('mockNgDefResolver')).toBe(
      resolver,
    );
    expect(resolver.get(outerToken)).toBe(outerValue);
    expect([...resolver.pop()]).toEqual([[outerToken, outerValue]]);
  });
});
