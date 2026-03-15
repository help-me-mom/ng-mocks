---
title: How to test NGXS in Angular applications
sidebar_label: NGXS
---

If you need to avoid mocking `NGXS` in your modules, use [`.keep`](/api/MockBuilder.md#keep).

```ts
beforeEach(() =>
   MockBuilder(TargetComponent, TargetModule)
     
     // NgxsModule.forRoot() is called in TargetModule or its imports 
     .keep(NgxsModule.forRoot().ngModule) // keeps all NgxsModule.forRoot
     
     // add it only if your module imports NgxsModule.forFeature
     // NgxsModule.forFeature() is called in TargetModule or its imports
     .keep(NgxsModule.forFeature().ngModule) // keeps all NgxsModule.forFeature
     
     // keeps the root provider of the store
     .keep(Store)
 );
```

If your module imports only `NgxsModule.forFeature`, you need to add `NgxsModule.forRoot()` and `Store` manually:

```ts
beforeEach(() =>
   MockBuilder(
     // keep and export
     [
       TargetComponent,
       NgxsModule.forRoot(), // provides required services
       Store, // keeps the root provider of the store
     ],
     // mock
     TargetModule,
   ).keep(NgxsModule.forFeature().ngModule) // keeps all NgxsModule.forFeature
 );
```
