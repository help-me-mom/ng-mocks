---
title: ngMocks.findTemplateRef
description: Documentation about ngMocks.findTemplateRef from ng-mocks library
---

Returns the first found `TemplateRef` which belongs to the current element or its any child.
If the element is not specified, then the current fixture is used.

- `ngMocks.findTemplateRef( fixture?, directive, notFoundValue? )`
- `ngMocks.findTemplateRef( debugElement?, id, notFoundValue? )`
- `ngMocks.findTemplateRef( debugElement?, [attribute, value?], notFoundValue? )`

or simply with selectors which are supported by [`ngMocks.find`](find.md).

- `ngMocks.findTemplateRef( cssSelector?, [attribute, value?], notFoundValue? )`

## Directive

Assume, that a template has the next code.

```html
<ng-template my-directive-1></ng-template>
<span *my-directive-2></span>
```

Then we can find `ng-template` like that:

```ts
const tpl1 = ngMocks.findTemplateRef(MyDirective1);
const tpl2 = ngMocks.findTemplateRef(MyDirective2);
```

## Id

Assume, that a template has the next code.

```html
<ng-template #header></ng-template>
<ng-template #footer></ng-template>
```

Then we can find `ng-template` like that:

```ts
const tplHeader = ngMocks.findTemplateRef('header');
const tplFooter = ngMocks.findTemplateRef('footer');
```

## Attribute selector

Assume, that a template has the next code.

```html
<ng-template mat-row></ng-template>
<ng-template mat-cell></ng-template>
```

Then we can find `ng-template` like that:

```ts
const tplRow = ngMocks.findTemplateRef(['mat-row']);
const tplCell = ngMocks.findTemplateRef(['mat-cell']);
```

:::important
Pay attention that a tuple is used, otherwise it will be id look up.
:::

## Input with value

Assume, that a template has the next code.

```html
<ng-template myTpl="header"></ng-template>
<ng-template [myTpl]="property"></ng-template>
```

Then we can find `ng-template` like that:

```ts
const tplHeader = ngMocks.findTemplateRef(['myTpl', 'header']);
const tplInput = ngMocks.findTemplateRef(['myTpl', property]);
```

:::important
Pay attention that `property` is a variable.
:::
