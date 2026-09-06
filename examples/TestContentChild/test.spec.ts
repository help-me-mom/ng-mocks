import {
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  Output,
  QueryList,
  TemplateRef,
} from '@angular/core';
import { Observable } from 'rxjs';

import {
  isMockOf,
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'child-content',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real child',
})
class ChildComponent {
  @Input() public label = '';
  @Output() public readonly selected = new EventEmitter<string>();
  public readonly value$ = new Observable<string>(subscriber => {
    subscriber.next('real value');
    subscriber.complete();
  });
}

@Directive({
  selector: '[contentItem]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  exportAs: 'contentItem',
})
class ChildDirective {
  @Input() public contentItem = '';
}

// View Engine needs a directive on the group to establish the same direct-child
// query boundary as Ivy. The published Ivy example does not need this directive.
@Directive({
  selector: '[contentGroup]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class GroupDirective {}

@Component({
  selector: 'target-content',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<ng-content></ng-content>',
})
class TargetComponent implements AfterContentInit {
  @ContentChild(ChildComponent, {} as never)
  public child?: ChildComponent;

  @ContentChild('item', { read: ChildDirective } as never)
  public directive?: ChildDirective;

  @ContentChild('item', { read: ElementRef } as never)
  public element?: ElementRef;

  @ContentChild('tpl', {} as never)
  public tpl?: TemplateRef<any>;

  @ContentChildren(ChildDirective)
  public directItems?: QueryList<ChildDirective>;

  @ContentChildren(ChildDirective, { descendants: true })
  public allItems?: QueryList<ChildDirective>;

  public value = '';

  public ngAfterContentInit(): void {
    if (this.child) {
      this.child.value$.subscribe(value => {
        this.value = value;
      });
    }
  }
}

@NgModule({
  declarations: [
    ChildComponent,
    ChildDirective,
    GroupDirective,
    TargetComponent,
  ],
  exports: [
    ChildComponent,
    ChildDirective,
    GroupDirective,
    TargetComponent,
  ],
})
class TargetModule {}

// Classic @ContentChild and @ContentChildren queries. See signals.spec.ts for
// the contentChild() and contentChildren() APIs.
describe('TestContentChild', () => {
  // Reset child customizations after each test.
  MockInstance.scope();

  it('queries projected mocks and customizes them before content initialization', async () => {
    // Keep the query owner real and customize its mock child before rendering.
    await MockBuilder(TargetComponent, TargetModule);
    MockInstance(
      ChildComponent,
      'value$',
      new Observable<string>(subscriber => {
        subscriber.next('mock value');
        subscriber.complete();
      }),
    );

    // Project components, directives, and a template through the host.
    const fixture = MockRender(
      `<target-content>
        <child-content [label]="label" (selected)="selected = $event"></child-content>
        <span contentItem="direct" #item="contentItem"></span>
        <div contentGroup><span contentItem="nested"></span></div>
        <ng-template #tpl let-value>{{ value }}</ng-template>
      </target-content>`,
      { label: 'projected', selected: '' },
    );
    const target = ngMocks.findInstance(TargetComponent);
    const child = ngMocks.findInstance(ChildComponent);
    const items = ngMocks.findInstances(ChildDirective);

    // Assert the query result, input binding, and initialization behavior.
    expect(target.child).toBe(child);
    expect(isMockOf(child, ChildComponent)).toBe(true);
    expect(child.label).toBe('projected');
    expect(target.value).toBe('mock value');
    // Check read tokens and the projected template reference.
    expect(target.directive).toBe(items[0]);
    expect(target.element && target.element.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );
    expect(target.tpl && target.tpl.elementRef.nativeElement).toBe(
      ngMocks.findTemplateRef('tpl').elementRef.nativeElement,
    );
    // Compare the direct children with the full descendant collection.
    expect(
      target.directItems && target.directItems.toArray(),
    ).toEqual([items[0]]);
    expect(target.allItems && target.allItems.toArray()).toEqual(
      items,
    );
    expect(items.map(item => item.contentItem)).toEqual([
      'direct',
      'nested',
    ]);

    // Emit through the mock child and check the host's output binding.
    child.selected.emit('chosen');
    expect(fixture.componentInstance.selected).toBe('chosen');
    expect(ngMocks.formatText(fixture)).not.toContain('real child');
  });

  it('leaves a missing child undefined and a missing collection empty', async () => {
    // Declaring dependencies does not create projected child instances.
    await MockBuilder(TargetComponent, TargetModule);
    MockRender(TargetComponent);
    const target = ngMocks.findInstance(TargetComponent);

    expect(target.child).toBeUndefined();
    expect(target.directive).toBeUndefined();
    expect(target.tpl).toBeUndefined();
    expect(
      target.directItems ? target.directItems.length : undefined,
    ).toBe(0);
    expect(target.allItems ? target.allItems.length : undefined).toBe(
      0,
    );
    expect(target.value).toBe('');
  });

  it('renders a projected template when its query owner is mocked', async () => {
    // Mock the component that receives the caller's template.
    await MockBuilder().mock(TargetComponent);
    const fixture = MockRender(
      '<target-content><ng-template #tpl let-value>value: {{ value }}</ng-template></target-content>',
    );
    const target = ngMocks.findInstance(TargetComponent);
    const template = ngMocks.findTemplateRef('tpl');

    // The query finds the template, which is initially unrendered.
    expect(target.tpl && target.tpl.elementRef.nativeElement).toBe(
      template.elementRef.nativeElement,
    );
    expect(ngMocks.formatText(fixture)).toBe('');

    // Supply the implicit value and check the caller's rendered content.
    ngMocks.render(target, template, 'rendered');
    expect(ngMocks.formatText(fixture)).toBe('value: rendered');

    // Hide the template and check that its content has been removed.
    ngMocks.hide(target, template);
    expect(ngMocks.formatText(fixture)).toBe('');
  });
});
