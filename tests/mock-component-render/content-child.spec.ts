import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  Directive,
  ElementRef,
  Input,
  NgModule,
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
  selector: 'app-table-mock-component-render-content-child',
  template: ` <div *ngFor="let item of data">
    <ng-container
      *ngTemplateOutlet="cell.el; context: { $implicit: item }"
    ></ng-container>
  </div>`,
})
class TableComponent {
  @ContentChild('cell', {
    read: CellDirective,
  } as any)
  public cell?: CellDirective;

  @Input() public data: any[] = [];

  @ContentChild(CellDirective, {
    read: TemplateRef,
  } as any)
  public declarationTpl?: TemplateRef<CellDirective>;

  @ContentChild('div', {} as any)
  public div?: any; // TODO replace with ElementRef<HTMLElement> when A5 dies

  @ContentChild('cell', {
    read: TemplateRef,
  } as any)
  public idTpl?: TemplateRef<CellDirective>;
}

@Component({
  selector: 'app-root-mock-component-render-content-child',
  template: ` <app-table-mock-component-render-content-child
    [data]="data"
  >
    <ng-template appCell let-item #cell>
      <div class="custom-data-element">Data: {{ item.data }}</div>
    </ng-template>
    <span #div>hello here</span>
  </app-table-mock-component-render-content-child>`,
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

describe('mock-component-render:content-child:real', () => {
  beforeEach(() => MockBuilder(AppComponent).keep(AppModule));

  it('renders the desired viewChild', () => {
    const fixture = MockRender(AppComponent);
    const table = ngMocks.findInstance(TableComponent);

    // id can find templates and ElementRef
    expect(table.div).toEqual(assertion.any(ElementRef));

    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-element">Data: 1</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-element">Data: 2</div>',
    );
  });
});

describe('mock-component-render:content-child:mock', () => {
  beforeEach(() => MockBuilder(AppComponent, AppModule));

  it('renders the desired ContentChild', () => {
    const fixture = MockRender(AppComponent);
    const table = ngMocks.findInstance(TableComponent);

    // id can find templates and ElementRef
    expect(table.div).toEqual(assertion.any(ElementRef));

    // checking by id TemplateRef
    if (isMockOf(table, TableComponent, 'c')) {
      table.__render('cell', { data: 3 });
    }
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-element">Data: 3</div>',
    );
    if (isMockOf(table, TableComponent, 'c')) {
      table.__hide('cell');
    }
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-element">Data: 3</div>',
    );

    // checking by id of ElementRef
    expect(() => {
      if (isMockOf(table, TableComponent, 'c')) {
        table.__render('div', { data: 3 });
      }
    }).toThrowError('Cannot find TemplateRef');

    // checking by a selector via declaration with read
    if (isMockOf(table, TableComponent, 'c')) {
      table.__render(['declarationTpl'], { data: 4 });
    }
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-element">Data: 4</div>',
    );
    if (isMockOf(table, TableComponent, 'c')) {
      table.__hide(['declarationTpl']);
    }
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-element">Data: 4</div>',
    );

    // checking by a selector via id with read
    if (isMockOf(table, TableComponent, 'c')) {
      table.__render(['idTpl'], { data: 5 });
    }
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-element">Data: 5</div>',
    );
    if (isMockOf(table, TableComponent, 'c')) {
      table.__hide(['idTpl']);
    }
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '<div class="custom-data-element">Data: 5</div>',
    );
  });
});
