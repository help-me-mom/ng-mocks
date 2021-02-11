---
title: How to test usage of @angular/material (Angular Material) in Angular applications
sidebar_label: Angular Material
---

`Angular Material` is a UI library with a lot of UI components.
Below you can find information how to test a component which uses `Angular Material`.

The next example will be based on usage of `mat-table`.
Let's assume, that a component uses `mat-table` like that:

```html
<table mat-table [dataSource]="dataSource">
  <!-- Position Column -->
  <ng-container matColumnDef="position">
    <th mat-header-cell *matHeaderCellDef>No.</th>
    <td mat-cell *matCellDef="let element">
      {{ element.position }}
    </td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr
    mat-row
    *matRowDef="let row; columns: displayedColumns"
  ></tr>
</table>
```

A test of such a template requires to:

- mock `mat-table`
- assert passed inputs
- assert templates for Position column
- assert the rest of templates

:::note
Information about testing `ng-template` and its `TemplateRef` is taken from the [guide about testing TemplateRef](../../extra/templateref.md).
:::

## Spec file

With [`MockBuilder`](../../api/MockBuilder.md), our spec file needs a single line to provide mocks:

```ts
beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

Where `TargetComponent` is a component which uses `mat-table`,
and `TargetModule` is its module.

## Testing inputs of mat-table

In this test we need to verify that `mat-table` data from out component's instance.

The tools from `ng-mocks` we need:

- [`MockRender`](../../api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.find`](../../api/ngMocks/find.md): to find a debug element of `MatTable`
- [`ngMocks.input`](../../api/ngMocks/input.md): to get an input's value

```ts
it('binds inputs', () => {
  // Rendering TargetComponent and accessing its instance.
  const targetComponent = MockRender(TargetComponent).point
    .componentInstance;

  // Looking for a debug element of `MatTable`.
  const tableEl = ngMocks.find(MatTable);

  // Asserting bound properties.
  expect(ngMocks.input(tableEl, 'dataSource')).toBe(
    targetComponent.dataSource,
  );
});
```

## Testing matColumnDef and matCellDef templates

To test the `ng-template`, we should find which directives belong to `matColumnDef` and `matCellDef` attributes.
They are `MatHeaderCellDef` and `MatCellDef`.

The test repeats steps for [Templates by directive](../../extra/templateref.md#templates-by-directive).

The tools from `ng-mocks` we need:

- [`MockRender`](../../api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.find`](../../api/ngMocks/find.md): to find a debug element of `p-calendar`
- [`ngMocks.findInstances`](../../api/ngMocks/findInstances.md): to find the instance of `PrimeTemplate`
- [`isMockOf`](../../api/helpers/isMockOf.md): to verify that `PrimeTemplate` has been mocked to render it

```ts
it('provides correct template for matColumnDef="position"', () => {
  // Rendering TargetComponent.
  MockRender(TargetComponent);

  // Looking for a debug element of `MatTable`.
  const tableEl = ngMocks.find(MatTable);

  // Looking for the instance of MatHeaderCellDef.
  // The first one belongs to 'position'.
  const [header] = ngMocks.findInstances(tableEl, MatHeaderCellDef);

  // Verifying that the directive has been mocked.
  // And rendering it.
  if (isMockOf(header, MatHeaderCellDef, 'd')) {
    header.__render();
  }

  // Asserting the rendered template.
  expect(tableEl.nativeElement.innerHTML).toContain(
    '<th mat-header-cell="">No.</th>',
  );

  // Looking for the instance of MatCellDef.
  // The first one belongs to 'position'.
  const [cell] = ngMocks.findInstances(tableEl, MatCellDef);

  // Verifying that the directive has been mocked.
  // And rendering it.
  if (isMockOf(cell, MatCellDef, 'd')) {
    cell.__render({ position: 'testPosition' });
  }

  // Asserting the rendered template.
  expect(tableEl.nativeElement.innerHTML).toContain(
    '<td mat-cell=""> testPosition </td>',
  );
});
```

## Testing mat-header-row template

The approach to test `mat-header-row` is the same as above.

We need to find which directive belongs to `mat-header-row`,
it is `MatHeaderRowDef`.

```ts
it('provides correct template for mat-header-row', () => {
  // Rendering TargetComponent and accessing its instance.
  const targetComponent = MockRender(TargetComponent).point
    .componentInstance;

  // Looking for a debug element of `MatTable`.
  const tableEl = ngMocks.find(MatTable);

  // Looking for the instance of `MatHeaderRowDef`.
  const header = ngMocks.findInstance(tableEl, MatHeaderRowDef);

  // Asserting its inputs.
  expect(header.columns).toBe(targetComponent.displayedColumns);

  // Verifying that the instance has been mocked.
  // And rendering it.
  if (isMockOf(header, MatHeaderRowDef, 'd')) {
    header.__render();
  }

  // Asserting the rendered html.
  expect(tableEl.nativeElement.innerHTML).toContain(
    '<tr mat-header-row=""></tr>',
  );
});
```

## Testing mat-row template

The approach to test `mat-row` is the same as above.

We need to find which directive belongs to `mat-row`,
it is `MatRowDef`.

```ts
it('provides correct template for mat-row', () => {
  // Rendering TargetComponent and accessing its instance.
  const targetComponent = MockRender(TargetComponent).point
    .componentInstance;

  // Looking for a debug element of `MatTable`.
  const tableEl = ngMocks.find(MatTable);

  // Looking for the instance of `MatRowDef`.
  const row = ngMocks.findInstance(tableEl, MatRowDef);

  // Asserting its inputs.
  expect(row.columns).toBe(targetComponent.displayedColumns);

  // Verifying that the instance has been mocked.
  // And rendering it.
  if (isMockOf(row, MatRowDef, 'd')) {
    row.__render();
  }

  // Asserting the rendered html.
  expect(tableEl.nativeElement.innerHTML).toContain(
    '<tr mat-row=""></tr>',
  );
});
```
