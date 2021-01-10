import { Component } from '@angular/core';

import ngMocksUniverse from '../common/ng-mocks-universe';

import mockHelperDefaultKeep from './mock-helper.default-keep';

@Component({
  selector: 'target',
  template: '{{ name }}',
})
class TargetComponent {
  public readonly name = 'target';
}

describe('mock-helper.default-keep', () => {
  afterAll(() => {
    ngMocksUniverse.config.delete('ngMocksDepsSkip');
  });

  it('resets cacheDeclarations', () => {
    ngMocksUniverse.cacheDeclarations.set(TargetComponent, null);
    mockHelperDefaultKeep(TargetComponent);
    expect(ngMocksUniverse.cacheDeclarations.size).toEqual(0);
  });

  it('resets ngMocksDepsSkip', () => {
    const config = new Set();
    config.add(TargetComponent);
    ngMocksUniverse.config.set('ngMocksDepsSkip', config);
    mockHelperDefaultKeep(TargetComponent);
    expect(
      ngMocksUniverse.config.get('ngMocksDepsSkip').size,
    ).toEqual(0);
  });
});
