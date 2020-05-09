import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

import { InternalComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';

describe('InternalOnly:real', () => {
  beforeEach(async done => {
    await TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents();
    done();
  });

  it('should render', () => {
    try {
      MockRender(InternalComponent);
      fail('should fail on the internal component');
    } catch (e) {
      expect(e).toEqual(jasmine.objectContaining({ ngSyntaxError: true }));
    }
  });
});

describe('InternalOnly:mock', () => {
  beforeEach(async done => {
    await MockBuilder().mock(TargetModule).mock(InternalComponent, { export: true });
    done();
  });

  // The expectation is to see that InternalComponent was exported and can be accessed from the test.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toEqual('<internal-component></internal-component>');
  });
});
