import { Component, Injectable } from '@angular/core';

import ngMocksUniverse from '../common/ng-mocks-universe';

import mockHelperGlobalExclude from './mock-helper.global-exclude';
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

describe('mock-helper.default-wipe', () => {
  afterEach(() => {
    mockHelperGlobalWipe(TargetComponent);
    mockHelperGlobalWipe(TargetService);
  });

  afterAll(() => {
    ngMocksUniverse.config.delete('ngMocksDepsSkip');
  });

  it('resets cacheDeclarations', () => {
    ngMocksUniverse.cacheDeclarations.set(TargetComponent, null);
    mockHelperGlobalWipe(TargetComponent);
    expect(ngMocksUniverse.cacheDeclarations.size).toEqual(0);
  });

  it('resets ngMocksDepsSkip', () => {
    const config = new Set();
    config.add(TargetComponent);
    ngMocksUniverse.config.set('ngMocksDepsSkip', config);
    mockHelperGlobalWipe(TargetComponent);
    expect(
      ngMocksUniverse.config.get('ngMocksDepsSkip').size,
    ).toEqual(0);
  });

  it('adds TargetComponent with mock flag', () => {
    mockHelperGlobalExclude(TargetComponent);
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(['exclude']);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual(
      undefined,
    );
    mockHelperGlobalWipe(TargetComponent);
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(undefined);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual(
      undefined,
    );
  });

  it('adds TargetComponent with mock flag recursively', () => {
    mockHelperGlobalExclude(TargetComponent, true);
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(['exclude']);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual([
      'exclude',
    ]);
    mockHelperGlobalWipe(TargetComponent, true);
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(undefined);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual(
      undefined,
    );
  });
});
