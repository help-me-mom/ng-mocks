import {
  ChangeDetectorRef,
  Component,
  ViewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
} from 'ag-grid-community';
import {
  isMockOf,
  MockBuilder,
  MockComponent,
  MockRender,
  ngMocks,
} from 'ng-mocks';
import { firstValueFrom } from 'rxjs';

interface Row {
  make: string;
}

@Component({
  selector: 'ag-grid-standalone-target',
  standalone: true,
  imports: [AgGridAngular],
  template: `
    <ag-grid-angular
      style="width: 600px; height: 300px"
      [modules]="modules"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      (gridReady)="onGridReady($event)"
      (rowClicked)="selectedRow = $event.data"
    ></ag-grid-angular>
    <span>{{ selectedRow?.make }}</span>
  `,
})
class TargetComponent {
  @ViewChild(AgGridAngular) public grid?: AgGridAngular<Row>;

  public modules = [AllCommunityModule];
  public rowData: Row[] = [{ make: 'Toyota' }, { make: 'Ford' }];
  public columnDefs: ColDef<Row>[] = [{ field: 'make' }];
  public api?: GridApi<Row>;
  public selectedRow?: Row;

  public onGridReady(event: GridReadyEvent<Row>): void {
    this.api = event.api;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/829
describe('ag-grid:standalone', () => {
  describe('MockBuilder', () => {
    beforeEach(() => MockBuilder(TargetComponent));

    it('mocks the standalone import and binds its inputs', () => {
      const target =
        MockRender(TargetComponent).point.componentInstance;
      const grid = ngMocks.findInstance(AgGridAngular);

      expect(isMockOf(grid, AgGridAngular)).toBe(true);
      expect(grid.rowData).toBe(target.rowData);
      expect(grid.columnDefs).toBe(target.columnDefs);
      expect(grid.modules).toBe(target.modules);
      expect(target.grid).toBe(grid);
      expect(grid.api).toBeUndefined();
      expect(target.api).toBeUndefined();
    });

    it('connects the standalone output to the parent', () => {
      const fixture = MockRender(TargetComponent);
      const data = fixture.point.componentInstance.rowData[1];

      ngMocks
        .output('ag-grid-angular', 'rowClicked')
        .emit({ data } as RowClickedEvent<Row>);
      fixture.detectChanges();

      expect(fixture.point.componentInstance.selectedRow).toBe(data);
      expect(ngMocks.formatText(fixture)).toBe('Ford');
    });
  });

  describe('MockComponent', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetComponent],
      })
        .overrideComponent(TargetComponent, {
          remove: { imports: [AgGridAngular] },
          add: { imports: [MockComponent(AgGridAngular)] },
        })
        .compileComponents(),
    );

    it('replaces the standalone import with TestBed', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();

      const grid = ngMocks.findInstance(AgGridAngular);
      expect(isMockOf(grid, AgGridAngular)).toBe(true);
      expect(grid.rowData).toBe(fixture.componentInstance.rowData);
      expect(grid.api).toBeUndefined();
    });
  });

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetComponent],
      }).compileComponents(),
    );

    it('initializes the real grid, receives gridReady, and updates rows', async () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      const target = fixture.componentInstance;
      await firstValueFrom(target.grid!.gridReady);

      expect(target.api).toBe(target.grid!.api);
      expect(target.api!.getDisplayedRowCount()).toBe(2);
      expect(target.api!.getDisplayedRowAtIndex(0)!.data).toBe(
        target.rowData[0],
      );
      expect(target.api!.getDisplayedRowAtIndex(1)!.data).toBe(
        target.rowData[1],
      );

      target.rowData = [{ make: 'Honda' }];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(target.api!.getDisplayedRowCount()).toBe(1);
      expect(target.api!.getDisplayedRowAtIndex(0)!.data).toBe(
        target.rowData[0],
      );
    });
  });

  describe('keep', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent).keep(AgGridAngular),
    );

    it('keeps the real grid, updates rows, and destroys its API', async () => {
      const fixture = MockRender(TargetComponent);
      const target = fixture.point.componentInstance;
      await firstValueFrom(target.grid!.gridReady);
      const api = target.api!;

      expect(isMockOf(target.grid, AgGridAngular)).toBe(false);
      expect(api).toBe(target.grid!.api);
      expect(api.getDisplayedRowCount()).toBe(2);
      expect(api.getDisplayedRowAtIndex(0)!.data).toBe(
        target.rowData[0],
      );

      target.rowData = [{ make: 'Honda' }];
      fixture.point.injector.get(ChangeDetectorRef).markForCheck();
      fixture.detectChanges();

      expect(api.getDisplayedRowCount()).toBe(1);
      expect(api.getDisplayedRowAtIndex(0)!.data).toBe(
        target.rowData[0],
      );
      expect(api.isDestroyed()).toBe(false);
      fixture.destroy();
      expect(api.isDestroyed()).toBe(true);
    });
  });
});
