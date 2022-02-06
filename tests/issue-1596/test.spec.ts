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

    try {
      vcr.createComponent(ChildComponent);
    } catch (e) {
      const factory =
        componentFactoryResolver.resolveComponentFactory(
          ChildComponent,
        );
      vcr.createComponent(factory);
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
    const fixture1 = TestBed.createComponent(ParentComponent);
    fixture1.detectChanges();
    const expectedEl1 = fixture1.debugElement.query(
      By.directive(ChildComponent),
    );
    const expectedInstance1 = expectedEl1
      ? expectedEl1.componentInstance
      : null;

    expect(ngMocks.findInstance(fixture1, ChildComponent, null)).toBe(
      expectedInstance1,
    );

    const fixture2 = TestBed.createComponent(ParentComponent);
    fixture2.detectChanges();
    const expectedEl2 = fixture2.debugElement.query(
      By.directive(ChildComponent),
    );
    const expectedInstance2 = expectedEl2
      ? expectedEl2.componentInstance
      : null;

    expect(ngMocks.findInstance(fixture2, ChildComponent, null)).toBe(
      expectedInstance2,
    );
  });
});
