import { MockBuilder, MockComponent, MockRender, ngMocks } from 'ng-mocks';

import { MyComponent, TargetComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';

describe('SharedMockModule:real', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toContain(
      '<child-1-component>child:1 <my-component>real content</my-component></child-1-component>',
    );
    expect(content).toContain(
      '<child-2-component>child:2 <my-component>real content</my-component></child-2-component>',
    );
  });
});

describe('SharedMockModule:mock', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule).mock(MyComponent));

  // The expectation is to verify that only MyComponent was replaced with a mock copy, even it was deeply nested.
  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    const component = ngMocks.find(fixture.debugElement, MockComponent(MyComponent)).componentInstance;
    expect(component).toBeDefined();
    expect(content).toContain('<child-1-component>child:1 <my-component></my-component></child-1-component>');
    expect(content).toContain('<child-2-component>child:2 <my-component></my-component></child-2-component>');
  });
});
