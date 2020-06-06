import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockModule, MockRender } from 'ng-mocks';

import { ExternalComponent, InternalComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';

describe('InternalVsExternal:real', () => {
  beforeEach(async done => {
    await TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents();
    done();
  });

  it('should render', () => {
    const fixture = MockRender(ExternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toContain('external <internal-component>internal</internal-component>');

    expect(() => {
      MockRender(InternalComponent);
      TestBed.get(InternalComponent); // Thanks Ivy True, it doesn't throw an error and we have to use injector.
    }).toThrowError();
  });
});

describe('InternalVsExternal:mock', () => {
  beforeEach(async done => {
    await MockBuilder().mock(TargetModule);
    done();
  });

  // The expectation is to see that ExternalComponent was exported and InternalComponent wasn't.
  it('should render', () => {
    const fixture = MockRender(ExternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toEqual('<external-component></external-component>');

    expect(() => {
      MockRender(InternalComponent);
      TestBed.get(InternalComponent); // Thanks Ivy True, it doesn't throw an error and we have to use injector.
    }).toThrowError();
  });
});

describe('InternalVsExternal:legacy', () => {
  beforeEach(async done => {
    await TestBed.configureTestingModule({
      imports: [MockModule(TargetModule)],
    }).compileComponents();
    done();
  });

  it('should render', () => {
    const fixture = MockRender(ExternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toEqual('<external-component></external-component>');

    // the code below will fail because the MockModule outside of the MockBuilder exports everything.
    // try {
    //   MockRender(InternalComponent);
    //   fail('should fail on the internal component');
    // } catch (e) {
    //   expect(e).toEqual(jasmine.objectContaining({ngSyntaxError: true}));
    // }
  });
});
