import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  Directive,
  Input,
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
  selector: 'app-table-mock-component-render-content-children',
  template: ` <div *ngFor="let item of data">
    <ng-container *ngFor="let cell of cells">
      <ng-container
        *ngTemplateOutlet="cell.el; context: { $implicit: item }"
      ></ng-container>
    </ng-container>
  </div>`,
})
class TableComponent {
  @ContentChildren('cell', {
    read: CellDirective,
  } as any)
  public cells?: QueryList<CellDirective>;

  @Input() public data: any[] = [];

  @ContentChildren(CellDirective, {
    read: TemplateRef,
  } as any)
  public declarationTpls?: QueryList<TemplateRef<CellDirective>>;

  @ContentChildren('div', {} as any)
  public divs?: QueryList<any>; // TODO replace with ElementRef<HTMLElement> when A5 dies

  @ContentChildren('cell', {
    read: TemplateRef,
  } as any)
  public idTpls?: QueryList<TemplateRef<CellDirective>>;
}

@Component({
  selector: 'app-root-mock-component-render-content-children',
  template: ` <app-table-mock-component-render-content-children
    [data]="data"
  >
    <ng-template appCell let-item #cell>
      <div class="custom-data-element">Data: {{ item.data }}</div>
    </ng-template>
    <span #div>hello here</span>
  </app-table-mock-component-render-content-children>`,
})
class AppComponent {
  public data = [{ data: 1 }, { data: 2 }];
}

@NgModule({
  declarations: [AppComponent, TableComponent, CellDirective],
  imports: [CommonModule],
})
class AppModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('mock-component-render:content-children:real', () => {
  beforeEach(() => MockBuilder(AppComponent).keep(AppModule));

  it('renders the desired viewChildren', () => {
    const fixture = MockRender(AppComponent);
    const table = ngMocks.findInstance(TableComponent);

    // id can find templates and ElementRef
    expect(table.divs).toEqual(assertion.any(QueryList));

    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-element">Data: 1</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-element">Data: 2</div>',
    );
  });
});

describe('mock-component-render:content-children:mock', () => {
  beforeEach(() => MockBuilder(AppComponent, AppModule));

  it('renders the desired ContentChildren', () => {
    const fixture = MockRender(AppComponent);
    const table = ngMocks.findInstance(TableComponent);

    // checking by a selector via declaration with read
    if (isMockOf(table, TableComponent, 'c')) {
      table.__render(['declarationTpls'], { data: 4 });
    }
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-element">Data: 4</div>',
    );
    if (isMockOf(table, TableComponent, 'c')) {
      table.__hide(['declarationTpls']);
    }
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-element">Data: 4</div>',
    );

    // checking by a selector via id with read
    if (isMockOf(table, TableComponent, 'c')) {
      table.__render(['idTpls'], { data: 5 });
    }
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-element">Data: 5</div>',
    );
    if (isMockOf(table, TableComponent, 'c')) {
      table.__hide(['idTpls']);
    }
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-element">Data: 5</div>',
    );
  });
});
