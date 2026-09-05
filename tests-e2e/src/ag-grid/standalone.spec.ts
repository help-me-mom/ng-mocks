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
      // Rendering TargetComponent and accessing its instance.
      const targetComponent =
        MockRender(TargetComponent).point.componentInstance;

      // Looking for the `AgGridAngular` instance.
      const gridComponent = ngMocks.findInstance(AgGridAngular);

      expect(isMockOf(gridComponent, AgGridAngular)).toBe(true);
      expect(gridComponent.rowData).toBe(targetComponent.rowData);
      expect(gridComponent.columnDefs).toBe(
        targetComponent.columnDefs,
      );
      expect(gridComponent.modules).toBe(targetComponent.modules);
      expect(targetComponent.grid).toBe(gridComponent);
      expect(gridComponent.api).toBeUndefined();
      expect(targetComponent.api).toBeUndefined();
    });

    it('connects the standalone output to the parent', () => {
      // Rendering TargetComponent and accessing its instance.
      const fixture = MockRender(TargetComponent);
      const data = fixture.point.componentInstance.rowData[1];

      // Looking for the grid and simulating an emit.
      const gridEl = ngMocks.reveal(AgGridAngular);
      ngMocks
        .output(gridEl, 'rowClicked')
        .emit({ data } as RowClickedEvent<Row>);
      fixture.detectChanges();

      // Asserting the effect of the emit.
      expect(fixture.point.componentInstance.selectedRow).toBe(data);
      expect(ngMocks.formatText(fixture)).toEqual('Ford');
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
      // Rendering TargetComponent with TestBed.
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();

      // Looking for the `AgGridAngular` instance.
      const gridComponent = ngMocks.findInstance(AgGridAngular);
      expect(isMockOf(gridComponent, AgGridAngular)).toBe(true);
      expect(gridComponent.rowData).toBe(
        fixture.componentInstance.rowData,
      );
      expect(gridComponent.api).toBeUndefined();
    });
  });

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetComponent],
      }).compileComponents(),
    );

    it('initializes the real grid, receives gridReady, and updates rows', async () => {
      // Rendering TargetComponent with TestBed.
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      const targetComponent = fixture.componentInstance;

      // Waiting for the grid API before checking its data.
      await firstValueFrom(targetComponent.grid!.gridReady);

      expect(targetComponent.api).toBe(targetComponent.grid!.api);
      expect(targetComponent.api!.getDisplayedRowCount()).toBe(2);
      expect(
        targetComponent.api!.getDisplayedRowAtIndex(0)!.data,
      ).toBe(targetComponent.rowData[0]);
      expect(
        targetComponent.api!.getDisplayedRowAtIndex(1)!.data,
      ).toBe(targetComponent.rowData[1]);

      // Updating the bound rows and checking the real row model.
      targetComponent.rowData = [{ make: 'Honda' }];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(targetComponent.api!.getDisplayedRowCount()).toBe(1);
      expect(
        targetComponent.api!.getDisplayedRowAtIndex(0)!.data,
      ).toBe(targetComponent.rowData[0]);
    });
  });

  describe('keep', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent).keep(AgGridAngular),
    );

    it('keeps the real grid, updates rows, and destroys its API', async () => {
      // Rendering TargetComponent and accessing its instance.
      const fixture = MockRender(TargetComponent);
      const targetComponent = fixture.point.componentInstance;

      // Waiting for the grid API before checking its data.
      await firstValueFrom(targetComponent.grid!.gridReady);
      const api = targetComponent.api!;

      expect(isMockOf(targetComponent.grid, AgGridAngular)).toBe(
        false,
      );
      expect(api).toBe(targetComponent.grid!.api);
      expect(api.getDisplayedRowCount()).toBe(2);
      expect(api.getDisplayedRowAtIndex(0)!.data).toBe(
        targetComponent.rowData[0],
      );

      // Updating the bound rows and checking the real row model.
      targetComponent.rowData = [{ make: 'Honda' }];
      fixture.point.injector.get(ChangeDetectorRef).markForCheck();
      fixture.detectChanges();

      expect(api.getDisplayedRowCount()).toBe(1);
      expect(api.getDisplayedRowAtIndex(0)!.data).toBe(
        targetComponent.rowData[0],
      );

      // Checking that Angular teardown destroys the grid.
      expect(api.isDestroyed()).toBe(false);
      fixture.destroy();
      expect(api.isDestroyed()).toBe(true);
    });
  });
});
