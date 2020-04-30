import { APP_ID, APP_INITIALIZER } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockBuilder, MockRender } from 'ng-mocks';

import { TargetComponent } from './fixtures.components';
import { TARGET_TOKEN, TargetModule } from './fixtures.modules';

describe('MockBuilderKeepsApplicationModule:real', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [TargetModule],
  }).compileComponents());

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    const element = fixture.debugElement.query(By.directive(TargetComponent));
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
    const element = fixture.debugElement.query(By.directive(TargetComponent));
    expect(element).toBeDefined();
    expect(TestBed.get(TARGET_TOKEN)).toBeUndefined();
    expect(TestBed.get(APP_INITIALIZER)).toBeDefined();
    expect(TestBed.get(APP_ID)).toBeDefined();
  });
});
