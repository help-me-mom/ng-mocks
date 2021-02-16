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
Information about testing `ng-template` and its `TemplateRef` is taken from the [ngMocks.render](../../api/ngMocks/render.md).
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

To test the `ng-template`,
we should find `TemplateRef` which belongs to `matColumnDef` and `matCellDef` attributes,
render them, and assert the rendered html.

The tools from `ng-mocks` we need:

- [`MockRender`](../../api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.find`](../../api/ngMocks/find.md): to find a debug element of `mat-table`
- [`ngMocks.findTemplateRefs`](../../api/ngMocks/findTemplateRefs.md): to find a templates which belong `matColumnDef` and `matCellDef`
- [`ngMocks.render`](../../api/ngMocks/render.md): to render the templates

```ts
it('provides correct template for matColumnDef="position"', () => {
  MockRender(TargetComponent);
  const tableEl = ngMocks.find('[mat-table]');

  expect(tableEl.nativeElement.innerHTML).not.toContain(
    '<th mat-header-cell="">No.</th>',
  );
  const [header] = ngMocks.findTemplateRefs(
    tableEl,
    ['matHeaderCellDef'],
  );
  ngMocks.render(tableEl.componentInstance, header);
  expect(tableEl.nativeElement.innerHTML).toContain(
    '<th mat-header-cell="">No.</th>',
  );

  expect(tableEl.nativeElement.innerHTML).not.toContain(
    '<td mat-cell=""> testPosition </td>',
  );
  const [cell] = ngMocks.findTemplateRefs(tableEl, ['matCellDef']);
  ngMocks.render(tableEl.componentInstance, cell, { position: 'testPosition' });
  expect(tableEl.nativeElement.innerHTML).toContain(
    '<td mat-cell=""> testPosition </td>',
  );
});
```

## Testing mat-header-row template

The approach to test `mat-header-row` is the same as above.

We need to find which directive belongs to `mat-header-row`,
it is `MatHeaderRowDef`.

The tools from `ng-mocks` we need:

- [`ngMocks.findInstance`](../../api/ngMocks/findInstance.md): to find the instance of `MatHeaderRowDef`

```ts
it('provides correct template for mat-header-row', () => {
  const targetComponent = MockRender(TargetComponent).point
    .componentInstance;
  const tableEl = ngMocks.find('[mat-table]');

  const header = ngMocks.findInstance(tableEl, MatHeaderRowDef);
  expect(header.columns).toBe(targetComponent.displayedColumns);
  expect(tableEl.nativeElement.innerHTML).not.toContain(
    '<tr mat-header-row=""></tr>',
  );
  ngMocks.render(tableEl.componentInstance, header);
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
  const targetComponent = MockRender(TargetComponent).point
    .componentInstance;
  const tableEl = ngMocks.find('[mat-table]');

  const row = ngMocks.findInstance(tableEl, MatRowDef);
  expect(row.columns).toBe(targetComponent.displayedColumns);
  expect(tableEl.nativeElement.innerHTML).not.toContain(
    '<tr mat-row=""></tr>',
  );
  ngMocks.render(tableEl.componentInstance, row);
  expect(tableEl.nativeElement.innerHTML).toContain(
    '<tr mat-row=""></tr>',
  );
});
```
