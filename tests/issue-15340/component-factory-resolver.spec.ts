import {
  Component,
  ComponentFactoryResolver,
  Injectable,
  ViewContainerRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockedNgDefOf,
  isMockOf,
  MockBuilder,
  ngMocks,
} from 'ng-mocks';

let realConstructorCalls = 0;

@Injectable()
@Component({
  selector: 'factory-child-15340',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real child',
})
class ChildComponent {
  public constructor() {
    realConstructorCalls += 1;
  }
}

@Component({
  selector: 'factory-host-15340',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class HostComponent {
  public constructor(
    public readonly resolver: ComponentFactoryResolver,
    public readonly container: ViewContainerRef,
  ) {}
}

// ComponentFactoryResolver is available through Angular 21.
// @see https://github.com/help-me-mom/ng-mocks/issues/15340
describe('issue-15340:component-factory-resolver', () => {
  beforeEach(() => {
    ngMocks.reset();
    realConstructorCalls = 0;

    return MockBuilder(HostComponent).mock(ChildComponent);
  });
  afterEach(() => ngMocks.reset());

  it('resolves the mock factory when the component is also injectable', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    // The resolver needs the mock declaration, rather than its provider recipe.
    const factory =
      fixture.componentInstance.resolver.resolveComponentFactory(
        ChildComponent,
      );
    expect(
      isMockedNgDefOf(factory.componentType, ChildComponent, 'c'),
    ).toBe(true);

    const child =
      fixture.componentInstance.container.createComponent(factory);
    child.changeDetectorRef.detectChanges();

    expect(isMockOf(child.instance, ChildComponent)).toBe(true);
    expect(realConstructorCalls).toBe(0);
    expect(child.location.nativeElement.textContent).toBe('');
  });
});
