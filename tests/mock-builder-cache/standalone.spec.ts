import { Component } from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'cache-child',
  standalone: true,
  template: 'child',
})
class ChildComponent {}

@Component({
  imports: [ChildComponent],
  selector: 'cache-target',
  standalone: true,
  template: '<cache-child></cache-child>',
})
class TargetComponent {}

describe('MockBuilder:cache shallow imports', () => {
  afterEach(ngMocks.reset);

  it('mocks imports when shallow changes to true', async () => {
    MockBuilder().keep(TargetComponent, { shallow: false }).build();
    await MockBuilder().keep(TargetComponent, { shallow: true });

    const fixture = MockRender(TargetComponent);

    expect(
      isMockOf(fixture.point.componentInstance, TargetComponent),
    ).toBe(false);
    expect(
      isMockOf(
        ngMocks.findInstance(fixture, ChildComponent),
        ChildComponent,
      ),
    ).toBe(true);
    expect(ngMocks.formatText(fixture)).toBe('');
  });

  it('keeps imports real when shallow changes to false', async () => {
    MockBuilder().keep(TargetComponent, { shallow: true }).build();
    await MockBuilder().keep(TargetComponent, { shallow: false });

    const fixture = MockRender(TargetComponent);

    expect(
      isMockOf(fixture.point.componentInstance, TargetComponent),
    ).toBe(false);
    expect(
      isMockOf(
        ngMocks.findInstance(fixture, ChildComponent),
        ChildComponent,
      ),
    ).toBe(false);
    expect(ngMocks.formatText(fixture)).toBe('child');
  });
});
