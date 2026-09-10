import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockRender,
  MockRenderFactory,
  ngMocks,
} from 'ng-mocks';

@Directive({
  selector: '[metadataParent]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class ParentDirective {
  @HostBinding('attr.data-inherited')
  @Input('publicInherited')
  public inherited = '';

  @Output('publicInheritedChanged')
  public readonly inheritedChanged = new EventEmitter<string>();

  public readonly clicks: string[] = [];

  @HostListener('click', ['$event.type'])
  public onClick(type: string): void {
    this.clicks.push(type);
  }
}

@Component({
  selector: 'metadata-component[first], metadata-component[second]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  inputs: ['declared: publicDeclared'],
  outputs: ['declaredChanged: publicDeclaredChanged'],
  host: {
    'data-static': 'component',
    '[attr.data-declared]': 'declared',
    '(metadata-event)': 'metadataEvents.push($event.type)',
  },
  template: '{{ inherited }}:{{ own }}:{{ declared }}',
})
class TargetComponent extends ParentDirective {
  @Input('publicOwn') public own = '';
  @Output('publicOwnChanged')
  public readonly ownChanged = new EventEmitter<string>();

  @HostBinding('class.active') public active = true;

  public readonly declaredAssignments: string[] = [];
  public readonly declaredChanged = new EventEmitter<string>();
  public readonly metadataEvents: string[] = [];
  public readonly enters: string[] = [];

  public get declared(): string {
    return (
      this.declaredAssignments[this.declaredAssignments.length - 1] ||
      ''
    );
  }

  public set declared(value: string) {
    this.declaredAssignments.push(value);
  }

  @HostListener('mouseenter', ['$event.type'])
  public onEnter(type: string): void {
    this.enters.push(type);
  }
}

@Directive({
  selector: '[metadataFirst], [metadataSecond]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  inputs: ['declared: publicDeclared'],
  outputs: ['declaredChanged: publicDeclaredChanged'],
  host: {
    'data-static': 'directive',
    '[attr.data-declared]': 'declared',
    '(metadata-event)': 'metadataEvents.push($event.type)',
  },
})
class TargetDirective extends ParentDirective {
  public declared = '';
  public readonly declaredChanged = new EventEmitter<string>();
  public readonly metadataEvents: string[] = [];
}

@Directive({
  selector: '[metadataItem]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  exportAs: 'metadataItem',
})
class ItemDirective {
  @Input() public metadataItem = '';
}

@Directive({
  selector: '[metadataQueries]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class QueryParentDirective {
  @ContentChild('projected', { read: ItemDirective } as never)
  public contentChild?: ItemDirective;

  @ContentChildren(ItemDirective, { descendants: true })
  public contentChildren?: QueryList<ItemDirective>;
}

@Component({
  selector: 'metadata-query[first], metadata-query[second]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <span
      *ngIf="visible"
      metadataItem="view-first"
      #view="metadataItem"
    ></span>
    <span metadataItem="view-second" #view="metadataItem"></span>
    <ng-template #viewTemplate>view template</ng-template>
    <ng-content></ng-content>
  `,
})
class QueryComponent extends QueryParentDirective {
  @Input() public visible = true;

  @ContentChild('projected', { read: ElementRef } as never)
  public contentElement?: ElementRef;

  @ContentChild('projectedTemplate', {} as never)
  public contentTemplate?: TemplateRef<any>;

  @ViewChild('view', { read: ItemDirective } as never)
  public viewChild?: ItemDirective;

  @ViewChildren(ItemDirective)
  public viewChildren?: QueryList<ItemDirective>;

  @ViewChild('view', { read: ElementRef } as never)
  public viewElement?: ElementRef;

  @ViewChild('viewTemplate', {} as never)
  public viewTemplate?: TemplateRef<any>;
}

// Complex selectors force MockRender to recompile a subclass under a synthetic
// selector. Its metadata must retain behavior without registering it twice.
describe('mock-render-metadata:decorators', () => {
  beforeEach(() =>
    MockBuilder([
      CommonModule,
      ParentDirective,
      TargetComponent,
      TargetDirective,
      ItemDirective,
      QueryParentDirective,
      QueryComponent,
    ]),
  );

  it('binds inherited, decorated and metadata-array aliases and emits each output once', () => {
    const inheritedEvents: string[] = [];
    const ownEvents: string[] = [];
    const declaredEvents: string[] = [];
    const fixture = MockRender(TargetComponent, {
      publicInherited: 'inherited',
      publicInheritedChanged: (value: string) =>
        inheritedEvents.push(value),
      publicOwn: 'own',
      publicOwnChanged: (value: string) => ownEvents.push(value),
      publicDeclared: 'declared',
      publicDeclaredChanged: (value: string) =>
        declaredEvents.push(value),
    });
    const target = fixture.point.componentInstance;

    expect(target.inherited).toBe('inherited');
    expect(target.own).toBe('own');
    expect(target.declared).toBe('declared');
    expect(target.declaredAssignments).toEqual(['declared']);
    expect(ngMocks.formatText(fixture)).toBe(
      'inherited:own:declared',
    );
    target.inheritedChanged.emit('inherited-first');
    target.ownChanged.emit('own-first');
    target.declaredChanged.emit('declared-first');

    fixture.componentInstance.publicInherited = 'updated-inherited';
    fixture.componentInstance.publicOwn = 'updated-own';
    fixture.componentInstance.publicDeclared = 'updated-declared';
    fixture.detectChanges();

    expect(target.inherited).toBe('updated-inherited');
    expect(target.own).toBe('updated-own');
    expect(target.declared).toBe('updated-declared');
    expect(target.declaredAssignments).toEqual([
      'declared',
      'updated-declared',
    ]);
    expect(ngMocks.formatText(fixture)).toBe(
      'updated-inherited:updated-own:updated-declared',
    );
    target.inheritedChanged.emit('inherited-second');
    target.ownChanged.emit('own-second');
    target.declaredChanged.emit('declared-second');
    expect(inheritedEvents).toEqual([
      'inherited-first',
      'inherited-second',
    ]);
    expect(ownEvents).toEqual(['own-first', 'own-second']);
    expect(declaredEvents).toEqual([
      'declared-first',
      'declared-second',
    ]);
  });

  it('preserves component host bindings and calls each inherited or own listener once', () => {
    const fixture = MockRender(TargetComponent, {
      publicInherited: 'inherited',
      publicDeclared: 'declared',
    });
    const target = fixture.point.componentInstance;
    const element = fixture.point.nativeElement;

    expect(element.dataset.static).toBe('component');
    expect(element.dataset.inherited).toBe('inherited');
    expect(element.dataset.declared).toBe('declared');
    expect(element.classList.contains('active')).toBe(true);

    fixture.point.triggerEventHandler('click', { type: 'click' });
    fixture.point.triggerEventHandler('mouseenter', {
      type: 'mouseenter',
    });
    fixture.point.triggerEventHandler('metadata-event', {
      type: 'metadata-event',
    });
    expect(target.clicks).toEqual(['click']);
    expect(target.enters).toEqual(['mouseenter']);
    expect(target.metadataEvents).toEqual(['metadata-event']);

    fixture.componentInstance.publicInherited = 'updated-inherited';
    fixture.componentInstance.publicDeclared = 'updated-declared';
    target.active = false;
    fixture.detectChanges();

    expect(element.dataset.inherited).toBe('updated-inherited');
    expect(element.dataset.declared).toBe('updated-declared');
    expect(element.classList.contains('active')).toBe(false);
    fixture.point.triggerEventHandler('click', { type: 'click' });
    fixture.point.triggerEventHandler('mouseenter', {
      type: 'mouseenter',
    });
    fixture.point.triggerEventHandler('metadata-event', {
      type: 'metadata-event',
    });
    expect(target.clicks).toEqual(['click', 'click']);
    expect(target.enters).toEqual(['mouseenter', 'mouseenter']);
    expect(target.metadataEvents).toEqual([
      'metadata-event',
      'metadata-event',
    ]);
  });

  it('preserves directive aliases, host metadata and inherited listeners', () => {
    const inheritedEvents: string[] = [];
    const declaredEvents: string[] = [];
    const fixture = MockRender(TargetDirective, {
      publicInherited: 'inherited',
      publicInheritedChanged: (value: string) =>
        inheritedEvents.push(value),
      publicDeclared: 'declared',
      publicDeclaredChanged: (value: string) =>
        declaredEvents.push(value),
    });
    const target = fixture.point.componentInstance;
    const element = fixture.point.nativeElement;

    expect(target.inherited).toBe('inherited');
    expect(target.declared).toBe('declared');
    expect(element.dataset.static).toBe('directive');
    expect(element.dataset.inherited).toBe('inherited');
    expect(element.dataset.declared).toBe('declared');
    target.inheritedChanged.emit('inherited-first');
    target.declaredChanged.emit('declared-first');
    fixture.point.triggerEventHandler('click', { type: 'click' });
    fixture.point.triggerEventHandler('metadata-event', {
      type: 'metadata-event',
    });

    fixture.componentInstance.publicInherited = 'updated-inherited';
    fixture.componentInstance.publicDeclared = 'updated-declared';
    fixture.detectChanges();

    expect(target.inherited).toBe('updated-inherited');
    expect(target.declared).toBe('updated-declared');
    expect(element.dataset.inherited).toBe('updated-inherited');
    expect(element.dataset.declared).toBe('updated-declared');
    target.inheritedChanged.emit('inherited-second');
    target.declaredChanged.emit('declared-second');
    fixture.point.triggerEventHandler('click', { type: 'click' });
    fixture.point.triggerEventHandler('metadata-event', {
      type: 'metadata-event',
    });
    expect(inheritedEvents).toEqual([
      'inherited-first',
      'inherited-second',
    ]);
    expect(declaredEvents).toEqual([
      'declared-first',
      'declared-second',
    ]);
    expect(target.clicks).toEqual(['click', 'click']);
    expect(target.metadataEvents).toEqual([
      'metadata-event',
      'metadata-event',
    ]);
  });

  it('preserves inherited content queries and view queries, read tokens and dynamic collections', () => {
    const factory = MockRenderFactory(QueryComponent, ['visible']);
    factory.configureTestBed();
    // Project content into the actual cloned selector generated by MockRender.
    TestBed.overrideTemplate(
      factory.declaration as never,
      (factory.declaration as any).tpl.replace(
        '</',
        `<span *ngIf="visible" metadataItem="content-first" #projected="metadataItem"></span>
         <div><span metadataItem="content-second" #projected="metadataItem"></span></div>
         <ng-template #projectedTemplate>content template</ng-template></`,
      ),
    );
    const fixture = factory({ visible: true });
    const target = fixture.point.componentInstance;
    const firstContent = ngMocks.findInstance(
      '[metadataItem="content-first"]',
      ItemDirective,
    );
    const secondContent = ngMocks.findInstance(
      '[metadataItem="content-second"]',
      ItemDirective,
    );
    const firstView = ngMocks.findInstance(
      '[metadataItem="view-first"]',
      ItemDirective,
    );
    const secondView = ngMocks.findInstance(
      '[metadataItem="view-second"]',
      ItemDirective,
    );

    expect(target.contentChild).toBe(firstContent);
    expect(target.viewChild).toBe(firstView);
    expect(
      target.contentElement && target.contentElement.nativeElement,
    ).toBe(
      ngMocks.find('[metadataItem="content-first"]').nativeElement,
    );
    expect(
      target.viewElement && target.viewElement.nativeElement,
    ).toBe(ngMocks.find('[metadataItem="view-first"]').nativeElement);
    expect(
      target.contentTemplate &&
        target.contentTemplate.elementRef.nativeElement,
    ).toBe(
      ngMocks.findTemplateRef('projectedTemplate').elementRef
        .nativeElement,
    );
    expect(
      target.viewTemplate &&
        target.viewTemplate.elementRef.nativeElement,
    ).toBe(
      ngMocks.findTemplateRef('viewTemplate').elementRef
        .nativeElement,
    );
    if (!target.contentChildren || !target.viewChildren) {
      throw new Error(
        'ContentChildren and ViewChildren were not initialized',
      );
    }
    expect(target.contentChildren.toArray()).toEqual([
      firstContent,
      secondContent,
    ]);
    expect(target.viewChildren.toArray()).toEqual([
      firstView,
      secondView,
    ]);
    const contentChanges: number[] = [];
    const viewChanges: number[] = [];
    const contentSubscription =
      target.contentChildren.changes.subscribe(
        (children: QueryList<ItemDirective>) =>
          contentChanges.push(children.length),
      );
    const viewSubscription = target.viewChildren.changes.subscribe(
      (children: QueryList<ItemDirective>) =>
        viewChanges.push(children.length),
    );

    fixture.componentInstance.visible = false;
    fixture.detectChanges();

    expect(target.contentChild).toBe(secondContent);
    expect(target.viewChild).toBe(secondView);
    expect(target.contentChildren.toArray()).toEqual([secondContent]);
    expect(target.viewChildren.toArray()).toEqual([secondView]);
    expect(contentChanges).toEqual([1]);
    expect(viewChanges).toEqual([1]);

    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const insertedContent = ngMocks.findInstance(
      '[metadataItem="content-first"]',
      ItemDirective,
    );
    const insertedView = ngMocks.findInstance(
      '[metadataItem="view-first"]',
      ItemDirective,
    );

    expect(insertedContent).not.toBe(firstContent);
    expect(insertedView).not.toBe(firstView);
    expect(target.contentChild).toBe(insertedContent);
    expect(target.viewChild).toBe(insertedView);
    expect(target.contentChildren.toArray()).toEqual([
      insertedContent,
      secondContent,
    ]);
    expect(target.viewChildren.toArray()).toEqual([
      insertedView,
      secondView,
    ]);
    expect(contentChanges).toEqual([1, 2]);
    expect(viewChanges).toEqual([1, 2]);
    contentSubscription.unsubscribe();
    viewSubscription.unsubscribe();
  });
});
