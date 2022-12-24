---
title: ngMocks.findTemplateRefs
description: Documentation about ngMocks.findTemplateRefs from ng-mocks library
---

Returns an array of all found `TemplateRef` which belong to the current element and all its children.
If the element is not specified, then the current fixture is used.

- `ngMocks.findTemplateRefs( fixture?, directive )`
- `ngMocks.findTemplateRefs( debugElement?, id )`
- `ngMocks.findTemplateRefs( debugElement?, [attribute, value?] )`

or simply with selectors which are supported by [`ngMocks.find`](find.md).

- `ngMocks.findTemplateRefs( cssSelector?, [attribute, value?] )`

Assume, that a template has the next code.

```html
<ng-template myTpl="header"></ng-template>
<ng-template myTpl="footer"></ng-template>
```

Then, we can find `ng-template` like that:

```ts
// returns 2 elements
const allByDirective = ngMocks.findTemplateRefs(MyTplDirective);

// returns 2 elements
const allByAttribute = ngMocks.findTemplateRefs(['myTpl']);

// returns 1 element
const onlyHeaders = ngMocks.findTemplateRefs(['myTpl', 'header']);

// returns 1 element
const onlyFooters = ngMocks.findTemplateRefs(['myTpl', 'footer']);

// returns 0 elements
const empty = ngMocks.findTemplateRefs(['myTpl', 'body']);
```

More information can be found in [`ngMocks.findTemplateRef`](findTemplateRef.md).
