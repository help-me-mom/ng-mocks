import { Component, Injectable } from '@angular/core';

import ngMocksUniverse from '../common/ng-mocks-universe';

import mockHelperGlobalKeep from './mock-helper.global-keep';
import mockHelperGlobalWipe from './mock-helper.global-wipe';

@Injectable()
class TargetService {}

@Component({
  selector: 'target',
  template: '{{ name }}',
  providers: [TargetService],
})
class TargetComponent {
  public readonly name = 'target';
}

describe('mock-helper.default-keep', () => {
  afterEach(() => {
    mockHelperGlobalWipe(TargetComponent);
    mockHelperGlobalWipe(TargetService);
  });

  afterAll(() => {
    ngMocksUniverse.config.delete('ngMocksDepsSkip');
  });

  it('resets cacheDeclarations', () => {
    ngMocksUniverse.cacheDeclarations.set(TargetComponent, null);
    mockHelperGlobalKeep(TargetComponent);
    expect(ngMocksUniverse.cacheDeclarations.size).toEqual(0);
  });

  it('resets ngMocksDepsSkip', () => {
    const config = new Set();
    config.add(TargetComponent);
    ngMocksUniverse.config.set('ngMocksDepsSkip', config);
    mockHelperGlobalKeep(TargetComponent);
    expect(
      ngMocksUniverse.config.get('ngMocksDepsSkip').size,
    ).toEqual(0);
  });

  it('adds TargetComponent with keep flag', () => {
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(undefined);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual(
      undefined,
    );
    mockHelperGlobalKeep(TargetComponent);
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(['keep']);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual(
      undefined,
    );
  });

  it('adds TargetComponent with keep flag recursively', () => {
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(undefined);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual(
      undefined,
    );
    mockHelperGlobalKeep(TargetComponent, true);
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(['keep']);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual([
      'keep',
    ]);
  });
});
