---
title: How to test the usage of AG Grid in Angular applications
sidebar_label: AG Grid
description: Examples of testing AG Grid inputs, outputs, Grid API calls, and custom cell renderers with ng-mocks.
---

`AG Grid` is a UI library for displaying tabular data.
Below you can find information on how to test a component that uses `ag-grid-angular`.

Let's assume that a component uses `ag-grid-angular` like this:

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

A test of such a template requires us to:

- mock `ag-grid-angular`
- assert passed inputs
- assert listeners on outputs
- provide the Grid API methods used by the component
- assert custom cell renderers if the grid uses them

## Spec file

With [`MockBuilder`](/api/MockBuilder.md), our spec file needs a single line to provide mocks:

```ts
beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

Where `TargetComponent` is a component which uses `ag-grid-angular`,
and `TargetModule` is its module, which imports `AgGridModule`.
The complete component, its `Row` type, and its module are in
[`test.spec.ts`](https://github.com/help-me-mom/ng-mocks/blob/main/tests-e2e/src/ag-grid/test.spec.ts).

## Testing inputs of ag-grid-angular

In this test we need to verify that the grid receives the parent's rows,
columns, default column settings, and grid options.
We also check that replacing the rows updates the binding.

The tools from `ng-mocks` we need:

- [`MockRender`](/api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.reveal`](/api/ngMocks/reveal.md): to find a debug element of `AgGridAngular`
- [`ngMocks.input`](/api/ngMocks/input.md): to get an input's value

After directly assigning a field, mark the parent for checking so the example
also works with `OnPush` change detection.

```ts
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
```

## Testing outputs of ag-grid-angular

The component listens to `rowClicked` and displays the selected row's make.
To test the binding, emit a row through the mocked output and assert its effect.

The tools from `ng-mocks` we need:

- [`MockRender`](/api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.reveal`](/api/ngMocks/reveal.md): to find a debug element of `AgGridAngular`
- [`ngMocks.output`](/api/ngMocks/output.md): to get an output's `EventEmitter`

```ts
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
```

## Testing gridReady

The approach to test `gridReady` is the same as above.
In this example, `onGridReady` calls `event.api.sizeColumnsToFit()`.
Supply that method in the event and assert that the handler calls it.

The `GridApi<Row>` and `GridReadyEvent<Row>` types come from `ag-grid-community`.
The type assertions describe partial test fixtures; the mock does not create a real Grid API.

```ts
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
```

## Testing Grid API access through ViewChild

If the component accesses the grid through `ViewChild`, it might use these members:

```ts
@ViewChild(AgGridAngular) public grid?: AgGridAngular<Row>;

public getSelectedRows(): Row[] {
  return this.grid!.api.getSelectedRows();
}
```

The tools from `ng-mocks` we need:

- [`MockInstance`](/api/MockInstance.md): to initialize the mock's `api` property before rendering
- [`MockRender`](/api/MockRender.md): to render `TargetComponent` and get its instance

Call `MockInstance.scope()` in the suite to restore the customization after each test:

```ts
MockInstance.scope();
```

```ts
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
```

## Testing custom cell renderers

AG Grid creates Angular cell components referenced by a column's `cellRenderer`.
For example, a price column can use this definition:

```ts
{ field: 'price', cellRenderer: PriceCellComponent }
```

A mocked grid receives the column definition but does not create the cell component.
Test the cell component separately, supplying the parameters that AG Grid passes to it.

:::note
`agInit` and `refresh` are called by AG Grid. Angular does not invoke them as lifecycle hooks.
Cell components are created dynamically, so use [`MockRender`](/api/MockRender.md)
to test their templates. The [`ngMocks.render`](/api/ngMocks/render.md) helper is for projected templates.
:::

For example, `PriceCellComponent` uses `PriceService` to format the supplied value:

```ts
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

The tools from `ng-mocks` we need:

- [`MockBuilder`](/api/MockBuilder.md): to keep the cell component and mock its service
- [`MockRender`](/api/MockRender.md): to render the cell component and get its instance
- [`ngMocks.formatText`](/api/ngMocks/formatText.md): to read the rendered value

The setup provides a predictable result from the formatting service:

```ts
beforeEach(() =>
  MockBuilder(PriceCellComponent).mock(PriceService, {
    format: value => `price: ${value}`,
  }),
);
```

Call `agInit` with the initial value, then `refresh` with a new value,
and assert the rendered text after each call:

```ts
it('refreshes the value without replacing the renderer', () => {
  // Rendering the cell component and accessing its instance.
  const fixture = MockRender(PriceCellComponent);
  const renderer = fixture.point.componentInstance;

  // Initializing the cell as AG Grid would.
  renderer.agInit({ value: 35_000 } as ICellRendererParams);
  fixture.point.injector.get(ChangeDetectorRef).markForCheck();
  fixture.detectChanges();
  expect(ngMocks.formatText(fixture)).toEqual('price: 35000');

  // Refreshing the cell with a new value.
  expect(
    renderer.refresh({ value: 32_000 } as ICellRendererParams),
  ).toBe(true);
  fixture.point.injector.get(ChangeDetectorRef).markForCheck();
  fixture.detectChanges();

  // Asserting that the same renderer displays the new value.
  expect(fixture.point.componentInstance).toBe(renderer);
  expect(ngMocks.formatText(fixture)).toEqual('price: 32000');
});
```

[`cell-renderer.spec.ts`](https://github.com/help-me-mom/ng-mocks/blob/main/tests-e2e/src/ag-grid/cell-renderer.spec.ts)
also checks initialization on its own and verifies that a mocked grid preserves
the renderer configuration without creating cells.

## Testing standalone components

The approach to test a standalone parent is the same as above.
If `TargetComponent` imports `AgGridAngular` directly, the setup becomes:

```ts
beforeEach(() => MockBuilder(TargetComponent));
```

The input and output examples are in
[`standalone.spec.ts`](https://github.com/help-me-mom/ng-mocks/blob/main/tests-e2e/src/ag-grid/standalone.spec.ts).

:::note
The examples use AG Grid Community 36.1.0 with Angular 22, as installed in
[`tests-e2e`](https://github.com/help-me-mom/ng-mocks/tree/main/tests-e2e/src/ag-grid).
Keep `ag-grid-angular` and `ag-grid-community` on matching versions.
AG Grid Enterprise is not required for these examples.
:::
