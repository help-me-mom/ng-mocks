import { Component, NgModule, TemplateRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
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
  }
}

@NgModule({
  declarations: [TargetComponent],
  imports: [MatTableModule],
})
class TargetModule {}

describe('mat-table:e2e', () => {
  ngMocks.faster();

  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('has access to child nodes', () => {
    MockRender(TargetComponent);
    // looking for the table and container
    const tableEl = ngMocks.find('[mat-table]');
    const containerEl = ngMocks.reveal(['matColumnDef', 'position']);

    const cellEl = ngMocks.reveal(containerEl, ['matCellDef']);
    const cell = ngMocks.get(cellEl, TemplateRef);
    ngMocks.render(tableEl.componentInstance, cell, {
      position: 'testPosition',
    });

    const headerEl = ngMocks.reveal(containerEl, [
      'matHeaderCellDef',
    ]);
    const header = ngMocks.get(headerEl, TemplateRef);
    ngMocks.render(tableEl.componentInstance, header);

    // checking the order of the render
    expect(ngMocks.formatHtml(tableEl)).toEqual(
      '<th mat-header-cell="">No.</th><td mat-cell=""> testPosition </td>',
    );

    // cool stuff
    expect(ngMocks.formatHtml(headerEl)).toEqual(
      '<th mat-header-cell="">No.</th>',
    );
    expect(ngMocks.formatHtml(cellEl)).toEqual(
      '<td mat-cell=""> testPosition </td>',
    );

    {
      const matHeaderCellTable = ngMocks.reveal(tableEl, [
        'mat-header-cell',
      ]);
      const matHeaderCellContainer = ngMocks.reveal(containerEl, [
        'mat-header-cell',
      ]);
      expect(matHeaderCellTable).toBe(matHeaderCellContainer);
    }
    {
      const matCellTable = ngMocks.reveal(tableEl, ['mat-cell']);
      const matCellContainer = ngMocks.reveal(containerEl, [
        'mat-cell',
      ]);
      expect(matCellTable).toBe(matCellContainer);
    }

    expect(ngMocks.formatHtml(tableEl)).toEqual(
      '<th mat-header-cell="">No.</th><td mat-cell=""> testPosition </td>',
    );
    expect(ngMocks.formatHtml(containerEl)).toEqual(
      '<th mat-header-cell="">No.</th><td mat-cell=""> testPosition </td>',
    );
  });
});
