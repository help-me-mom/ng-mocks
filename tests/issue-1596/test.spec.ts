import {
  Component,
  ComponentFactoryResolver,
  NgModule,
  Optional,
  ViewContainerRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockBuilder, ngMocks } from 'ng-mocks';

@Component({
  selector: 'parent',
  template: '<div #parent>parent</div>',
})
class ParentComponent {
  public constructor(
    viewContainerRef: ViewContainerRef,
    @Optional() componentFactoryResolver: ComponentFactoryResolver,
  ) {
    const vcr: any = viewContainerRef;
    if (componentFactoryResolver) {
      const factory =
        componentFactoryResolver.resolveComponentFactory(
          ChildComponent,
        );
      vcr.createComponent(factory);
    } else if (vcr.createComponent) {
      vcr.createComponent(ChildComponent);
    }
  }
}

@Component({
  selector: 'child',
  template: '<span #child>child</span>',
})
class ChildComponent {}

@NgModule({
  declarations: [ParentComponent, ChildComponent],
  entryComponents: [ChildComponent],
})
class TargetModule {}

// It's a tricky thing, because it behaves like that in Ivy only.
// But even in Ivy, it doesn't render the child component properly.
describe('issue-1596', () => {
  beforeEach(() => MockBuilder(ParentComponent, TargetModule));

  it('finds child component', () => {
    const fixture = TestBed.createComponent(ParentComponent);
    fixture.detectChanges();
    const expectedEl = fixture.debugElement.query(
      By.directive(ChildComponent),
    );
    const expectedInstance = expectedEl
      ? expectedEl.componentInstance
      : null;

    expect(ngMocks.findInstance(ChildComponent, null)).toBe(
      expectedInstance,
    );
  });
});
