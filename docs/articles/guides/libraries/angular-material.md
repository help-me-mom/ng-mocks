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

## Keeping MatButton and MatIcon

This standalone Angular Material 22 component renders a button containing an icon:

```ts
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'target-15042',
  imports: [MatButton, MatIcon],
  template: '<button matButton><mat-icon>home</mat-icon></button>',
})
class TargetComponent {}
```

To render the real button and icon, keep `MatButton` and `MatIcon` with
[`MockBuilder.keep`](/api/MockBuilder.md#keep). **Keep their root services with additional `.keep` calls:**
`MediaMatcher` for the button and `MatIconRegistry` for the icon.

```ts
import { MediaMatcher } from '@angular/cdk/layout';
import { MatIconRegistry } from '@angular/material/icon';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

beforeEach(() =>
  MockBuilder(TargetComponent)
    .keep(MatButton)
    .keep(MatIcon)
    .keep(MediaMatcher)
    .keep(MatIconRegistry),
);

it('renders the button and icon', () => {
  const fixture = MockRender(TargetComponent);

  expect(ngMocks.formatText(fixture)).toEqual('home');
});
```

Keeping the components preserves their real implementations, while root services can still be mocked.
A default mock method returns `undefined`: `MatIcon` can then fail when it calls `.filter()` on the result of
`MatIconRegistry.getDefaultFontSetClass()`, and `MatButton` can fail when it reads `.matches` from
`MediaMatcher.matchMedia(...)`. Keeping the two services supplies the values those real implementations need.
Other application root services remain eligible for automatic mocking.

### Keeping all root providers

For a simpler setup, replace the individual service keeps with
[`NG_MOCKS_ROOT_PROVIDERS`](/api/MockBuilder.md#ng_mocks_root_providers-token):

```ts
import { NG_MOCKS_ROOT_PROVIDERS } from 'ng-mocks';

beforeEach(() =>
  MockBuilder(TargetComponent)
    .keep(MatButton)
    .keep(MatIcon)
    .keep(NG_MOCKS_ROOT_PROVIDERS),
);
```

This keeps **all root providers**, including non-Material application services.
Explicit `.mock(...)` calls still apply when particular application services should remain mocked.

You can also configure a mock to return the values its real consumer expects. For example, an icon-only test can
use `.mock(MatIconRegistry, { getDefaultFontSetClass: () => ['custom-icon', ''] })` to render the icon with a
`custom-icon` class. Configure other methods when the tested behavior needs them.

The [executable Material example](https://github.com/help-me-mom/ng-mocks/blob/main/tests-e2e/src/issue-15042/test.spec.ts)
checks errors from unconfigured root mocks, both keep options, explicit application mocks, and the customized icon registry.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/tests/issue-15042/test.spec.ts&initialpath=%3Fspec%3Dissue-15042%3Amaterial)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/tests/issue-15042/test.spec.ts&initialpath=%3Fspec%3Dissue-15042%3Amaterial)
