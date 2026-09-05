---
title: How to test AG Grid in Angular applications
sidebar_label: AG Grid
description: Mock AG Grid inputs, outputs, and Grid API calls, test custom cell renderers, or keep the real Angular grid.
---

To test a component which uses `ag-grid-angular`, mock `AgGridAngular`
and verify the application's input bindings, output handlers, and Grid API calls.
For integration tests which need the grid itself, keep `AgGridAngular`.

The examples use AG Grid Community 36.1.0 with Angular 22, as installed in
[`tests-e2e`](https://github.com/help-me-mom/ng-mocks/tree/main/tests-e2e/src/ag-grid).
Keep `ag-grid-angular` and `ag-grid-community` on matching versions.
These examples cover both `AgGridModule` and standalone `AgGridAngular` imports.
They do not require AG Grid Enterprise.

## Component under test

For example, a component passes rows, columns, default column settings,
and selection options to AG Grid. It sizes columns when the grid is ready
and displays the row clicked by the user:

```html
<ag-grid-angular
  [rowData]="rowData"
  [columnDefs]="columnDefs"
  [defaultColDef]="defaultColDef"
  [gridOptions]="gridOptions"
  (gridReady)="onGridReady($event)"
  (rowClicked)="selectedRow = $event.data"
></ag-grid-angular>
<span>{{ selectedRow?.make }}</span>
```

The relevant properties and handler of `TargetComponent` are:

```ts
import {
  ColDef,
  GridOptions,
  GridReadyEvent,
} from 'ag-grid-community';

interface Row {
  make: string;
  price: number;
}

// Inside TargetComponent:
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
```

The complete component and module are in
[`classic.spec.ts`](https://github.com/help-me-mom/ng-mocks/blob/main/tests-e2e/src/ag-grid/classic.spec.ts).

## Mocking AG Grid

If `TargetComponent` belongs to `TargetModule`, which imports `AgGridModule`,
use [`MockBuilder`](/api/MockBuilder.md) to keep the parent and mock its dependencies:

```ts
import { ChangeDetectorRef } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

For a standalone parent with `imports: [AgGridAngular]`, use:

```ts
beforeEach(() => MockBuilder(TargetComponent));
```

With `TestBed`, the module-based equivalent uses [`MockModule`](/api/MockModule.md):

```ts
beforeEach(() =>
  TestBed.configureTestingModule({
    declarations: [TargetComponent],
    imports: [MockModule(AgGridModule)],
  }).compileComponents(),
);
```

For a standalone parent, replace its own import using
[`MockComponent`](/api/MockComponent.md):

```ts
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
```

A mocked grid preserves Angular bindings and component queries.
It does not create rows, initialize a Grid API, or emit `gridReady` automatically.
Grid modules, themes, and browser layout are unnecessary for these mocked tests.

## Testing inputs

Use [`ngMocks.find`](/api/ngMocks/find.md) to locate the grid and
[`ngMocks.input`](/api/ngMocks/input.md) to inspect its inputs.
Changes in the parent should reach the mock after change detection.
After directly assigning a field, mark the parent for checking so the example
also works with `OnPush` change detection (the default in Angular 22):

```ts
it('binds inputs and updates row data', () => {
  const fixture = MockRender(TargetComponent);
  const target = fixture.point.componentInstance;
  const grid = ngMocks.find(AgGridAngular);

  expect(ngMocks.input(grid, 'rowData')).toBe(target.rowData);
  expect(ngMocks.input(grid, 'columnDefs')).toBe(target.columnDefs);
  expect(ngMocks.input(grid, 'defaultColDef')).toBe(
    target.defaultColDef,
  );
  expect(ngMocks.input(grid, 'gridOptions')).toBe(target.gridOptions);

  target.rowData = [{ make: 'Ford', price: 32_000 }];
  fixture.point.injector.get(ChangeDetectorRef).markForCheck();
  fixture.detectChanges();

  expect(ngMocks.input(grid, 'rowData')).toBe(target.rowData);
});
```

## Testing outputs and Grid API calls

Use [`ngMocks.output`](/api/ngMocks/output.md) to emit events and assert
what the parent does with their payloads:

```ts
import { RowClickedEvent } from 'ag-grid-community';

it('handles rowClicked', () => {
  const fixture = MockRender(TargetComponent);
  const target = fixture.point.componentInstance;
  const data = target.rowData[0];

  ngMocks.output('ag-grid-angular', 'rowClicked').emit({
    data,
  } as RowClickedEvent<Row>);
  fixture.detectChanges();

  expect(target.selectedRow).toBe(data);
  expect(ngMocks.formatText(fixture)).toBe('Toyota');
});
```

For `gridReady`, supply the API methods the handler actually uses.
The type assertion below represents a partial event fixture; it does not create
an implementation of the full Grid API.

```ts
import { GridApi, GridReadyEvent } from 'ag-grid-community';

it('sizes columns when the grid is ready', () => {
  MockRender(TargetComponent);
  let calls = 0;
  const api = {
    sizeColumnsToFit: () => {
      calls += 1;
    },
  } as GridApi<Row>;

  expect(calls).toBe(0);
  ngMocks.output('ag-grid-angular', 'gridReady').emit({
    api,
  } as GridReadyEvent<Row>);

  expect(calls).toBe(1);
});
```

If the parent reads `api` through `@ViewChild(AgGridAngular)`, initialize
that property with [`MockInstance`](/api/MockInstance.md) before rendering.
`MockInstance.scope()` restores the customization after each test.

For a parent with these members:

```ts
@ViewChild(AgGridAngular) public grid?: AgGridAngular<Row>;

public getSelectedRows(): Row[] {
  return this.grid!.api.getSelectedRows();
}
```

The test can supply its own selection:

```ts
import { MockInstance } from 'ng-mocks';

MockInstance.scope();

it('reads selected rows through ViewChild', () => {
  const selectedRows: Row[] = [{ make: 'Ford', price: 32_000 }];
  const api = {
    getSelectedRows: () => selectedRows,
  } as GridApi<Row>;
  MockInstance(AgGridAngular, 'api', api);

  const target = MockRender(TargetComponent).point.componentInstance;

  expect(target.grid!.api).toBe(api);
  expect(target.getSelectedRows()).toBe(selectedRows);
});
```

## Keeping the real grid

Use `.keep(AgGridAngular)` when the test needs real grid behavior.
For a module-based parent, keep `AgGridModule` instead.

```ts
// Standalone parent:
beforeEach(() => MockBuilder(TargetComponent).keep(AgGridAngular));

// Module-based parent:
beforeEach(() =>
  MockBuilder(TargetComponent, TargetModule).keep(AgGridModule),
);
```

The real grid needs its usual AG Grid module setup. For a Community example,
pass `[modules]="modules"` with the following property on the parent:

```ts
import { AllCommunityModule } from 'ag-grid-community';

public modules = [AllCommunityModule];
```

This registers modules for that grid without modifying global module registration.
Keep the application's required feature modules and layout configuration when testing a real grid.
Wait for `gridReady` before inspecting the API, and for `firstDataRendered`
when inspecting rendered cells. Subscribe immediately after rendering, before
yielding to the asynchronous event. Waiting for the relevant event also avoids
depending on unrelated pending browser work through `fixture.whenStable()`.
See [AG Grid's Angular testing guide](https://www.ag-grid.com/angular-data-grid/testing/)
for more background.

```ts
import { firstValueFrom } from 'rxjs';

it('keeps the real grid', async () => {
  const fixture = MockRender(TargetComponent);
  const grid = ngMocks.findInstance(AgGridAngular);
  await firstValueFrom(grid.gridReady);

  expect(grid.api.getDisplayedRowCount()).toBe(
    fixture.point.componentInstance.rowData.length,
  );
  expect(grid.api.getDisplayedRowAtIndex(0)!.data).toBe(
    fixture.point.componentInstance.rowData[0],
  );
});
```

[`standalone.spec.ts`](https://github.com/help-me-mom/ng-mocks/blob/main/tests-e2e/src/ag-grid/standalone.spec.ts)
compares a real `TestBed` grid with the kept grid and checks row updates and destruction.
These assertions use the row model API. For layout, scrolling, and virtualization,
use browser tests: simulated DOM environments such as jsdom do not implement CSS layout.

## Testing custom cell renderers

AG Grid instantiates Angular cell components referenced by a column's
`cellRenderer`, for example `{ field: 'price', cellRenderer: PriceCellComponent }`.
A mocked `AgGridAngular` does not instantiate those components.
They are not projected `ng-template` content, so test the renderer separately
with `MockBuilder` and `MockRender`.

A renderer can use an injected service to format the value:

```ts
import { ChangeDetectorRef, Component, Injectable } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

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
```

Call `agInit` explicitly: it is invoked by AG Grid, not by Angular's lifecycle.
Stub the renderer's dependencies as in any other component test:

```ts
beforeEach(() =>
  MockBuilder(PriceCellComponent).mock(PriceService, {
    format: value => `price: ${value}`,
  }),
);

it('renders and refreshes a cell', () => {
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
  expect(ngMocks.formatText(fixture)).toBe('price: 32000');
});
```

See the executable renderer tests in
[`cell-renderer.spec.ts`](https://github.com/help-me-mom/ng-mocks/blob/main/tests-e2e/src/ag-grid/cell-renderer.spec.ts).

To exercise the renderer inside a real module-based grid, keep the grid module,
the renderer, and any dependencies which should retain their real behavior:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent, TargetModule)
    .keep(AgGridModule)
    .keep(PriceCellComponent)
    .keep(PriceService),
);
```

Here `TargetModule` imports `AgGridModule` and `PriceCellComponent`, and the parent
passes `{ field: 'price', cellRenderer: PriceCellComponent }` in `columnDefs`.
The same spec file verifies that AG Grid creates the renderer and displays the
formatted value. Its small grid disables column virtualization so this assertion
also works without browser layout; this does not test virtualization itself.
