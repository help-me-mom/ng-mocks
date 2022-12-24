---
title: Motivation and quick start
description: Quick explanation how to simplify mocking in Angular tests with help of ng-mocks
sidebar_label: Quick start
---

Angular testing is fun and easy until you have met complex dependencies,
and setting up the `TestBed` becomes really annoying and time-consuming.

`ng-mocks` helps to bring fun and ease back allowing developers
**to create [mock child components](/api/MockComponent.md)**
and stub dependencies via a few lines of code with help of
[`MockService`](/api/MockService.md),
[`MockComponent`](/api/MockComponent.md),
[`MockDirective`](/api/MockDirective.md),
[`MockPipe`](/api/MockPipe.md),
[`MockProvider`](/api/MockProvider.md),
[`MockModule`](/api/MockModule.md),
or with pro tools such as
[`MockBuilder`](/api/MockBuilder.md) with
[`MockRender`](/api/MockRender.md).

Let's suppose that in our Angular application you have a component, called `AppBaseComponent`,
and its template looks like that:

```html
<app-header [menu]="items">
  <app-search (search)="search($event)" [results]="search$ | async">
    <ng-template #item let-item>
      <strong>{{ item }}</strong>
    </ng-template>
  </app-search>
  {{ title | translate }}
</app-header>
<app-body appDark>
  <router-outlet></router-outlet>
</app-body>
<app-footer></app-footer>
```

This means that the component depends on the next child components, services and declarations:

- `AppHeaderComponent`
- `AppSearchComponent`
- `AppBodyComponent`
- `AppFooterComponent`
- `SearchService`
- `TranslatePipe`

You could easily test it with `schemas: [NO_ERRORS_SCHEMA]`
to avoid
[`Template parse errors: <component> is not a known element`](/troubleshooting/not-a-known-element.md),
and it would work, but in this case you have zero guarantee, that our tests will fail
if an interface of a dependency has been changed and requires
code updates. Therefore, you have to avoid `NO_ERRORS_SCHEMA`.

However, it forces us putting all dependencies in the `TestBed` like that:

```ts
TestBed.configureTestingModule({
  declarations: [
    // The only declaration we care about.
    AppBaseComponent,

    // Dependencies.
    AppHeaderComponent,
    AppDarkDirective,
    TranslatePipe,
    // ...
  ],
  imports: [
    CommonModule,
    AppSearchModule,
    // ...
  ],
  providers: [
    SearchService,
    // ...
  ],
});
```

And yes, nobody knows which dependencies the dependencies have,
although we definitely know that you do not want to worry about them.

That is where `ng-mocks` comes for help. Simply pass all the dependencies
into **helper functions to get their mock versions**
and to avoid a dependency hassle.

```ts
TestBed.configureTestingModule({
  declarations: [
    // The only declaration we care about.
    AppBaseComponent,

    // Mocking dependencies.
    MockComponent(AppHeaderComponent),
    MockDirective(AppDarkDirective),
    
    MockPipe(TranslatePipe),
    // ...
  ],
  imports: [
    MockModule(CommonModule),
    MockModule(AppSearchModule),
    // ...
  ],
  providers: [
    MockProvider(SearchService),
    // ...
  ],
});
```

If you have noticed `search$ | async` in the template, you made the right assumption:
you need to provide a fake observable stream to avoid failures
like [`Cannot read property 'pipe' of undefined`](/troubleshooting/read-property-of-undefined.md),
when the component tries to execute `this.search$ = this.searchService.result$.pipe(...)` in `ngOnInit`.

For example, you can implement it via [`MockInstance`](/api/MockInstance.md):

```ts
beforeEach(() =>
  MockInstance(SearchService, () => ({
    result$: EMPTY,
  })),
);
```

or if you want to set that as default mock behavior for all tests,
you can use [`ngMocks.defaultMock`](/api/ngMocks/defaultMock.md) in `src/test.ts`:

```ts title="src/test.ts"
ngMocks.defaultMock(SearchService, () => ({
  result$: EMPTY,
}));
```

Profit. Now, you can forget about noise of child dependencies.

Nevertheless, if we count lines of mock declarations,
we see that there are a lot of them,
and looks like here might be dozens more for components with many dependencies from many modules.
Also, what happens if someone has deleted `AppSearchModule`
from `AppBaseModule`? Does not look like the test will fail due to
a missed dependency.

Right, we need a tool that would extract declarations of the module
`AppBaseComponent` belongs to, and create mocks out of them like the code above.
Then, if someone deletes `AppSearchModule` the test fails too.

[`ngMocks.guts`](#ngmocksguts) and [`MockBuilder`](#mockbuilder) are the tool for that.

## ngMocks.guts 

[`ngMocks.guts`](/api/ngMocks/guts.md) works like that: it accepts 3 parameters, each one is optional.

- 1st parameter accepts things we want to test as they are, these won't be mocked.
- 2nd parameter accepts dependencies of the things. These dependencies will be mocked. In the case of modules,
  their imports, declarations and providers (guts) will be mocked. 
- 3rd parameter accepts things which should be excluded from the dependencies to provide sophisticated mocks later.

Any parameter can be `null` to neglect it, or an array if we want to pass more than one thing.

Now, let's apply [`ngMocks.guts`](/api/ngMocks/guts.md) to `AppBaseComponent` and its `AppBaseModule`
from the beginning of this article.

The goal is to mock guts of `AppBaseModule`, but to keep `AppBaseComponent` as it is for testing,
and to replace `SearchService` with a sophisticated mock.

Therefore,
`AppBaseComponent` should be passed as the first parameter,
`AppBaseModule` as the second one,
and `SearchService` as the third one.

```ts
const testModuleDeclaration = ngMocks.guts(
  AppBaseComponent, // keep
  AppBaseModule, // mock
  [SearchService], // exclude
);
```

[`ngMocks.guts`](/api/ngMocks/guts.md) detects that `AppBaseModule` is a module and extracts its guts
respecting the 1st and the 3rd parameters, what should be mocked and excluded.

The result of [`ngMocks.guts`](/api/ngMocks/guts.md) is the same as: 

```ts
const testModuleDeclaration = {
  declarations: [
    AppBaseComponent, // keep
    MockComponent(AppHeaderComponent),
    MockDirective(AppDarkDirective),
    MockPipe(TranslatePipe),
  ],
  imports: [
    MockModule(CommonModule),
    MockModule(AppSearchModule),
  ],
  providers: [
    // SearchService, // exclude
  ],
};
```

Now, let's add a sophisticated mock for `SearchService`.

```ts
testModuleDeclaration.providers.push({
  provide: SearchService,
  useValue: SophisticatedMockSearchService,
});
```

Profit. `TestBed` can be configured now.

```
TestBed.configureTestingModule(testModuleDeclaration);
```

And all together:

```ts
beforeEach(() => {
  const testModuleDeclaration = ngMocks.guts(
    AppBaseComponent, // keep
    AppBaseModule, // mock
    [SearchService], // exclude
  );
  testModuleDeclaration.providers.push({
    provide: SearchService,
    useValue: SophisticatedMockSearchService,
  });
  
  return TestBed.configureTestingModule(testModuleDeclaration);
});
```

### Lazy loaded modules

What about lazy loaded modules?

If you have a lazy module, then it alone might be not sufficient, and
you need to add its parent module, for example `AppModule`.
In such a case, simply pass an array of modules as the second
parameter.

```ts
TestBed.configureTestingModule(
  ngMocks.guts(
    AppBaseComponent, // keep
    [AppBaseModule, AppModule], // mock
  ),
);
```

Profit. That should be enough for the start.

## MockBuilder

The functions above help with an easy start, but they do not cover all
possible cases and do not provide tools for customizing behavior.
Consider reading [`MockBuilder`](/api/MockBuilder.md) and [`MockRender`](/api/MockRender.md)
if you want **to create mocks for child dependencies like a pro**
in Angular tests.

For example, if you needed `TranslatePipe` to prefix its strings instead of
translating them, and to create a stub `SearchService` with an empty result which would not cause
an error during execution because of a missed observable in its mock object,
the code would look like:

```ts
beforeEach(() => {
  return MockBuilder(AppBaseComponent, AppBaseModule)
    // TranslatePipe is declarared / imported in AppBaseModule
    .mock(TranslatePipe, v => `translated:${v}`)
    // SearchService is provided / imported in AppBaseModule
    .mock(SearchService, {
      result$: EMPTY,
    });
});
```

Profit.

Have a question still? Do not hesitate to [contact us](/need-help.md).
