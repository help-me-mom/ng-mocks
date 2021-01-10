import { Component } from '@angular/core';

import ngMocksUniverse from '../common/ng-mocks-universe';

import mockHelperDefaultReplace from './mock-helper.default-replace';

@Component({
  selector: 'target',
  template: '{{ name }}',
})
class TargetComponent {
  public readonly name = 'target';
}

@Component({
  selector: 'target',
  template: '{{ name }}',
})
class FakeComponent {
  public readonly name = 'fake';
}

describe('mock-helper.default-replace', () => {
  afterAll(() => {
    ngMocksUniverse.config.delete('ngMocksDepsSkip');
  });

  it('resets cacheDeclarations', () => {
    ngMocksUniverse.cacheDeclarations.set(TargetComponent, null);
    mockHelperDefaultReplace(TargetComponent, FakeComponent);
    expect(ngMocksUniverse.cacheDeclarations.size).toEqual(0);
  });

  it('resets ngMocksDepsSkip', () => {
    const config = new Set();
    config.add(TargetComponent);
    ngMocksUniverse.config.set('ngMocksDepsSkip', config);
    mockHelperDefaultReplace(TargetComponent, FakeComponent);
    expect(
      ngMocksUniverse.config.get('ngMocksDepsSkip').size,
    ).toEqual(0);
  });
});
