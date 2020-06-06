import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockComponent, MockRender, ngMocks } from 'ng-mocks';

import { InternalComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';

describe('MockBuilderByDirective:real', () => {
  beforeEach(async done => {
    await TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents();
    done();
  });

  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    const element = ngMocks.find(fixture.debugElement, InternalComponent);
    expect(element).toBeDefined();
  });
});

describe('MockBuilderByDirective:mock', () => {
  beforeEach(async done => {
    await MockBuilder().mock(TargetModule);
    done();
  });

  it('should find mock', () => {
    const fixture = MockRender(InternalComponent);
    const element = ngMocks.find(fixture.debugElement, MockComponent(InternalComponent));
    expect(element).toBeDefined();
  });

  it('should find original', () => {
    const fixture = MockRender(InternalComponent);
    const element = ngMocks.find(fixture.debugElement, InternalComponent);
    expect(element).toBeDefined();
  });
});
