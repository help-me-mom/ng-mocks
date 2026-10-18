import {
  Component,
  Injectable,
  ViewContainerRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockBuilder, ngMocks } from 'ng-mocks';

let realConstructorCalls = 0;
let replacementConstructorCalls = 0;

@Injectable()
@Component({
  selector: 'dynamic-child-15340',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real child',
})
class ChildComponent {
  public constructor() {
    realConstructorCalls += 1;
  }
}

@Injectable()
@Component({
  selector: 'dynamic-child-15340',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'replacement child',
})
class ReplacementComponent {
  public constructor() {
    replacementConstructorCalls += 1;
  }
}

@Component({
  selector: 'dynamic-host-15340',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class HostComponent {
  public constructor(public readonly container: ViewContainerRef) {}
}

// The component-type createComponent overload requires Angular 13.
// @see https://github.com/help-me-mom/ng-mocks/issues/15340
describe('issue-15340:dynamic-component', () => {
  beforeEach(() => {
    ngMocks.reset();
    realConstructorCalls = 0;
    replacementConstructorCalls = 0;
  });
  afterEach(() => ngMocks.reset());

  it('creates the mock component when the declaration is also injectable', async () => {
    await MockBuilder(HostComponent).mock(ChildComponent);

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    // The provider recipe must not replace the declaration passed to Angular.
    const child =
      fixture.componentInstance.container.createComponent(
        ChildComponent,
      );
    child.changeDetectorRef.detectChanges();

    expect(isMockOf(child.instance, ChildComponent)).toBe(true);
    expect(realConstructorCalls).toBe(0);
    expect(child.location.nativeElement.textContent).toBe('');
  });

  it('preserves a kept injectable component during dynamic creation', async () => {
    await MockBuilder(HostComponent).keep(ChildComponent);

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const child =
      fixture.componentInstance.container.createComponent(
        ChildComponent,
      );
    child.changeDetectorRef.detectChanges();

    expect(child.instance.constructor).toBe(ChildComponent);
    expect(isMockOf(child.instance, ChildComponent)).toBe(false);
    expect(realConstructorCalls).toBe(1);
    expect(replacementConstructorCalls).toBe(0);
    expect(child.location.nativeElement.textContent).toBe(
      'real child',
    );
  });

  it('preserves an injectable replacement during dynamic creation', async () => {
    await MockBuilder(HostComponent).replace(
      ChildComponent,
      ReplacementComponent,
    );

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const child =
      fixture.componentInstance.container.createComponent(
        ChildComponent,
      );
    child.changeDetectorRef.detectChanges();

    expect(child.instance.constructor).toBe(ReplacementComponent);
    expect(realConstructorCalls).toBe(0);
    expect(replacementConstructorCalls).toBe(1);
    expect(child.location.nativeElement.textContent).toBe(
      'replacement child',
    );
  });
});
