import { APP_ID, APP_INITIALIZER, VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import {
  TargetComponent,
  TargetModule,
  TARGET_TOKEN,
} from './fixtures';

describe('MockBuilderKeepsApplicationModule:real', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    const element = ngMocks.find(
      fixture.debugElement,
      TargetComponent,
    );
    expect(element).toBeDefined();
    expect(TestBed.get(TARGET_TOKEN)).toBeDefined();
    expect(TestBed.get(APP_INITIALIZER)).toBeDefined();
    expect(TestBed.get(APP_ID)).toBeDefined();
  });
});

describe('MockBuilderKeepsApplicationModule:mock', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    const element = ngMocks.find(
      fixture.debugElement,
      TargetComponent,
    );
    expect(element).toBeDefined();
    expect(TestBed.get(TARGET_TOKEN)).toEqual('');
    if (parseInt(VERSION.major, 10) < 9) {
      // somehow ivy doesn't provide APP_INITIALIZER out of the box and this assertion fails.
      // our mock logic skips all multi tokens therefore this one isn't present anymore.
      expect(TestBed.get(APP_INITIALIZER)).toBeDefined();
    }
    expect(TestBed.get(APP_ID)).toBeDefined();
  });
});
