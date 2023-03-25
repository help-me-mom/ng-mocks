import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  Directive,
  NgModule,
  QueryList,
  TemplateRef,
} from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[appCell]',
})
class CellDirective {
  public constructor(public el?: TemplateRef<any>) {}
}

@Component({
  selector: 'app-table-mock-component-render-content-children-groups',
  template: `
    <ng-container *ngFor="let tpl of templates">
      <ng-container
        *ngTemplateOutlet="tpl; context: { $implicit: 'real' }"
      ></ng-container>
    </ng-container>
  `,
})
class TableComponent {
  @ContentChildren(CellDirective, {
    read: TemplateRef,
  } as any)
  public templates?: QueryList<TemplateRef<CellDirective>>;
}

@Component({
  selector: 'app-root-mock-component-render-content-children-groups',
  template: ` <app-table-mock-component-render-content-children-groups>
    <ng-template appCell let-item>
      <div class="custom-data-1">1: {{ item }}</div>
    </ng-template>
    <ng-template appCell let-item>
      <div class="custom-data-2">2: {{ item }}</div>
    </ng-template>
    <ng-template appCell let-item>
      <div class="custom-data-3">3: {{ item }}</div>
    </ng-template>
  </app-table-mock-component-render-content-children-groups>`,
})
class AppComponent {}

@NgModule({
  declarations: [AppComponent, TableComponent, CellDirective],
  imports: [CommonModule],
})
class AppModule {}

describe('mock-component-render:content-children-groups:real', () => {
  beforeEach(() => MockBuilder(AppComponent).keep(AppModule));

  it('renders the desired viewChildren', () => {
    const fixture = MockRender(AppComponent);

    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-1">1: real</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-2">2: real</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-3">3: real</div>',
    );
  });
});

describe('mock-component-render:content-children:mock', () => {
  beforeEach(() => MockBuilder(AppComponent, AppModule));

  it('renders the desired ContentChildren', () => {
    const fixture = MockRender(AppComponent);
    const table = ngMocks.findInstance(TableComponent);

    // default state
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-1">1: mock</div>',
    );
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-2">2: mock</div>',
    );
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-3">3: mock</div>',
    );

    // rendering elements 0 and 2, 1 should stay hidden
    if (isMockOf(table, TableComponent, 'c')) {
      table.__render(['templates', 0, 2], 'mock');
    }
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-1">1: mock</div>',
    );
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-2">2: mock</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-3">3: mock</div>',
    );

    // rendering the element 1, all should be displayed
    if (isMockOf(table, TableComponent, 'c')) {
      table.__render(['templates', 1], 'mock:1');
    }
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-1">1: mock</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-2">2: mock:1</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-3">3: mock</div>',
    );

    // rendering the element 2 with new context
    if (isMockOf(table, TableComponent, 'c')) {
      table.__render(['templates', 2], 'mock:2');
    }
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-1">1: mock</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-2">2: mock:1</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-3">3: mock:2</div>',
    );

    // hiding elements 0 and 2, 1 should stay visible
    if (isMockOf(table, TableComponent, 'c')) {
      table.__hide(['templates', 0, 2]);
    }
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-1">1: mock</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-2">2: mock:1</div>',
    );
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-3">3: mock:2</div>',
    );

    // hiding the last element
    if (isMockOf(table, TableComponent, 'c')) {
      table.__hide(['templates', 1]);
    }
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-1">1: mock</div>',
    );
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-2">2: mock:1</div>',
    );
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-3">3: mock:2</div>',
    );
    // block should be visible, because we hid only elements
    expect(ngMocks.find('[data-prop="templates"]')).toBeDefined();

    // hiding the block
    if (isMockOf(table, TableComponent, 'c')) {
      table.__hide(['templates']);
    }
    // block should be hidden
    expect(
      ngMocks.find('[data-prop="templates"]', undefined),
    ).toBeUndefined();

    // renders all
    if (isMockOf(table, TableComponent, 'c')) {
      table.__render(['templates'], 'all');
    }
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-1">1: all</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-2">2: all</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-3">3: all</div>',
    );

    // hides in the middle, and does not double the last one
    if (isMockOf(table, TableComponent, 'c')) {
      table.__hide(['templates', 1]);
    }
    expect(ngMocks.findAll('.custom-data-1').length).toEqual(1);
    expect(ngMocks.findAll('.custom-data-2').length).toEqual(0);
    expect(ngMocks.findAll('.custom-data-3').length).toEqual(1);
  });
});
