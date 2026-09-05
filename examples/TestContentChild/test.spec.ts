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

describe('TestContentChild', () => {
  MockInstance.scope();

  it('queries projected mocks and customizes them before content initialization', async () => {
    await MockBuilder(TargetComponent, TargetModule);
    MockInstance(
      ChildComponent,
      'value$',
      new Observable<string>(subscriber => {
        subscriber.next('mock value');
        subscriber.complete();
      }),
    );

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

    expect(target.child).toBe(child);
    expect(isMockOf(child, ChildComponent)).toBe(true);
    expect(child.label).toBe('projected');
    expect(target.value).toBe('mock value');
    expect(target.directive).toBe(items[0]);
    expect(target.element && target.element.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );
    expect(target.tpl && target.tpl.elementRef.nativeElement).toBe(
      ngMocks.findTemplateRef('tpl').elementRef.nativeElement,
    );
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

    child.selected.emit('chosen');
    expect(fixture.componentInstance.selected).toBe('chosen');
    expect(ngMocks.formatText(fixture)).not.toContain('real child');
  });

  it('leaves a missing child undefined and a missing collection empty', async () => {
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
    await MockBuilder().mock(TargetComponent);
    const fixture = MockRender(
      '<target-content><ng-template #tpl let-value>value: {{ value }}</ng-template></target-content>',
    );
    const target = ngMocks.findInstance(TargetComponent);
    const template = ngMocks.findTemplateRef('tpl');

    expect(target.tpl && target.tpl.elementRef.nativeElement).toBe(
      template.elementRef.nativeElement,
    );
    expect(ngMocks.formatText(fixture)).toBe('');

    ngMocks.render(target, template, 'rendered');
    expect(ngMocks.formatText(fixture)).toBe('value: rendered');

    ngMocks.hide(target, template);
    expect(ngMocks.formatText(fixture)).toBe('');
  });
});
