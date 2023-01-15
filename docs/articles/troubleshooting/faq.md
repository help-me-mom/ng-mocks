---
title: Angular mocking troubleshooting FAQ
description: Frequently Asked Questions about Angular mocks troubleshooting 
sidebar_label: FAQ
---

# Angular mocking troubleshooting FAQ

## TypeError: this.titleStrategy?.updateTitle is not a function

Angular 14 added a root provider for an abstract class `TitleStrategy` which uses `DefaultTitleStrategy`.
Therefore, if you keep `RouterModule` in your tests, you might face
`TypeError: this.titleStrategy?.updateTitle is not a function` because `ng-mocks` mocks `TitleStrategy` and
it doesn't know anything about `DefaultTitleStrategy`.

To fix it error you need to set a default mock for `TitleStrategy`
in `src/test.ts` or `src/setup-jest.ts` / `src/test-setup.ts` in case of jest:

```ts title="src/test.ts"
import { DefaultTitleStrategy, TitleStrategy } from "@angular/router";
import { MockService, ngMocks } from 'ng-mocks';

// A14 fix: making DefaultTitleStrategy to be a default mock for TitleStrategy
ngMocks.defaultMock(TitleStrategy, () => MockService(DefaultTitleStrategy));
```

## Error: NG01052: formGroup expects a FormGroup instance. Please pass one in.

Usually, that happens when you are using `FormBuilder` in your code,
and [`MockBuilder`](../api/MockBuilder.md) in your test,
with intentions to keep `FormsModule` or `ReactiveFormsModule` and to mock the rest.

Since Angular `15.1.0`, `FormBuilder` is a `root` provider,
and, therefore, should be explicitly kept along with `FormsModule` or `ReactiveFormsModule`.

```ts
beforeEach(() =>
  MockBuilder(FormComponent)
    .keep(FormsModule)
    .keep(FormBuilder) // <-- add that
);
```

Or, you can keep all root providers with help of [`NG_MOCKS_ROOT_PROVIDERS`](../api/MockBuilder.md#ngmocksrootproviders-token).

```ts
beforeEach(() =>
  MockBuilder(FormComponent)
    .keep(FormsModule)
    .keep(NG_MOCKS_ROOT_PROVIDERS) // <-- add that
);
```
