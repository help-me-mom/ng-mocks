---
title: How to test PrimeNG
sidebar_label: PrimeNG
---

`PrimeNG` provides vast UI components.
The best way to test their integration into the application
is to mock them with `ng-mocks` and verify that `inputs` / `outputs`
have been bound correctly, and if a component supports templates,
it received right ones.

For example, a component uses `p-calendar` component,
and its template is the next one:

```html
<p-calendar [(ngModel)]="dateValue">
  <ng-template pTemplate="header">Header</ng-template>
  <ng-template pTemplate="footer">Footer</ng-template>
</p-calendar>
```

To test it, we need to:

- mock `p-calendar`
- assert passed inputs
- assert listeners on outputs
- assert templates

:::note
Information about testing `ng-template` and its `TemplateRef` is taken from the [ngMocks.render](/api/ngMocks/render.md).
:::

## Spec file

With [`MockBuilder`](/api/MockBuilder.md), our spec file needs a single line to provide mocks:

```ts
beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

Where `TargetComponent` is a component which uses `p-calendar`,
and `TargetModule` is its module.

## Testing inputs of p-calendar

The tools from `ng-mocks` we need:

- [`MockRender`](/api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.find`](/api/ngMocks/find.md): to find a debug element which belongs to `p-calendar`
- [`ngMocks.input`](/api/ngMocks/input.md): to get an input's value

```ts
it('binds inputs', () => {
  // Rendering TargetComponent and accessing its instance.
  const targetComponent =
    MockRender(TargetComponent).point.componentInstance;

  // Looking for a debug element of `p-calendar`.
  const calendarEl = ngMocks.find('p-calendar');

  // Asserting bound properties.
  const actual = ngMocks.input(calendarEl, 'ngModel');
  expect(actual).toBe(targetComponent.dateValue);
});
```

## Testing outputs of p-calendar

The tools from `ng-mocks` we need:

- [`MockRender`](/api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.find`](/api/ngMocks/find.md): to find a debug element which belongs to `p-calendar`
- [`ngMocks.output`](/api/ngMocks/output.md): to get an output's `EventEmitter`

```ts
it('binds outputs', () => {
  // Rendering TargetComponent and accessing its instance.
  const targetComponent =
    MockRender(TargetComponent).point.componentInstance;

  // Looking for a debug element of `p-calendar`.
  const calendarEl = ngMocks.find('p-calendar');

  // Simulating an emit.
  const expected = new Date();
  ngMocks.output(calendarEl, 'ngModelChange').emit(expected);

  // Asserting the effect of the emit.
  expect(targetComponent.dateValue).toEqual(expected);
});
```

## Testing pTemplate="header" template

To test the `ng-template`,
we should find `TemplateRef` which belongs to `pTemplate` attribute with the provided value,
render it, and assert the rendered html.

The tools from `ng-mocks` we need:

- [`MockRender`](/api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.find`](/api/ngMocks/find.md): to find a debug element of `p-calendar`
- [`ngMocks.findTemplateRef`](/api/ngMocks/findTemplateRef.md): to find a template which belongs `pTemplate`
- [`ngMocks.render`](/api/ngMocks/render.md): to render the template

```ts
it('provides correct template for pTemplate="header"', () => {
  // Rendering TargetComponent.
  MockRender(TargetComponent);

  // Looking for a debug element of `p-calendar`.
  const calendarEl = ngMocks.find('p-calendar');

  // Looking for the template of 'header'.
  const header = ngMocks.findTemplateRef(calendarEl, [
    'pTemplate',
    'header',
  ]);

  // Verifies that the directive has been mocked.
  // And renders it.
  ngMocks.render(calendarEl.componentInstance, header);

  // Asserting the rendered template.
  expect(calendarEl.nativeElement.innerHTML).toContain('Header');
});
```

## Testing pTemplate="footer" template

The approach to test `pTemplate="footer"` is the same as above.

```ts
it('provides correct template for pTemplate="footer"', () => {
  // Rendering TargetComponent.
  MockRender(TargetComponent);

  // Looking for a debug element of `p-calendar`.
  const calendarEl = ngMocks.find('p-calendar');

  // Looking for the template of 'footer'.
  const footer = ngMocks.findTemplateRef(calendarEl, [
    'pTemplate',
    'footer',
  ]);

  // Verifies that the directive has been mocked.
  // And renders it.
  ngMocks.render(calendarEl.componentInstance, footer);

  // Asserting the rendered template.
  expect(calendarEl.nativeElement.innerHTML).toContain('Footer');
});
```
