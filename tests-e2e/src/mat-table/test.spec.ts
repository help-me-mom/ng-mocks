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
    // Rendering TargetComponent and accessing its instance.
    const targetComponent =
      MockRender(TargetComponent).point.componentInstance;

    // Looking for a debug element of `MatTable`.
    const tableEl = ngMocks.reveal(['mat-table']);

    // Asserting bound properties.
    expect(ngMocks.input(tableEl, 'dataSource')).toBe(
      targetComponent.dataSource,
    );
  });

  it('provides correct template for matColumnDef="position"', () => {
    MockRender(TargetComponent);
    // looking for the table and container
    const tableEl = ngMocks.reveal(['mat-table']);
    const containerEl = ngMocks.reveal(['matColumnDef', 'position']);

    // checking that there are no artifacts around
    expect(ngMocks.formatHtml(containerEl)).toEqual('');

    // checking header
    const headerEl = ngMocks.reveal(containerEl, [
      'matHeaderCellDef',
    ]);
    ngMocks.render(tableEl.componentInstance, headerEl);
    expect(ngMocks.formatHtml(headerEl)).toEqual(
      '<th mat-header-cell="">No.</th>',
    );

    // checking cell
    const cellEl = ngMocks.reveal(containerEl, ['matCellDef']);
    ngMocks.render(tableEl.componentInstance, cellEl, {
      position: 'testPosition',
    });
    expect(ngMocks.formatHtml(cellEl)).toEqual(
      '<td mat-cell=""> testPosition </td>',
    );
  });

  it('provides correct template for matColumnDef="name" via reveal and debugNode', () => {
    MockRender(TargetComponent);
    // looking for the table and container
    const tableEl = ngMocks.reveal(['mat-table']);
    const containerEl = ngMocks.reveal(['matColumnDef', 'name']);

    // checking that there are no artifacts around
    expect(ngMocks.formatHtml(containerEl)).toEqual('');

    // checking header
    const headerEl = ngMocks.reveal(containerEl, [
      'matHeaderCellDef',
    ]);
    ngMocks.render(tableEl.componentInstance, headerEl);
    expect(ngMocks.formatHtml(headerEl)).toEqual(
      '<th mat-header-cell="">Name</th>',
    );

    // checking cell
    const cellEl = ngMocks.reveal(containerEl, ['matCellDef']);
    ngMocks.render(tableEl.componentInstance, cellEl, {
      name: 'testName',
    });
    expect(ngMocks.formatHtml(cellEl)).toEqual(
      '<td mat-cell="">testName</td>',
    );
  });

  it('provides correct template for matColumnDef="weight" via findTemplateRef', () => {
    MockRender(TargetComponent);
    // looking for the table and container
    const tableEl = ngMocks.reveal(['mat-table']);
    const containerEl = ngMocks.reveal(['matColumnDef', 'weight']);

    // checking that there are no artifacts around
    expect(ngMocks.formatHtml(containerEl)).toEqual('');

    // checking header
    const header = ngMocks.findTemplateRef(containerEl, [
      'matHeaderCellDef',
    ]);
    ngMocks.render(tableEl.componentInstance, header);
    expect(ngMocks.formatHtml(containerEl)).toContain(
      '<th mat-header-cell="">Weight</th>',
    );

    // checking cell
    const cell = ngMocks.findTemplateRef(containerEl, ['matCellDef']);
    ngMocks.render(tableEl.componentInstance, cell, {
      weight: 'testWeight',
    });
    expect(ngMocks.formatHtml(containerEl)).toContain(
      '<td mat-cell=""> testWeight </td>',
    );
  });

  it('provides correct template for matColumnDef="symbol"', () => {
    MockRender(TargetComponent);
    // looking for the table and container
    const tableEl = ngMocks.reveal(['mat-table']);
    const containerEl = ngMocks.reveal(['matColumnDef', 'symbol']);

    // checking that there are no artifacts around
    expect(ngMocks.formatHtml(containerEl)).toEqual('');

    // checking header
    const header = ngMocks.findTemplateRef(containerEl, [
      'matHeaderCellDef',
    ]);
    ngMocks.render(tableEl.componentInstance, header);
    expect(ngMocks.formatHtml(containerEl)).toContain(
      '<th mat-header-cell="">Symbol</th>',
    );

    // checking cell
    const cell = ngMocks.findTemplateRef(containerEl, ['matCellDef']);
    ngMocks.render(tableEl.componentInstance, cell, {
      symbol: 'testSymbol',
    });
    expect(ngMocks.formatHtml(containerEl)).toContain(
      '<td mat-cell=""> testSymbol </td>',
    );
  });

  it('provides correct template for mat-header-row', () => {
    const targetComponent =
      MockRender(TargetComponent).point.componentInstance;
    const tableEl = ngMocks.reveal(['mat-table']);

    // checking that there are no artifacts around
    expect(ngMocks.formatHtml(tableEl)).toEqual('');

    const header = ngMocks.findInstance(tableEl, MatHeaderRowDef);
    expect(header.columns).toBe(targetComponent.displayedColumns);
    ngMocks.render(tableEl.componentInstance, header);
    expect(ngMocks.formatHtml(tableEl)).toContain(
      '<tr mat-header-row=""></tr>',
    );
  });

  it('provides correct template for mat-row', () => {
    const targetComponent =
      MockRender(TargetComponent).point.componentInstance;
    const tableEl = ngMocks.reveal(['mat-table']);

    // checking that there are no artifacts around
    expect(ngMocks.formatHtml(tableEl)).toEqual('');

    const row = ngMocks.findInstance(tableEl, MatRowDef);
    expect(row.columns).toBe(targetComponent.displayedColumns);
    ngMocks.render(tableEl.componentInstance, row);
    expect(ngMocks.formatHtml(tableEl)).toContain(
      '<tr mat-row=""></tr>',
    );
  });
});
