---
title: Motivation and quick start
description: Quick explanation how to simplify mocking in Angular tests with help of ng-mocks
sidebar_label: Quick start
---

Angular testing is fun and easy until we have met complex dependencies,
and setting up the `TestBed` becomes really annoying and time-consuming.

`ng-mocks` helps to bring fun and ease back allowing developers
**to create [mock child components](../api/MockComponent.md)**
and stub dependencies via a few lines of code with help of
[`MockService`](../api/MockService.md),
[`MockComponent`](../api/MockComponent.md),
[`MockDirective`](../api/MockDirective.md),
[`MockPipe`](../api/MockPipe.md),
[`MockProvider`](../api/MockProvider.md),
[`MockModule`](../api/MockModule.md),
or with pro tools such as
[`MockBuilder`](../api/MockBuilder.md) with
[`MockRender`](../api/MockRender.md).

Let's suppose that in our Angular application we have a base component,
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

This means that our base component depends on the next child components, services and declarations:

- `AppHeaderComponent`
- `AppSearchComponent`
- `AppBodyComponent`
- `AppFooterComponent`
- `SearchService`
- `TranslatePipe`

We could easily test it with `schemas: [NO_ERRORS_SCHEMA]`
to avoid
[`Template parse errors: <component> is not a known element`](../troubleshooting/not-a-known-element.md),
and it would work, but in this case we have zero guarantee, that our tests will fail
if an interface of a dependency has been changed and requires
code updates. Therefore, we have to avoid `NO_ERRORS_SCHEMA`.

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
although we definitely know that we do not want to worry about them.

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
we need to provide a fake observable stream within the mock `SearchService` to avoid failures
like [`Cannot read property 'pipe' of undefined`](../troubleshooting/read-property-of-undefined.md),
when the component tries to execute `this.search$ = this.searchService.result$.pipe(...)` in `ngOnInit`.

For example, we can implement it via [`MockInstance`](../api/MockInstance.md):

```ts
beforeEach(() =>
  MockInstance(SearchService, () => ({
    result$: EMPTY,
  })),
);
```

or if we want to set it as default mock behavior for all tests,
we can use [`ngMocks.defaultMock`](../api/ngMocks/defaultMock.md) in `src/test.ts`:

```ts title="src/test.ts"
ngMocks.defaultMock(SearchService, () => ({
  result$: EMPTY,
}));
```

Profit. Now, we can forget about noise of child dependencies.

Nevertheless, if we count lines of mock declarations,
we see that there are a lot of them, and looks like here might be dozens more for big
components. Also, what happens if someone deletes `AppSearchModule`
from `AppBaseModule`? Does not look like the test will fail due to
a missed dependency.

Right, we need a tool that would extract declarations of the module
`AppBaseComponent` belongs to, and create mocks out of them like the code above.
Then, if someone deletes `AppSearchModule` the test fails too.

[`ngMocks.guts`](../api/ngMocks/guts.md) and [`MockBuilder`](../api/MockBuilder.md) are the tool for that.

[`ngMocks.guts`](../api/ngMocks/guts.md) works like that:
its first parameter accepts things we want to test (avoid mocks),
the second parameter accepts things out of which we want to create mocks, if it is a module,
its declarations (guts) will be turned into mocks, except the things
from the first parameter, and the third parameter accepts things we want
to exclude at all from the final meta. Any parameter can be `null` if
we need to skip it, or an array if we want to pass more than one.

```ts
const testModuleMeta = ngMocks.guts(AppBaseComponent, AppBaseModule);
// feel free to add extra stuff
// testModuleMeta.providers.push({
//   provide: SearchService,
//   useValue: SpiedSearchService,
// });
TestBed.configureTestingModule(testModuleMeta);
```

Profit, but what about lazy loaded modules?

If we have a lazy module, then it alone might be not sufficient, and
we need to add its parent module, for example `AppModule`.
In such a case, simply pass an array of modules as the second
parameter.

```ts
TestBed.configureTestingModule(
  ngMocks.guts(
    AppBaseComponent, // <- kept as it is.
    [AppBaseModule, AppModule],
  ),
);
```

Profit. That should be enough for the start.

The functions above help with an easy start, but they do not cover all
possible cases and do not provide tools for customizing behavior.
Consider reading [`MockBuilder`](../api/MockBuilder.md) and [`MockRender`](../api/MockRender.md)
if we want **to create mocks for child dependencies like a pro**
in Angular tests.

For example, if we needed `TranslatePipe` to prefix its strings instead of
translating them, and to create a stub `SearchService` with an empty result which would not cause
an error during execution because of a missed observable in its mock object,
the code would look like:

```ts
beforeEach(() => {
  return MockBuilder(AppBaseComponent, AppBaseModule)
    .mock(TranslatePipe, v => `translated:${v}`)
    .mock(SearchService, {
      result$: EMPTY,
    });
});
```

Profit.

Have a question still? Do not hesitate to [contact us](../need-help.md).
