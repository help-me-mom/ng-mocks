---
title: ngMocks.render
description: Documentation about `ngMocks.render` from ng-mocks library
---

`ngMocks.render` goes through **all queries**, such as `ContentChild` and `ContentChildren`,
tries to find related `TemplateRef` or a **structural directive**, and render it with a given context.

In order to hide them, use [`ngMocks.hide`](hide.md).

```ts
ngMocks.render(declarationInst, templateRef);
ngMocks.render(declarationInst, templateRef, context);
ngMocks.render(declarationInst, templateRef, context, variables);
```

```ts
ngMocks.render(declarationInst, debugNode);
ngMocks.render(declarationInst, debugNode, context);
ngMocks.render(declarationInst, debugNode, context, variables);
```

```ts
ngMocks.render(declarationInst, structuralDir);
ngMocks.render(declarationInst, structuralDir, context);
ngMocks.render(declarationInst, structuralDir, context, variables);
```

- `declarationInst` should be an instance of a component or attribute directive
- `templateRef` should be a `TemplateRef` instance
- `structuralDir` should be an instance of a structural directive
- `context` an optional context variable
- `variables` additional context variables

The **first** and the **second** parameter **cannot be empty**. 

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestTemplateRefByRender/test.spec.ts&initialpath=%3Fspec%3DTestTemplateRefByRender)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestTemplateRefByRender/test.spec.ts&initialpath=%3Fspec%3DTestTemplateRefByRender)

## Render TemplateRef / ng-template

To render a `TemplateRef` / `ng-template` we need to have 2 things:

- a variable which points to a component / directive with the query
- a variable which points to the template

The first task can be solved by [`ngMocks.find`](find.md) or [`ngMocks.findInstance`](findInstance.md),
the second task can be solved by [`ngMocks.findTemplateRef`](findTemplateRef.md).

Let's assume, that we have the next template:

```html
<xd-card>
  <ng-template #id let-label="label">
    rendered-id-{{ label }}
  </ng-template>
  
  <ng-template myTpl="header" let-label>
    rendered-header-{{ label }}
  </ng-template>
  
  <span my-tpl *myTpl="'footer'; let label">
    rendered-footer-{{ label }}
  </span>
</xd-card>
```

### Component pointer

Let's find `xd-card` component:

```ts
const xdCardEl = ngMocks.find('xd-card');
```

Or we can use its class:

```ts
const xdCardEl = ngMocks.find(XdCardComponent);
```


**Please note**, it can be not only an instance of a component,
but an instance of **attribute directive** too.

### Template pointer

Now, let's find the 3 templates:

```ts
const tplId = ngMocks.findTemplateRef(
  xdCardEl,
  // id of the template
  'id',
);

const tplHeader = ngMocks.findTemplateRef(
  xdCardEl,
  // attr and value on the template
  ['myTpl', 'header'],
);

const tplFooter = ngMocks.findTemplateRef(
  xdCardEl,
  // attr and value on the template
  ['myTpl', 'footer'],
);
```

Please note, that we cannot find `tplFooter` by `my-tpl`,
because `*myTpl` is syntactic sugar and `my-tpl` belongs **not** to the desired template, but to its nested `span`.

### Rendering id

To render `TemplateRef` of a **mock component**, we need to pass it as the **second parameter** of `ngMocks.render`.
The third and the fourth parameters are used to **provide context** for the template.

```ts
ngMocks.render(
  xdCardEl.componentInstance,
  tplId,
  undefined,
  {label: 'test'},
);
```

Now we can assert the rendered html:

```ts
expect(xdCardEl.nativeElement.innerHTML)
  .toContain('rendered-id-test');
```

### Rendering header

The process is the same as above:

```ts
ngMocks.render(
  xdCardEl.componentInstance,
  tplHeader,
  'test',
);
expect(xdCardEl.nativeElement.innerHTML)
  .toContain('rendered-header-test');
```

### Rendering footer

The process is the same as above:

```ts
ngMocks.render(
  xdCardEl.componentInstance,
  tplFooter,
  'test',
);
expect(xdCardEl.nativeElement.innerHTML)
  .toContain('<span my-tpl=""> rendered-footer-test </span>');
```

## Render structural directives

`ngMocks.render` renders not only `TemplateRef`, but also structural directives.

Let's find all instances of `MyTplDirective`.

```ts
const [header, footer] = ngMocks.findInstances(
  xdCardEl,
  MyTplDirective,
);
```

Because they are structural directives, we have 2 options:

- to render it from the component
- to render it directly

The **difference** is that the first option also ensures that the component
has **linked queries** to reach the directive.

### Via queries

To verify queries, we need to pass the component as the first parameter,
and the **desired structural directive** as the second one.

```ts
ngMocks.render(xdCardEl.componentInstance, header, 'test');
expect(xdCardEl.nativeElement.innerHTML)
  .toContain('rendered-header-test');
```

### Directly

To render a **structural directive directly** we need to pass its instance 
as the first and as the **second parameter** of `ngMocks.render`.

```ts
ngMocks.render(footer, footer, 'test');
expect(xdCardEl.nativeElement.innerHTML)
  .toContain('rendered-footer-test');
```

## Deeply nested templates

It is possible to render any `TemplateRef` or structural directive on **any depth**,
the only requirement is to have **enough queries** to reach it from the desired instance.

Let's consider the next template:

```html
<xd-card>
  <xd-header>
    <xd-cell>
      <ng-template icon>(i)</ng-template>
    </xd-cell>
  </xd-header>
</xd-card>
```

Then, if `xdCard` points to its component instance and `icon` points to
the nested `ng-template`, we can render it like that:

```ts
ngMocks.render(xdCard, icon);
```

A useful thing here is that the render will fail if a query is removed between elements.  
