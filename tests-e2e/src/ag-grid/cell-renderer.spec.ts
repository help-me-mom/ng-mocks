import {
  ChangeDetectorRef,
  Component,
  Injectable,
  NgModule,
} from '@angular/core';
import {
  AgGridAngular,
  AgGridModule,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  ICellRendererParams,
} from 'ag-grid-community';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
class PriceService {
  public format(value: number): string {
    return `€${value}`;
  }
}

@Component({
  selector: 'ag-grid-price-cell',
  standalone: true,
  template: '<strong>{{ price }}</strong>',
})
class PriceCellComponent implements ICellRendererAngularComp {
  public price = '';

  public constructor(private readonly priceService: PriceService) {}

  public agInit(params: ICellRendererParams): void {
    this.price = this.priceService.format(params.value);
  }

  public refresh(params: ICellRendererParams): boolean {
    this.price = this.priceService.format(params.value);
    return true;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/829
describe('ag-grid:cell-renderer', () => {
  beforeEach(() =>
    MockBuilder(PriceCellComponent).mock(PriceService, {
      format: value => `price: ${value}`,
    }),
  );

  it('renders the value supplied through agInit', () => {
    const fixture = MockRender(PriceCellComponent);

    // AG Grid calls agInit; Angular does not treat it as a lifecycle hook or an input.
    expect(ngMocks.formatText(fixture)).toBe('');
    fixture.point.componentInstance.agInit({
      value: 35_000,
    } as ICellRendererParams);
    fixture.point.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();

    expect(ngMocks.formatHtml(fixture)).toContain(
      '<strong>price: 35000</strong>',
    );
  });

  it('refreshes the value without replacing the renderer', () => {
    const fixture = MockRender(PriceCellComponent);
    const renderer = fixture.point.componentInstance;
    renderer.agInit({ value: 35_000 } as ICellRendererParams);
    fixture.point.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toBe('price: 35000');

    expect(
      renderer.refresh({ value: 32_000 } as ICellRendererParams),
    ).toBe(true);
    fixture.point.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();

    expect(fixture.point.componentInstance).toBe(renderer);
    expect(ngMocks.formatText(fixture)).toBe('price: 32000');
  });
});

@Component({
  selector: 'ag-grid-renderer-target',
  standalone: false,
  template: `
    <ag-grid-angular
      style="width: 600px; height: 300px"
      [modules]="modules"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [suppressColumnVirtualisation]="true"
    ></ag-grid-angular>
  `,
})
class TargetComponent {
  public modules = [AllCommunityModule];
  public rowData = [{ price: 35_000 }];
  public columnDefs: ColDef[] = [
    { field: 'price', cellRenderer: PriceCellComponent },
  ];
}

@NgModule({
  declarations: [TargetComponent],
  imports: [AgGridModule, PriceCellComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/829
describe('ag-grid:cell-renderer:mock', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('passes the renderer configuration without creating cells', () => {
    const fixture = MockRender(TargetComponent);
    const target = fixture.point.componentInstance;
    const grid = ngMocks.findInstance(AgGridAngular);

    expect(grid.columnDefs).toBe(target.columnDefs);
    expect(target.columnDefs[0].cellRenderer).toBe(
      PriceCellComponent,
    );
    expect(ngMocks.findInstances(PriceCellComponent)).toEqual([]);
    expect(ngMocks.formatText(fixture)).toBe('');
  });
});

// @see https://github.com/help-me-mom/ng-mocks/issues/829
describe('ag-grid:cell-renderer:keep', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule)
      .keep(AgGridModule)
      .keep(PriceCellComponent)
      .keep(PriceService),
  );

  it('creates the Angular cell renderer in a kept module-based grid', async () => {
    const fixture = MockRender(TargetComponent);
    const grid = ngMocks.findInstance(AgGridAngular);
    await firstValueFrom(grid.firstDataRendered);

    expect(grid.api.getDisplayedRowAtIndex(0)!.data).toBe(
      fixture.point.componentInstance.rowData[0],
    );
    expect(grid.api.getCellRendererInstances().length).toBe(1);
    expect(ngMocks.formatText(fixture)).toContain('€35000');
  });
});
