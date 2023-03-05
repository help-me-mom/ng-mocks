import { Component, Injectable } from '@angular/core';

import ngMocksUniverse from '../common/ng-mocks-universe';

import mockHelperGlobalMock from './mock-helper.global-mock';
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

describe('mock-helper.default-mock', () => {
  afterEach(() => {
    mockHelperGlobalWipe(TargetComponent);
    mockHelperGlobalWipe(TargetService);
  });

  afterAll(() => {
    ngMocksUniverse.config.delete('ngMocksDepsSkip');
  });

  it('resets cacheDeclarations', () => {
    ngMocksUniverse.cacheDeclarations.set(TargetComponent, null);
    mockHelperGlobalMock(TargetComponent);
    expect(ngMocksUniverse.cacheDeclarations.size).toEqual(0);
  });

  it('resets ngMocksDepsSkip', () => {
    const config = new Set();
    config.add(TargetComponent);
    ngMocksUniverse.config.set('ngMocksDepsSkip', config);
    mockHelperGlobalMock(TargetComponent);
    expect(
      ngMocksUniverse.config.get('ngMocksDepsSkip').size,
    ).toEqual(0);
  });

  it('adds TargetComponent with mock flag', () => {
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(undefined);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual(
      undefined,
    );
    mockHelperGlobalMock(TargetComponent);
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(['mock']);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual(
      undefined,
    );
  });

  it('adds TargetComponent with mock flag recursively', () => {
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(undefined);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual(
      undefined,
    );
    mockHelperGlobalMock(TargetComponent, true);
    expect(
      ngMocksUniverse.getDefaults().get(TargetComponent),
    ).toEqual(['mock']);
    expect(ngMocksUniverse.getDefaults().get(TargetService)).toEqual([
      'mock',
    ]);
  });
});
