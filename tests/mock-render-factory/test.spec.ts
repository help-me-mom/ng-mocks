import { Component, Input } from '@angular/core';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-mock-render-factory',
  template: '{{ value }}',
})
class TargetComponent {
  @Input() public value: null | number = null;
}

describe('mock-render-factory', () => {
  ngMocks.faster();
  let factory1: MockRenderFactory<TargetComponent>;
  let factory2: MockRenderFactory<TargetComponent>;

  // we have global configuration for our builder.
  beforeAll(() => MockBuilder(TargetComponent));

  // now we want to have 1st factory for a middleware component
  beforeAll(() =>
    expect(
      () =>
        (factory1 = MockRenderFactory(TargetComponent, ['value'])),
    ).not.toThrow(),
  );

  // now we want to have 2nd factory for a middleware component
  beforeAll(() =>
    expect(
      () =>
        (factory2 = MockRenderFactory(TargetComponent, ['value'])),
    ).not.toThrow(),
  );

  it('creates different fixtures without errors in the 1st test', () => {
    expect(factory1).not.toThrow();
    expect(factory2).not.toThrow();
  });

  it('creates different fixtures without errors in the 2nd test', () => {
    expect(() => {
      const params = { value: 1 };
      const fixture1 = factory1(params);
      expect(fixture1.point.componentInstance.value).toEqual(1);
      params.value = 2;
      fixture1.detectChanges();
      expect(fixture1.point.componentInstance.value).toEqual(2);

      // fixture remembers the parameters
      const fixture2 = factory1({ value: 2 });
      expect(fixture2.point.componentInstance.value).toEqual(2);
    }).not.toThrow();

    expect(() => {
      const params = { value: 2 };
      const fixture1 = factory2(params);
      expect(fixture1.point.componentInstance.value).toEqual(2);
      params.value = 3;
      fixture1.detectChanges();
      expect(fixture1.point.componentInstance.value).toEqual(3);

      // fixture remembers the parameters
      const fixture2 = factory2({ value: 3 });
      expect(fixture2.point.componentInstance.value).toEqual(3);
    }).not.toThrow();
  });
});
