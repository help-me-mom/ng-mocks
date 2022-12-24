---
title: How to test NGRS in Angular applications
sidebar_label: NGRS
---

If you need to avoid mocking of `NGRS` in your modules, you need to use [`.keep`](/api/MockBuilder.md#keep).

```ts
beforeEach(() =>
   MockBuilder(TargetComponent, TargetModule)
     // NgxsModule.forRoot() is called in TargetModule or its imports 
     .keep(NgxsModule.forRoot().ngModule) // keeps all NgxsModule.forRoot
     // add it only if your module imports NgxsModule.forFeature
     // NgxsModule.forFeature() is called in TargetModule or its imports
     .keep(NgxsModule.forFeature().ngModule) // keeps all NgxsModule.forFeature
 );
```

if your module imports `NgxsModule.forFeature` only, you need to add `NgxsModule.forRoot()` manually:

```ts
beforeEach(() =>
   MockBuilder(
     // keep and export
     [
       TargetComponent,
       NgxsModule.forRoot(), // provides required services
     ],
     // mock
     TargetModule,
   ).keep(NgxsModule.forFeature().ngModule) // keeps all NgxsModule.forFeature
 );
```
