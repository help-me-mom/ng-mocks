---
title: How to render TemplateRef of a mock declaration
description: Information how to render ng-templates and structural directives which belong to a mock component or directive
sidebar_label: Testing TemplateRef
---

:::warning This functionality has been **deprecated**

Please use:

- [ngMocks.render](/api/ngMocks/render.md)
- [ngMocks.hide](/api/ngMocks/hide.md)

:::

Templates are often used in UI component libraries such as
**Angular Material**, **NG Bootstrap**, **PrimeNG**, **ng-select** etc.
They bring **flexibility via templates** when we want
to render a table or a calendar, but with **custom design**.

Usually, they are declared like a structural directive or with ids:

```html
<!-- id -->
<ng-template #header>...</ng-template>

<!-- structural directive -->
<ng-template pTemplate="header">...</ng-template>
<ng-template ng-label-tmp let-item="item">...</ng-template>

<!-- structural directive -->
<tr *matHeaderRowDef="..."></tr>
```

## Solution

In a test, **instead of fighting** with providing all required data for ui components,
we could **mock them** and assert that their inputs / outputs have been linked correctly,
and injected **templates contain what we want**,
but when and how they are rendered by the library - we do not want to care.

There are several **test examples** for different UI libraries:

- [ng-select](/guides/libraries/ng-select.md)
- [Angular Material and `mat-table`](/guides/libraries/angular-material.md)
- [PrimeNG and `p-calendar`](/guides/libraries/primeng.md)

Other libraries / components can be tested in the similar way.

### Templates by id

```html
<xd-card>
  <ng-template #header>My Header</ng-template>
  <ng-template #footer>My Footer</ng-template>
</xd-card>
```

This code means, that `xd-card` uses `ContentChild('header')` and `ContentChild('footer')` to fetch
the templates.

In order to manipulate them, `ng-mock` provides `__render(id, context?, additionalVars?)` and `__hide(id)` functions.

In case of this example, we need to:

1. find the component's instance
1. ensure that it has been mocked
1. render the templates
1. assert their content

```ts
// looking for the instance
const component = ngMocks.findInstance(XdCardComponent);

// checking that the component is a mock
if (isMockOf(component, XdCardComponent, 'c')) {
  component.__render('header');
  component.__render('footer');
}

// asserting header
const header = ngMocks.find('[data-key="header"]');
expect(header.nativeElement.innerHTML)
  .toContain('My Header');

// asserting footer
const footer = ngMocks.find('[data-key="footer"]');
expect(footer.nativeElement.innerHTML)
  .toContain('My Footer');
```

That is it. Now we have a test which verifies templates for `xd-card`.

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestTemplateRefById/test.spec.ts&initialpath=%3Fspec%3DTestTemplateRefById)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestTemplateRefById/test.spec.ts&initialpath=%3Fspec%3DTestTemplateRefById)

### Templates by directive

```html
<xd-card>
  <ng-template xdTpl="header">My Header</ng-template>
  <ng-template xdTpl="footer">My Footer</ng-template>
</xd-card>
```

This approach differs a bit from rendering `ng-templates` by `id`.
This code means, that `xd-card` relies on a directive with the `xdTpl` selector,
in order to get the desired templates.

And so do we. The **render is based** not on the related component,
but **on the related directive**. Therefore, we need to:

1. find the directives
1. ensure that they have been mocked
1. render their templates
1. assert their content

:::important
Currently, it is not as easy as could be.
We can find the directive via providing its class,
but, unfortunately, not its selector.

However, good news is that it will be changed soon.
Please follow this issue on GitHub: [render by selector](https://github.com/help-me-mom/ng-mocks/issues/292).
:::

```ts
// looking for the element
// which is produced
// by the desired component
const container = ngMocks.find('xd-card');

// fetching directives
const [header, footer] = ngMocks.findInstances(
  container,
  XdTplDirective,
);

// asserting header
expect(header.xdTpl).toEqual('header');
ngMocks.render(header, header);
expect(container.nativeElement.innerHTML)
  .toContain('My Header');

// asserting footer
expect(footer.xdTpl).toEqual('footer');
ngMocks.render(footer, footer);
expect(container.nativeElement.innerHTML)
  .toContain('My Footer');
```

Done. Now we have a test which verifies that `xd-card` gets the desired templates.

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestTemplateRefByDirective/test.spec.ts&initialpath=%3Fspec%3DTestTemplateRefByDirective)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestTemplateRefByDirective/test.spec.ts&initialpath=%3Fspec%3DTestTemplateRefByDirective)

### TemplateRef in properties

There is one more way to render `TemplateRef` of a mock component -
when we know the property which has been decorated with `ContentChild` or `ContentChildren`.

For example, we know that `XdCardComponent` uses `ContentChildren` on `tpls` property in order to fetch all templates. 

```html
<xd-card>
  <ng-template xdTpl="header">My Header</ng-template>
  <ng-template xdTpl="footer">My Footer</ng-template>
</xd-card>
```

Then we can use a special interface of `__render` method for properties. To do so, we need to a tuple as the first parameter.

```ts
ngMocks.render(component, ngMocks.findTemplateRef('header'));
```

This call will render the whole `QueryList` if it is `ContentChildren` or `TemplateRef` if it is `ContentChild`.

If we want to render only particular element, then we can pass its index in the tuple.

```ts
ngMocks.render(component, ngMocks.findTemplateRef('footer'));
```

The sample approach works for `hide`.

```ts
ngMocks.hide(component);
```

The templates will be rendered under a special element with `data-prop` attribute.
We can find them with the next query:

```ts
const element = ngMocks.find('[data-prop="tpls"]');
```
