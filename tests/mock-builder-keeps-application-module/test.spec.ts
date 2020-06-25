import { APP_ID, APP_INITIALIZER, VERSION } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { TargetComponent } from './fixtures.components';
import { TARGET_TOKEN, TargetModule } from './fixtures.modules';
import { testBedInjector } from '../utils/test-bed-injector';

describe('MockBuilderKeepsApplicationModule:real', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    const element = ngMocks.find(fixture.debugElement, TargetComponent);
    expect(element).toBeDefined();
    expect(testBedInjector(TARGET_TOKEN)).toBeDefined();
    expect(testBedInjector(APP_INITIALIZER)).toBeDefined();
    expect(testBedInjector(APP_ID)).toBeDefined();
  });
});

describe('MockBuilderKeepsApplicationModule:mock', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    const element = ngMocks.find(fixture.debugElement, TargetComponent);
    expect(element).toBeDefined();
    expect(() => testBedInjector(TARGET_TOKEN)).toThrow();
    if (!['9', '10'].includes(VERSION.major)) {
      // somehow ivy doesn't provide APP_INITIALIZER out of the box and this assertion fails.
      // our mock logic skips all multi tokens therefore this one isn't present anymore.
      expect(testBedInjector(APP_INITIALIZER)).toBeDefined();
    }
    expect(testBedInjector(APP_ID)).toBeDefined();
  });
});
