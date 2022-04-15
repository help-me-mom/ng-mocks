---
title: How to test NGRS in Angular applications
sidebar_label: NGRS
---

If you need to avoid mocking of `NGRS` in your modules, you need to use [`.keep`](../../api/MockBuilder.md#keep).

```ts
beforeEach(() =>
   MockBuilder(TargetComponent, TargetModule)
     .keep(NgxsModule.forRoot().ngModule) // keeps all NgxsModule.forRoot
     // add it only if your module imports NgxsModule.forFeature
     .keep(NgxsModule.forFeature().ngModule) // keeps all NgxsModule.forFeature
 );
```

if your module imports `NgxsModule.forFeature` only, you need to add `NgxsModule.forRoot()` manually:

```ts
beforeEach(() =>
   MockBuilder(TargetComponent, TargetModule)
     .keep(NgxsModule.forRoot()) // provides required services
     .keep(NgxsModule.forFeature().ngModule) // keeps all NgxsModule.forFeature
 );
```
