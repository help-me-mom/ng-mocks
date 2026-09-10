import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChild,
  Directive,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[metadataStaticItem]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class ItemDirective {}

@Component({
  selector: 'metadata-static[first], metadata-static[second]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <span *ngIf="visible" metadataStaticItem="inserted-view"></span>
    <span metadataStaticItem="initial-view"></span>
    <ng-content></ng-content>
  `,
})
class TargetComponent
  implements OnInit, AfterContentInit, AfterViewInit
{
  @Input() public visible = false;

  @ContentChild(ItemDirective, { static: true })
  public staticContent?: ItemDirective;

  @ViewChild(ItemDirective, { static: true })
  public staticView?: ItemDirective;

  public readonly contentAssignments: Array<
    ItemDirective | undefined
  > = [];
  public readonly viewAssignments: Array<ItemDirective | undefined> =
    [];
  public contentAtInit: Array<ItemDirective | undefined> = [];
  public viewAtInit: Array<ItemDirective | undefined> = [];
  public contentAfterInit?: ItemDirective;
  public viewAfterInit?: ItemDirective;

  public get dynamicContent(): ItemDirective | undefined {
    return this.contentAssignments[
      this.contentAssignments.length - 1
    ];
  }

  @ContentChild(ItemDirective, { static: false })
  public set dynamicContent(value: ItemDirective | undefined) {
    this.contentAssignments.push(value);
  }

  public get dynamicView(): ItemDirective | undefined {
    return this.viewAssignments[this.viewAssignments.length - 1];
  }

  @ViewChild(ItemDirective, { static: false })
  public set dynamicView(value: ItemDirective | undefined) {
    this.viewAssignments.push(value);
  }

  public ngOnInit(): void {
    this.contentAtInit = [this.staticContent, this.dynamicContent];
    this.viewAtInit = [this.staticView, this.dynamicView];
  }

  public ngAfterContentInit(): void {
    this.contentAfterInit = this.dynamicContent;
  }

  public ngAfterViewInit(): void {
    this.viewAfterInit = this.dynamicView;
  }
}

// Explicit static query options require Angular 8. Recompiling the complex
// selector must retain query timing without assigning the same result twice.
describe('mock-render-metadata:static-queries', () => {
  beforeEach(() =>
    MockBuilder([CommonModule, ItemDirective, TargetComponent]),
  );

  it('preserves lifecycle timing and updates only dynamic query results', () => {
    const factory = MockRenderFactory(TargetComponent, ['visible']);
    factory.configureTestBed();
    TestBed.overrideTemplate(
      factory.declaration as never,
      (factory.declaration as any).tpl.replace(
        '</',
        `<span *ngIf="visible" metadataStaticItem="inserted-content"></span>
         <span metadataStaticItem="initial-content"></span></`,
      ),
    );
    const fixture = factory({ visible: false });
    const target = fixture.point.componentInstance;
    const initialContent = ngMocks.findInstance(
      '[metadataStaticItem="initial-content"]',
      ItemDirective,
    );
    const initialView = ngMocks.findInstance(
      '[metadataStaticItem="initial-view"]',
      ItemDirective,
    );

    expect(target.contentAtInit).toEqual([initialContent, undefined]);
    expect(target.viewAtInit).toEqual([initialView, undefined]);
    expect(target.contentAfterInit).toBe(initialContent);
    expect(target.viewAfterInit).toBe(initialView);
    expect(target.contentAssignments).toEqual([initialContent]);
    expect(target.viewAssignments).toEqual([initialView]);

    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const insertedContent = ngMocks.findInstance(
      '[metadataStaticItem="inserted-content"]',
      ItemDirective,
    );
    const insertedView = ngMocks.findInstance(
      '[metadataStaticItem="inserted-view"]',
      ItemDirective,
    );

    expect(target.staticContent).toBe(initialContent);
    expect(target.staticView).toBe(initialView);
    expect(target.dynamicContent).toBe(insertedContent);
    expect(target.dynamicView).toBe(insertedView);
    expect(target.contentAssignments).toEqual([
      initialContent,
      insertedContent,
    ]);
    expect(target.viewAssignments).toEqual([
      initialView,
      insertedView,
    ]);

    fixture.componentInstance.visible = false;
    fixture.detectChanges();

    expect(target.staticContent).toBe(initialContent);
    expect(target.staticView).toBe(initialView);
    expect(target.dynamicContent).toBe(initialContent);
    expect(target.dynamicView).toBe(initialView);
    expect(target.contentAssignments).toEqual([
      initialContent,
      insertedContent,
      initialContent,
    ]);
    expect(target.viewAssignments).toEqual([
      initialView,
      insertedView,
      initialView,
    ]);
  });
});
