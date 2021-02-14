import { Component, NgModule } from '@angular/core';
import {
  MatHeaderRowDef,
  MatRowDef,
  MatTableModule,
} from '@angular/material/table';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

export interface PeriodicElement {
  name: string;
  position: number;
  symbol: string;
  weight: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
];

@Component({
  selector: 'target',
  template: `
    <table mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="position">
        <th mat-header-cell *matHeaderCellDef>No.</th>
        <td mat-cell *matCellDef="let element">
          {{ element.position }}
        </td>
      </ng-container>

      <!-- Name Column -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let element">{{ element.name }}</td>
      </ng-container>

      <!-- Weight Column -->
      <ng-container matColumnDef="weight">
        <th mat-header-cell *matHeaderCellDef>Weight</th>
        <td mat-cell *matCellDef="let element">
          {{ element.weight }}
        </td>
      </ng-container>

      <!-- Symbol Column -->
      <ng-container matColumnDef="symbol">
        <th mat-header-cell *matHeaderCellDef>Symbol</th>
        <td mat-cell *matCellDef="let element">
          {{ element.symbol }}
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: displayedColumns"
      ></tr>
    </table>
  `,
})
class TargetComponent {
  public dataSource = ELEMENT_DATA;
  public displayedColumns: string[] = [];

  public constructor() {
    this.displayedColumns.length = 24;
    this.displayedColumns.fill('filler');

    this.displayedColumns[0] = 'position';
    this.displayedColumns[1] = 'name';
    this.displayedColumns[22] = 'weight';
    this.displayedColumns[23] = 'symbol';
  }
}

@NgModule({
  declarations: [TargetComponent],
  imports: [MatTableModule],
})
class TargetModule {}

describe('mat-table:props', () => {
  ngMocks.faster();

  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('binds inputs', () => {
    const targetComponent = MockRender(TargetComponent).point
      .componentInstance;
    const tableEl = ngMocks.find('[mat-table]');

    expect(ngMocks.input(tableEl, 'dataSource')).toBe(
      targetComponent.dataSource,
    );
  });

  it('provides correct template for matColumnDef="position"', () => {
    MockRender(TargetComponent);
    const tableEl = ngMocks.find('[mat-table]');

    expect(tableEl.nativeElement.innerHTML).not.toContain(
      '<th mat-header-cell="">No.</th>',
    );
    const [header] = ngMocks.findTemplateRefs(tableEl, [
      'matHeaderCellDef',
    ]);
    ngMocks.render(tableEl.componentInstance, header);
    expect(tableEl.nativeElement.innerHTML).toContain(
      '<th mat-header-cell="">No.</th>',
    );

    expect(tableEl.nativeElement.innerHTML).not.toContain(
      '<td mat-cell=""> testPosition </td>',
    );
    const [cell] = ngMocks.findTemplateRefs(tableEl, ['matCellDef']);
    ngMocks.render(tableEl.componentInstance, cell, {
      position: 'testPosition',
    });
    expect(tableEl.nativeElement.innerHTML).toContain(
      '<td mat-cell=""> testPosition </td>',
    );
  });

  it('provides correct template for matColumnDef="name"', () => {
    MockRender(TargetComponent);
    const tableEl = ngMocks.find('[mat-table]');

    expect(tableEl.nativeElement.innerHTML).not.toContain(
      '<th mat-header-cell="">Name</th>',
    );
    const [, header] = ngMocks.findTemplateRefs(tableEl, [
      'matHeaderCellDef',
    ]);
    ngMocks.render(tableEl.componentInstance, header);
    expect(tableEl.nativeElement.innerHTML).toContain(
      '<th mat-header-cell="">Name</th>',
    );

    expect(tableEl.nativeElement.innerHTML).not.toContain(
      '<td mat-cell="">testName</td>',
    );
    const [, cell] = ngMocks.findTemplateRefs(tableEl, [
      'matCellDef',
    ]);
    ngMocks.render(tableEl.componentInstance, cell, {
      name: 'testName',
    });
    expect(tableEl.nativeElement.innerHTML).toContain(
      '<td mat-cell="">testName</td>',
    );
  });

  it('provides correct template for matColumnDef="weight"', () => {
    MockRender(TargetComponent);
    const tableEl = ngMocks.find('[mat-table]');

    expect(tableEl.nativeElement.innerHTML).not.toContain(
      '<th mat-header-cell="">Weight</th>',
    );
    const [, , header] = ngMocks.findTemplateRefs(tableEl, [
      'matHeaderCellDef',
    ]);
    ngMocks.render(tableEl.componentInstance, header);
    expect(tableEl.nativeElement.innerHTML).toContain(
      '<th mat-header-cell="">Weight</th>',
    );

    expect(tableEl.nativeElement.innerHTML).not.toContain(
      '<td mat-cell=""> testWeight </td>',
    );
    const [, , cell] = ngMocks.findTemplateRefs(tableEl, [
      'matCellDef',
    ]);
    ngMocks.render(tableEl.componentInstance, cell, {
      weight: 'testWeight',
    });
    expect(tableEl.nativeElement.innerHTML).toContain(
      '<td mat-cell=""> testWeight </td>',
    );
  });

  it('provides correct template for matColumnDef="symbol"', () => {
    MockRender(TargetComponent);
    const tableEl = ngMocks.find('[mat-table]');

    expect(tableEl.nativeElement.innerHTML).not.toContain(
      '<th mat-header-cell="">Symbol</th>',
    );
    const [, , , header] = ngMocks.findTemplateRefs(tableEl, [
      'matHeaderCellDef',
    ]);
    ngMocks.render(tableEl.componentInstance, header);
    expect(tableEl.nativeElement.innerHTML).toContain(
      '<th mat-header-cell="">Symbol</th>',
    );

    expect(tableEl.nativeElement.innerHTML).not.toContain(
      '<td mat-cell=""> testSymbol </td>',
    );
    const [, , , cell] = ngMocks.findTemplateRefs(tableEl, [
      'matCellDef',
    ]);
    ngMocks.render(tableEl.componentInstance, cell, {
      symbol: 'testSymbol',
    });
    expect(tableEl.nativeElement.innerHTML).toContain(
      '<td mat-cell=""> testSymbol </td>',
    );
  });

  it('provides correct template for mat-header-row', () => {
    const targetComponent = MockRender(TargetComponent).point
      .componentInstance;
    const tableEl = ngMocks.find('[mat-table]');

    const header = ngMocks.findInstance(tableEl, MatHeaderRowDef);
    expect(header.columns).toBe(targetComponent.displayedColumns);
    expect(tableEl.nativeElement.innerHTML).not.toContain(
      '<tr mat-header-row=""></tr>',
    );
    ngMocks.render(tableEl.componentInstance, header);
    expect(tableEl.nativeElement.innerHTML).toContain(
      '<tr mat-header-row=""></tr>',
    );
  });

  it('provides correct template for mat-row', () => {
    const targetComponent = MockRender(TargetComponent).point
      .componentInstance;
    const tableEl = ngMocks.find('[mat-table]');

    const row = ngMocks.findInstance(tableEl, MatRowDef);
    expect(row.columns).toBe(targetComponent.displayedColumns);
    expect(tableEl.nativeElement.innerHTML).not.toContain(
      '<tr mat-row=""></tr>',
    );
    ngMocks.render(tableEl.componentInstance, row);
    expect(tableEl.nativeElement.innerHTML).toContain(
      '<tr mat-row=""></tr>',
    );
  });
});
