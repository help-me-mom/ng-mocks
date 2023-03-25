import {
  Component,
  Directive,
  EventEmitter,
  Input,
  NgModule,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'dependency-test-view-child',
  template: 'dependency',
})
class DependencyComponent {
  @Input() public dependency: number | null = null;

  @Output() public readonly trigger = new EventEmitter<string>();
}

@Directive({
  selector: '[dependency]',
})
class DependencyDirective {
  @Input() public dependency: number | null = null;

  @Output() public readonly trigger = new EventEmitter<string>();
}

@Component({
  selector: 'target-view-child',
  template: `
    <dependency-test-view-child
      [dependency]="0"
      (trigger)="value = $event"
    ></dependency-test-view-child>
    <div>
      <span [dependency]="1" (trigger)="value = $event">1</span>
      <span [dependency]="2" (trigger)="value = $event">2</span>
      <span [dependency]="3" (trigger)="value = $event">3</span>
    </div>
    <ng-template #tpl>
      {{ value }}
    </ng-template>
  `,
})
class TargetComponent {
  @ViewChild(DependencyComponent, {} as any)
  public component?: DependencyComponent;

  @ViewChild(DependencyComponent, {
    read: DependencyDirective,
  } as any)
  public directive?: DependencyDirective;

  @ViewChildren(DependencyDirective, {} as any)
  public directives?: QueryList<DependencyDirective>;

  @ViewChild('tpl', {} as any)
  public tpl?: TemplateRef<HTMLElement>;

  public value = '';
}

@NgModule({
  declarations: [
    DependencyComponent,
    DependencyDirective,
    TargetComponent,
  ],
  exports: [TargetComponent],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('TestViewChild', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('provides mock dependencies', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // checking @ViewChild(DependencyComponent)
    expect(component.component).toEqual(
      assertion.any(DependencyComponent),
    );
    expect(
      component.component && component.component.dependency,
    ).toEqual(0);

    // checking its read: DependencyDirective
    expect(component.directive).toEqual(
      assertion.any(DependencyDirective),
    );
    expect(
      component.directive && component.directive.dependency,
    ).toEqual(0);

    // checking TemplateRef
    expect(component.tpl).toEqual(assertion.any(TemplateRef));

    // @ViewChildren(DependencyDirective)
    if (!component.directives) {
      throw new Error('component.directives are missed');
    }
    expect(component.directives.length).toEqual(4);
    const [dir0, dir1, dir2, dir3] = component.directives.toArray();
    expect(dir0 && dir0.dependency).toEqual(0);
    expect(dir1 && dir1.dependency).toEqual(1);
    expect(dir2 && dir2.dependency).toEqual(2);
    expect(dir3 && dir3.dependency).toEqual(3);

    // asserting outputs of DependencyComponent
    expect(component.value).toEqual('');
    ngMocks
      .findInstance(DependencyComponent)
      .trigger.emit('component');
    expect(component.value).toEqual('component');

    // asserting outputs DependencyDirective
    ngMocks
      .findInstances(DependencyDirective)[0]
      .trigger.emit('dir0');
    expect(component.value).toEqual('dir0');

    ngMocks
      .findInstances(DependencyDirective)[1]
      .trigger.emit('dir1');
    expect(component.value).toEqual('dir1');

    ngMocks
      .findInstances(DependencyDirective)[2]
      .trigger.emit('dir2');
    expect(component.value).toEqual('dir2');

    ngMocks
      .findInstances(DependencyDirective)[3]
      .trigger.emit('dir3');
    expect(component.value).toEqual('dir3');
  });
});
