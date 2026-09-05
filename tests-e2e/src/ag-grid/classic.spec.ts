import {
  ChangeDetectorRef,
  Component,
  NgModule,
  ViewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  RowClickedEvent,
} from 'ag-grid-community';
import {
  isMockOf,
  MockBuilder,
  MockInstance,
  MockModule,
  MockRender,
  ngMocks,
} from 'ng-mocks';

interface Row {
  make: string;
  price: number;
}

@Component({
  selector: 'ag-grid-classic-target',
  standalone: false,
  template: `
    <ag-grid-angular
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [defaultColDef]="defaultColDef"
      [gridOptions]="gridOptions"
      (gridReady)="onGridReady($event)"
      (rowClicked)="selectedRow = $event.data"
    ></ag-grid-angular>
    <span>{{ selectedRow?.make }}</span>
  `,
})
class TargetComponent {
  @ViewChild(AgGridAngular) public grid?: AgGridAngular<Row>;

  public rowData: Row[] = [{ make: 'Toyota', price: 35_000 }];
  public columnDefs: ColDef<Row>[] = [
    { field: 'make' },
    { field: 'price' },
  ];
  public defaultColDef: ColDef<Row> = { sortable: true };
  public gridOptions: GridOptions<Row> = {
    rowSelection: { mode: 'singleRow' },
  };
  public selectedRow?: Row;

  public onGridReady(event: GridReadyEvent<Row>): void {
    event.api.sizeColumnsToFit();
  }

  public getSelectedRows(): Row[] {
    return this.grid!.api.getSelectedRows();
  }
}

@NgModule({
  declarations: [TargetComponent],
  imports: [AgGridModule],
  exports: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/829
describe('ag-grid:classic', () => {
  describe('MockBuilder', () => {
    MockInstance.scope();

    beforeEach(() => MockBuilder(TargetComponent, TargetModule));

    it('binds inputs and updates row data without creating a grid', () => {
      const fixture = MockRender(TargetComponent);
      const target = fixture.point.componentInstance;
      // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
      const grid = ngMocks.find<AgGridAngular<Row>>(AgGridAngular);

      expect(isMockOf(grid.componentInstance, AgGridAngular)).toBe(
        true,
      );
      expect(ngMocks.input(grid, 'rowData')).toBe(target.rowData);
      expect(ngMocks.input(grid, 'columnDefs')).toBe(
        target.columnDefs,
      );
      expect(ngMocks.input(grid, 'defaultColDef')).toBe(
        target.defaultColDef,
      );
      expect(ngMocks.input(grid, 'gridOptions')).toBe(
        target.gridOptions,
      );
      expect(target.grid).toBe(grid.componentInstance);
      expect(target.grid!.api).toBeUndefined();
      expect(ngMocks.formatHtml(grid)).toBe('');

      target.rowData = [{ make: 'Ford', price: 32_000 }];
      fixture.point.injector.get(ChangeDetectorRef).markForCheck();
      fixture.detectChanges();

      expect(ngMocks.input(grid, 'rowData')).toBe(target.rowData);
    });

    it('handles gridReady using a supplied Grid API', () => {
      MockRender(TargetComponent);
      let calls = 0;
      const api = {
        sizeColumnsToFit: () => {
          calls += 1;
        },
      } as GridApi<Row>;

      expect(calls).toBe(0);
      ngMocks
        .output('ag-grid-angular', 'gridReady')
        .emit({ api } as GridReadyEvent<Row>);

      expect(calls).toBe(1);
    });

    it('handles rowClicked and renders the selected row', () => {
      const fixture = MockRender(TargetComponent);
      const target = fixture.point.componentInstance;
      const data = target.rowData[0];

      expect(target.selectedRow).toBeUndefined();
      ngMocks
        .output('ag-grid-angular', 'rowClicked')
        .emit({ data } as RowClickedEvent<Row>);
      fixture.detectChanges();

      expect(target.selectedRow).toBe(data);
      expect(ngMocks.formatText(fixture)).toBe('Toyota');
    });

    it('provides a Grid API for ViewChild consumers', () => {
      const selectedRows: Row[] = [{ make: 'Ford', price: 32_000 }];
      const api = {
        getSelectedRows: () => selectedRows,
      } as GridApi<Row>;
      MockInstance(AgGridAngular, 'api', api);

      const target =
        MockRender(TargetComponent).point.componentInstance;

      expect(target.grid!.api).toBe(api);
      expect(target.getSelectedRows()).toBe(selectedRows);
    });
  });

  describe('MockModule', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [TargetComponent],
        imports: [MockModule(AgGridModule)],
      }).compileComponents(),
    );

    it('mocks the module with TestBed', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();

      const grid = ngMocks.findInstance(AgGridAngular);
      expect(isMockOf(grid, AgGridAngular)).toBe(true);
      expect(grid.rowData).toBe(fixture.componentInstance.rowData);
      expect(grid.api).toBeUndefined();
    });
  });
});
