import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

import { InternalComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';

describe('ExportsOnly:real', () => {
  beforeEach(async (done) => {
    await TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents();
    done();
  });

  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    expect(fixture.debugElement.nativeElement.innerHTML)
      .toContain('<internal-component>internal</internal-component>');
  });
});

describe('ExportsOnly:mock1', () => {
  beforeEach(async (done) => {
    await MockBuilder().mock(TargetModule);
    done();
  });

  // The expectation is to see that InternalModule was exported and it can be accessed from the test.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toEqual('<internal-component></internal-component>');
  });
});

describe('ExportsOnly:mock2', () => {
  beforeEach(async (done) => {
    await MockBuilder().mock(TargetModule).mock(InternalComponent);
    done();
  });

  // The expectation is to see that InternalModule was exported and it can be accessed from the test.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toEqual('<internal-component></internal-component>');
  });
});

describe('ExportsOnly:mock3', () => {
  beforeEach(async (done) => {
    await MockBuilder().keep(TargetModule);
    done();
  });

  // The expectation is to see that InternalModule was exported and it can be accessed from the test.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    expect(fixture.debugElement.nativeElement.innerHTML)
      .toContain('<internal-component>internal</internal-component>');
  });
});
