import { Component } from '@angular/core';

import ngMocksUniverse from '../common/ng-mocks-universe';

import mockHelperDefaultWipe from './mock-helper.default-wipe';

@Component({
  selector: 'target',
  template: '{{ name }}',
})
class TargetComponent {
  public readonly name = 'target';
}

describe('mock-helper.default-wipe', () => {
  afterAll(() => {
    ngMocksUniverse.config.delete('ngMocksDepsSkip');
  });

  it('resets cacheDeclarations', () => {
    ngMocksUniverse.cacheDeclarations.set(TargetComponent, null);
    mockHelperDefaultWipe(TargetComponent);
    expect(ngMocksUniverse.cacheDeclarations.size).toEqual(0);
  });

  it('resets ngMocksDepsSkip', () => {
    const config = new Set();
    config.add(TargetComponent);
    ngMocksUniverse.config.set('ngMocksDepsSkip', config);
    mockHelperDefaultWipe(TargetComponent);
    expect(
      ngMocksUniverse.config.get('ngMocksDepsSkip').size,
    ).toEqual(0);
  });
});
