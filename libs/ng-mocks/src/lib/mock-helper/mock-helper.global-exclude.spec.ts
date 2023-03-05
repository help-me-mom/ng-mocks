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

describe('mock-helper.default-exclude', () => {
  afterEach(() => {
    mockHelperGlobalWipe(TargetComponent);
    mockHelperGlobalWipe(TargetService);
  });

  afterAll(() => {
    ngMocksUniverse.config.delete('ngMocksDepsSkip');
  });

  it('resets cacheDeclarations', () => {
    ngMocksUniverse.cacheDeclarations.set(TargetComponent, null);
    mockHelperGlobalExclude(TargetComponent);
    expect(ngMocksUniverse.cacheDeclarations.size).toEqual(0);
  });

  it('resets ngMocksDepsSkip', () => {
    const config = new Set();
    config.add(TargetComponent);
    ngMocksUniverse.config.set('ngMocksDepsSkip', config);
    mockHelperGlobalExclude(TargetComponent);
    expect(
      ngMocksUniverse.config.get('ngMocksDepsSkip').size,
    ).toEqual(0);
  });

  it('adds TargetComponent with exclude flag', () => {
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(undefined);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual(
      undefined,
    );
    mockHelperGlobalExclude(TargetComponent);
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(['exclude']);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual(
      undefined,
    );
  });

  it('adds TargetComponent with exclude flag recursively', () => {
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(undefined);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual(
      undefined,
    );
    mockHelperGlobalExclude(TargetComponent, true);
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(['exclude']);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual([
      'exclude',
    ]);
  });
});
