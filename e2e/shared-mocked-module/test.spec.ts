import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockBuilder, MockedComponent, MockRender } from 'ng-mocks';

import { MyComponent, TargetComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';

describe('SharedMockedModule:real', () => {
  beforeEach(async (done) => {
    await TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents();
    done();
  });

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content)
      .toContain('<child-1-component>child:1 <my-component>real content</my-component></child-1-component>');
    expect(content)
      .toContain('<child-2-component>child:2 <my-component>real content</my-component></child-2-component>');
  });
});

describe('SharedMockedModule:mock', () => {
  beforeEach(async (done) => {
    await MockBuilder(TargetComponent)
      .keep(TargetModule)
      .mock(MyComponent)
    ;
    done();
  });

  // The expectation is to verify that only MyComponent was mocked, even it was deeply nested.
  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    const component = fixture.debugElement.query(By.directive(MyComponent))
      .componentInstance as MockedComponent<MyComponent>;
    expect(component).toBeDefined();
    expect(content).toContain('<child-1-component>child:1 <my-component></my-component></child-1-component>');
    expect(content).toContain('<child-2-component>child:2 <my-component></my-component></child-2-component>');
  });
});
