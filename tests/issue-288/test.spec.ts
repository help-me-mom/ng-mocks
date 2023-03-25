import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  Directive,
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
  selector: 'app-table-288',
  template: ` <div *ngFor="let item of data">
    <ng-container
      *ngTemplateOutlet="cell.el; context: { $implicit: item }"
    ></ng-container>
  </div>`,
})
class TableComponent {
  @ContentChild(CellDirective, {} as any) public cell?: CellDirective;
  @Input() public data: any[] = [];
}

@Component({
  selector: 'app-root-288',
  template: ` <app-table-288 [data]="data">
    <ng-template appCell let-item>
      <div class="custom-data-element">Data: {{ item.data }}</div>
    </ng-template>
  </app-table-288>`,
})
class AppComponent {
  public data = [{ data: 1 }, { data: 2 }];
}

@NgModule({
  declarations: [AppComponent, TableComponent, CellDirective],
  imports: [CommonModule],
})
class AppModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/288
describe('issue-288:real', () => {
  beforeEach(() => MockBuilder(AppComponent).keep(AppModule));

  it('renders the desired viewChild', () => {
    const fixture = MockRender(AppComponent);

    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-element">Data: 1</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-element">Data: 2</div>',
    );
  });
});

// @see https://github.com/help-me-mom/ng-mocks/issues/288
describe('issue-288:mock', () => {
  beforeEach(() => MockBuilder(AppComponent, AppModule));

  it('renders the desired ContentChild', () => {
    const fixture = MockRender(AppComponent);

    const componentEl = ngMocks.find(TableComponent);
    const directive = ngMocks.findInstance(
      componentEl,
      CellDirective,
    );
    if (isMockOf(directive, CellDirective, 'd')) {
      directive.__render({ data: 3 });
      fixture.detectChanges();
    }

    expect(fixture.nativeElement.innerHTML).toContain(
      '<div class="custom-data-element">Data: 3</div>',
    );
  });
});
