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
describe('ag-grid:props', () => {
  ngMocks.faster();
  MockInstance.scope();

  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('binds inputs', () => {
    // Rendering TargetComponent and accessing its instance.
    const fixture = MockRender(TargetComponent);
    const targetComponent = fixture.point.componentInstance;

    // Looking for a debug element of `AgGridAngular`.
    const gridEl = ngMocks.reveal<AgGridAngular<Row>>(AgGridAngular);

    // Asserting bound properties.
    expect(ngMocks.input(gridEl, 'rowData')).toBe(
      targetComponent.rowData,
    );
    expect(ngMocks.input(gridEl, 'columnDefs')).toBe(
      targetComponent.columnDefs,
    );
    expect(ngMocks.input(gridEl, 'defaultColDef')).toBe(
      targetComponent.defaultColDef,
    );
    expect(ngMocks.input(gridEl, 'gridOptions')).toBe(
      targetComponent.gridOptions,
    );

    // Checking that the mock is available through ViewChild and has no grid artifacts.
    expect(isMockOf(gridEl.componentInstance, AgGridAngular)).toBe(
      true,
    );
    expect(targetComponent.grid).toBe(gridEl.componentInstance);
    expect(targetComponent.grid!.api).toBeUndefined();
    expect(ngMocks.formatHtml(gridEl)).toEqual('');

    // Updating an input and checking its binding again.
    targetComponent.rowData = [{ make: 'Ford', price: 32_000 }];
    fixture.point.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();

    expect(ngMocks.input(gridEl, 'rowData')).toBe(
      targetComponent.rowData,
    );
  });

  it('handles gridReady', () => {
    // Rendering TargetComponent and looking for the grid.
    MockRender(TargetComponent);
    const gridEl = ngMocks.reveal(AgGridAngular);

    // Providing the API method used by the gridReady handler.
    let calls = 0;
    const api = {
      sizeColumnsToFit: () => {
        calls += 1;
      },
    } as GridApi<Row>;

    // Simulating an emit.
    expect(calls).toBe(0);
    ngMocks
      .output(gridEl, 'gridReady')
      .emit({ api } as GridReadyEvent<Row>);

    // Asserting the effect of the emit.
    expect(calls).toBe(1);
  });

  it('binds outputs', () => {
    // Rendering TargetComponent and accessing its instance.
    const fixture = MockRender(TargetComponent);
    const targetComponent = fixture.point.componentInstance;
    const gridEl = ngMocks.reveal(AgGridAngular);

    // Simulating an emit.
    const data = targetComponent.rowData[0];
    expect(targetComponent.selectedRow).toBeUndefined();
    ngMocks
      .output(gridEl, 'rowClicked')
      .emit({ data } as RowClickedEvent<Row>);
    fixture.detectChanges();

    // Asserting the effect of the emit.
    expect(targetComponent.selectedRow).toBe(data);
    expect(ngMocks.formatText(fixture)).toEqual('Toyota');
  });

  it('provides a Grid API for ViewChild', () => {
    // Customizing the mock before rendering TargetComponent.
    const selectedRows: Row[] = [{ make: 'Ford', price: 32_000 }];
    const api = {
      getSelectedRows: () => selectedRows,
    } as GridApi<Row>;
    MockInstance(AgGridAngular, 'api', api);

    // Rendering TargetComponent and accessing its instance.
    const targetComponent =
      MockRender(TargetComponent).point.componentInstance;

    // Asserting access to the API through ViewChild.
    expect(targetComponent.grid!.api).toBe(api);
    expect(targetComponent.getSelectedRows()).toBe(selectedRows);
  });
});

// @see https://github.com/help-me-mom/ng-mocks/issues/829
describe('ag-grid:MockModule', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      imports: [MockModule(AgGridModule)],
    }).compileComponents(),
  );

  it('mocks the module with TestBed', () => {
    // Rendering TargetComponent with the mocked module.
    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();

    // Asserting that the grid is mocked and receives its rows.
    const gridComponent = ngMocks.findInstance(AgGridAngular);
    expect(isMockOf(gridComponent, AgGridAngular)).toBe(true);
    expect(gridComponent.rowData).toBe(
      fixture.componentInstance.rowData,
    );
    expect(gridComponent.api).toBeUndefined();
  });
});
