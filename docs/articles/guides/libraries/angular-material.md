---
title: How to test the usage of @angular/material (Angular Material) in Angular applications
sidebar_label: Angular Material
---

`Angular Material` is a UI library with a lot of UI components.
Below you can find information on how to test a component that uses `Angular Material`.

The next example will be based on usage of `mat-table`.
Let's assume that a component uses `mat-table` like this:

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
Information about testing `ng-template` and its `TemplateRef` is taken from the [ngMocks.render](/api/ngMocks/render.md).
:::

## Spec file

With [`MockBuilder`](/api/MockBuilder.md), our spec file needs a single line to provide mocks:

```ts
beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

Where `TargetComponent` is a component which uses `mat-table`,
and `TargetModule` is its module.

## Testing inputs of mat-table

In this test we need to verify that `mat-table` data from out component's instance.

The tools from `ng-mocks` we need:

- [`MockRender`](/api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.reveal`](/api/ngMocks/reveal.md): to find a debug element of `MatTable`
- [`ngMocks.input`](/api/ngMocks/input.md): to get an input's value

```ts
it('binds inputs', () => {
  // Rendering TargetComponent and accessing its instance.
  const targetComponent =
    MockRender(TargetComponent).point.componentInstance;

  // Looking for a debug element of `MatTable`.
  const tableEl = ngMocks.reveal(['mat-table']);

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

- [`MockRender`](/api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.reveal`](/api/ngMocks/reveal.md): to find debug elements of `mat-table` and `ng-container`
- [`ngMocks.formatHtml`](/api/ngMocks/formatHtml.md): to get html of a `ng-container`
- [`ngMocks.render`](/api/ngMocks/render.md): to render the templates

```ts
it('provides correct template for matColumnDef="position"', () => {
  MockRender(TargetComponent);
  // looking for the table and container
  const tableEl = ngMocks.reveal(['mat-table']);
  const containerEl = ngMocks.reveal(['matColumnDef', 'position']);

  // checking that there are no artifacts around
  expect(ngMocks.formatHtml(containerEl)).toEqual('');

  // checking header
  const headerEl = ngMocks.reveal(containerEl, [
    'matHeaderCellDef',
  ]);
  ngMocks.render(tableEl.componentInstance, headerEl);
  expect(ngMocks.formatHtml(headerEl)).toEqual(
    '<th mat-header-cell="">No.</th>',
  );

  // checking cell
  const cellEl = ngMocks.reveal(containerEl, ['matCellDef']);
  ngMocks.render(tableEl.componentInstance, cellEl, {
    position: 'testPosition',
  });
  expect(ngMocks.formatHtml(cellEl)).toEqual(
    '<td mat-cell=""> testPosition </td>',
  );
});
```

## Testing mat-header-row template

The approach to test `mat-header-row` is the same as above.

We need to find which directive belongs to `mat-header-row`,
it is `MatHeaderRowDef`.

The tools from `ng-mocks` we need:

- [`ngMocks.findInstance`](/api/ngMocks/findInstance.md): to find the instance of `MatHeaderRowDef`

```ts
it('provides correct template for mat-header-row', () => {
  const targetComponent =
    MockRender(TargetComponent).point.componentInstance;
  const tableEl = ngMocks.reveal(['mat-table']);

  // checking that there are no artifacts around
  expect(ngMocks.formatHtml(tableEl)).toEqual('');

  const header = ngMocks.findInstance(tableEl, MatHeaderRowDef);
  expect(header.columns).toBe(targetComponent.displayedColumns);
  ngMocks.render(tableEl.componentInstance, header);
  expect(ngMocks.formatHtml(tableEl)).toContain(
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
  const targetComponent =
    MockRender(TargetComponent).point.componentInstance;
  const tableEl = ngMocks.reveal(['mat-table']);

  // checking that there are no artifacts around
  expect(ngMocks.formatHtml(tableEl)).toEqual('');

  const row = ngMocks.findInstance(tableEl, MatRowDef);
  expect(row.columns).toBe(targetComponent.displayedColumns);
  ngMocks.render(tableEl.componentInstance, row);
  expect(ngMocks.formatHtml(tableEl)).toContain(
    '<tr mat-row=""></tr>',
  );
});
```

## Keep Material Components

Use [`.keep`](/api/MockBuilder.md#keep) to render real Material components.
**Keep their root services too**, otherwise default mocks can cause errors.

For example, keep `MatButton` and `MatIcon` in a standalone `TargetComponent`:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent)
    .keep(MatButton)
    .keep(MatIcon)
    .keep(MediaMatcher) // root service used by MatButton
    .keep(MatIconRegistry), // root service used by MatIcon
);
```

Alternatively, keep all root providers with
[`NG_MOCKS_ROOT_PROVIDERS`](/api/MockBuilder.md#ng_mocks_root_providers-token):

```ts
beforeEach(() =>
  MockBuilder(TargetComponent)
    .keep(MatButton)
    .keep(MatIcon)
    .keep(NG_MOCKS_ROOT_PROVIDERS),
);
```

:::note
`NG_MOCKS_ROOT_PROVIDERS` keeps **all root providers**, including non-Material services.
:::

- [Full example](https://github.com/help-me-mom/ng-mocks/blob/main/tests-e2e/src/issue-15042/test.spec.ts)
- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/tests/issue-15042/test.spec.ts&initialpath=%3Fspec%3Dissue-15042%3Amaterial)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/tests/issue-15042/test.spec.ts&initialpath=%3Fspec%3Dissue-15042%3Amaterial)
