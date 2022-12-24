---
title: ngMocks.hide
description: Documentation about `ngMocks.hide` from ng-mocks library
---

`ngMocks.hide` hides what [`ngMocks.render`](render.md) has rendered. 

```ts
ngMocks.hide(declarationInst);
ngMocks.hide(declarationInst, templateRef);
ngMocks.hide(declarationInst, debugNode);
ngMocks.hide(declarationInst, structuralDir);
```

- `declarationInst` should be an instance of a component or attribute directive
- `templateRef` should be a `TemplateRef` instance
- `structuralDir` should be an instance of a structural directive

## No parameter

If no parameter has been given, then **all rendered** templates and structural directives
which are reachable via queries will **be hidden**.

```ts
ngMocks.hide(declarationInst);
```

## TemplateRef

If the second parameter is `TemplateRef`, then **only the template** will be **hidden**.

```ts
ngMocks.hide(componentInst, templateRef);
ngMocks.hide(directiveInst, templateRef);
```

## Structural directive

If the second parameter is an instance of **structural directive**, then only its template will be **hidden**.

```ts
ngMocks.hide(componentInst, structuralDir);
```

To hide a structural directive **itself**, simply pass it as the second parameter.

```ts
ngMocks.hide(structuralDir, structuralDir);
```
