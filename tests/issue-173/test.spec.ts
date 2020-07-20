import { Directive, NgModule } from '@angular/core';
import { MockBuilder } from 'ng-mocks';
import { MockRender } from 'ng-mocks/dist/lib/mock-render/mock-render';

@Directive({
  selector: 'child',
})
class ChildDirective {}

@Directive({
  // this def of an existing directive breaks ng-mocks.
  providers: [
    {
      provide: ChildDirective,
      useValue: undefined,
    },
  ],
  selector: 'parent',
})
class ParentDirective {}

@NgModule({
  declarations: [ParentDirective, ChildDirective],
  exports: [ParentDirective, ChildDirective],
})
class TargetModule {}

// Declarations and providers should be cached in different buckets.
// Because when we mock a declaration we get a mocked class, but
// when we mock a provider we get a mocked instance.
describe('issue-173', () => {
  beforeEach(() => MockBuilder().mock(TargetModule));

  it('should render w/o an error', () => {
    expect(() => MockRender('ng-mocks')).not.toThrow();
  });
});
