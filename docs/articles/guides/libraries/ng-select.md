---
title: How to test usage of ng-select in Angular applications
sidebar_label: ng-select
---

In order to test `ng-select`, we need to ensure that we are passing right
`inputs` / `outputs` into it.
Apart from that, we need to verify `ng-templates` if we are customizing `ng-select`.

Let's imagine that the template of a component uses `ng-select` in the next way:

```html
<ng-select
  [items]="cities"
  groupBy="avatar"
  [(ngModel)]="selectedCity"
  bindLabel="name"
  bindValue="name"
>
  <!-- ng-label-tmp template -->
  <ng-template ng-label-tmp let-item="item">
    <strong>{{ item.name }}</strong>
  </ng-template>

  <!-- ng-optgroup-tmp template -->
  <ng-template ng-optgroup-tmp let-item="item" let-index="index">
    {{ index }}
    <img [src]="item.avatar" [alt]="item.name" />
  </ng-template>

  <!-- ng-option-tmp template -->
  <ng-template
    ng-option-tmp
    let-item="item"
    let-index="index"
    let-search="searchTerm"
  >
    <span class="ng-option-tmp">
      {{ search }} {{ item.name }}
    </span>
  </ng-template>
</ng-select>
```

Therefore, to test it we need to:

- mock `ng-select`
- assert passed inputs
- assert listeners on outputs
- assert templates

:::note
Information about testing `ng-template` and its `TemplateRef` is taken from the [ngMocks.render](/api/ngMocks/render.md).
:::

## Spec file

The best way to mock everything except our component is to use [`MockBuilder`](/api/MockBuilder.md).
Let's assume that the component is called `TargetComponent` and the module it belongs to is called `TargetModule`.

Then our `beforeEach` should look like that:

```ts
beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

## Testing inputs of ng-select

There are 5 inputs we bind on `ng-select` based on the template of the component:

2 are bound to properties of the component's instance:

- items
- ngModel

3 are static:

- groupBy
- bindLabel
- bindValue

Therefore, to write a test, we need to use:

- [`MockRender`](/api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.find`](/api/ngMocks/find.md): to find a debug element which belongs to `NgSelectComponent`
- [`ngMocks.input`](/api/ngMocks/input.md): to get an input's value

```ts
it('binds inputs', () => {
  // Rendering TargetComponent and accessing its instance.
  const targetComponent =
    MockRender(TargetComponent).point.componentInstance;

  // Looking for a debug element of the ng-select.
  const ngSelectEl = ngMocks.find('ng-select');

  // Asserting bound properties.
  expect(ngMocks.input(ngSelectEl, 'items')).toBe(
    targetComponent.cities,
  );
  expect(ngMocks.input(ngSelectEl, 'ngModel')).toBe(
    targetComponent.selectedCity,
  );

  // Asserting static properties.
  expect(ngMocks.input(ngSelectEl, 'groupBy')).toEqual('avatar');
  expect(ngMocks.input(ngSelectEl, 'bindLabel')).toEqual('name');
  expect(ngMocks.input(ngSelectEl, 'bindValue')).toEqual('name');
});
```

## Testing outputs of ng-select

There is 1 output we bind on `ng-select`.
Following Angular naming convention, the name of output for `[(ngModel)]` is `ngModelChange`.

Therefore, to convert it with a test, we need to use:

- [`MockRender`](/api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.find`](/api/ngMocks/find.md): to find a debug element which belongs to `NgSelectComponent`
- [`ngMocks.output`](/api/ngMocks/output.md): to get an output's `EventEmitter`

```ts
it('binds outputs', () => {
  // Rendering TargetComponent and accessing its instance.
  const targetComponent =
    MockRender(TargetComponent).point.componentInstance;

  // Looking for a debug element of the ng-select.
  const ngSelectEl = ngMocks.find('ng-select');

  // Simulating an emit.
  ngMocks.output(ngSelectEl, 'ngModelChange').emit('test');

  // Asserting the effect of the emit.
  expect(targetComponent.selectedCity).toEqual('test');
});
```

## Testing ng-label-tmp template

To test a template of `ng-select`,
we need to find a debug element of `ng-select`,
then to find a template which belongs to `ng-label-tmp`,
and to render it with a proper context.

To write a test, we need to use:

- [`MockRender`](/api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.find`](/api/ngMocks/find.md): to find a debug element which belongs to `NgSelectComponent`
- [`ngMocks.findTemplateRef`](/api/ngMocks/findTemplateRef.md): to find the template which belongs to `ng-label-tmp`
- [`ngMocks.render`](/api/ngMocks/render.md): to render the template

```ts
it('provides correct template for ng-label-tmp', () => {
  // Rendering TargetComponent.
  MockRender(TargetComponent);

  // Looking for a debug element of the ng-select.
  const ngSelectEl = ngMocks.find('ng-select');

  // Looking for the ng-label-tmp template
  const ngLabelTmp = ngMocks.findTemplateRef(
    ngSelectEl,
    // attr name
    ['ng-label-tmp'],
  );

  // Verifies that ngSelect can access ngLabelTmp,
  // and renders it.
  ngMocks.render(
    ngSelectEl.componentInstance,
    ngLabelTmp,
    {},
    // Providing context variables.
    { item: { name: 'test' } },
  );

  // Asserting the rendered html.
  expect(ngSelectEl.nativeElement.innerHTML).toContain(
    '<strong>test</strong>',
  );
});
```

## Testing ng-optgroup-tmp template

The approach to test `ng-optgroup-tmp` is the same as above.

```ts
it('provides correct template for ng-optgroup-tmp', () => {
  // Rendering TargetComponent and accessing its instance.
  MockRender(TargetComponent);

  // Looking for a debug element of the ng-select.
  const ngSelectEl = ngMocks.find('ng-select');

  // Looking for the ng-optgroup-tmp template
  const ngOptgroupTmp = ngMocks.findTemplateRef(
    ngSelectEl,
    // attr name
    ['ng-optgroup-tmp'],
  );

  // Verifies that ngSelect can access ngOptgroupTmp,
  // and renders it.
  ngMocks.render(
    ngSelectEl.componentInstance,
    ngOptgroupTmp,
    {},
    // Providing context variables.
    {
      index: 7,
      item: {
        avatar: 'test.jpeg',
        name: 'test',
      },
    },
  );

  // Asserting the rendered html.
  expect(ngSelectEl.nativeElement.innerHTML).toContain(
    '7 <img src="test.jpeg" alt="test">',
  );
});
```

## Testing ng-option-tmp template

The approach to test `ng-option-tmp` is the same as above.

```ts
it('provides correct template for ng-option-tmp', () => {
  // Rendering TargetComponent and accessing its instance.
  MockRender(TargetComponent);

  // Looking for a debug element of the ng-select.
  const ngSelectEl = ngMocks.find('ng-select');

  // Looking for the ng-option-tmp template
  const ngOptionTmp = ngMocks.findTemplateRef(
    ngSelectEl,
    // attr name
    ['ng-option-tmp'],
  );

  // Verifying that the instance has been mocked.
  // And rendering its property,
  // which points to the desired TemplateRef.
  ngMocks.render(
    ngSelectEl.componentInstance,
    ngOptionTmp,
    {},
    // Providing context variables.
    {
      item: {
        name: 'test',
      },
      searchTerm: 'search',
    },
  );

  // Asserting the rendered html.
  expect(ngSelectEl.nativeElement.innerHTML).toContain(
    '<span class="ng-option-tmp">search test</span>',
  );
});
```
