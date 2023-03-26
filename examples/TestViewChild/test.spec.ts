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
  selector: 'child',
  template: 'child',
})
class ChildComponent {
  @Input() public child: number | null = null;

  @Output() public readonly trigger = new EventEmitter<string>();

  public childTestViewChild() {}
}

@Directive({
  selector: '[child]',
})
class ChildDirective {
  @Input() public child: number | null = null;

  @Output() public readonly trigger = new EventEmitter<string>();
}

@Component({
  selector: 'target',
  template: `
    <child [child]="0" (trigger)="value = $event"></child>
    <div>
      <span [child]="1" (trigger)="value = $event">1</span>
      <span [child]="2" (trigger)="value = $event">2</span>
      <span [child]="3" (trigger)="value = $event">3</span>
    </div>
    <ng-template #tpl>
      {{ value }}
    </ng-template>
  `,
})
class TargetComponent {
  @ViewChild(ChildComponent, {} as any)
  public component?: ChildComponent;

  @ViewChild(ChildComponent, {
    read: ChildDirective,
  } as any)
  public directive?: ChildDirective;

  @ViewChildren(ChildDirective, {} as any)
  public directives?: QueryList<ChildDirective>;

  @ViewChild('tpl', {} as any)
  public tpl?: TemplateRef<HTMLElement>;

  public value = '';

  public targetTestViewChild() {}
}

@NgModule({
  declarations: [ChildComponent, ChildDirective, TargetComponent],
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

    // checking @ViewChild(ChildComponent)
    expect(component.component).toEqual(
      assertion.any(ChildComponent),
    );
    expect(component.component && component.component.child).toEqual(
      0,
    );

    // checking its read: ChildDirective
    expect(component.directive).toEqual(
      assertion.any(ChildDirective),
    );
    expect(component.directive && component.directive.child).toEqual(
      0,
    );

    // checking TemplateRef
    expect(component.tpl).toEqual(assertion.any(TemplateRef));

    // @ViewChildren(ChildDirective)
    if (!component.directives) {
      throw new Error('component.directives are missed');
    }
    expect(component.directives.length).toEqual(4);
    const [dir0, dir1, dir2, dir3] = component.directives.toArray();
    expect(dir0 && dir0.child).toEqual(0);
    expect(dir1 && dir1.child).toEqual(1);
    expect(dir2 && dir2.child).toEqual(2);
    expect(dir3 && dir3.child).toEqual(3);

    // asserting outputs of ChildComponent
    expect(component.value).toEqual('');
    ngMocks.findInstance(ChildComponent).trigger.emit('component');
    expect(component.value).toEqual('component');

    // asserting outputs ChildDirective
    ngMocks.findInstances(ChildDirective)[0].trigger.emit('dir0');
    expect(component.value).toEqual('dir0');

    ngMocks.findInstances(ChildDirective)[1].trigger.emit('dir1');
    expect(component.value).toEqual('dir1');

    ngMocks.findInstances(ChildDirective)[2].trigger.emit('dir2');
    expect(component.value).toEqual('dir2');

    ngMocks.findInstances(ChildDirective)[3].trigger.emit('dir3');
    expect(component.value).toEqual('dir3');
  });
});
