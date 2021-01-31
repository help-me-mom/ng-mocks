---
title: How to update to the latest version of ng-mocks
description: Critical changes to consider during an updating process to the latest version of ng-mocks
sidebar_label: Updating to the latest
---

Usually, you can use the latest version of `ng-mocks` with any [Angular 5+ application](./index.md).

Below you can find critical changes. They happen on major releases.

If you are facing an issue, despite the instructions, please, feel free to [contact us](./need-help.md).

## From 10 to 11

#### MockModule

Now it does not export all mock imports and mock declarations,
but respects exports of modules.
The story is the same as in the [update from 8 to 9 for `MockBuilder.mock`](#from-mockmodule-to-mockbuildermock).

If you still need to export them,
then you should consider a migration of affected tests to [`MockBuilder`](./api/MockBuilder.md) or [`ngMocks.guts`](./api/ngMocks/guts.md).

#### MockHelper

`MockHelper` has been renamed to [`ngMocks`](./api/ngMocks.md), please check its docs.

#### MockComponent

Previously, it had been accepting a `meta` parameter, now it has been removed.

[Contact us](./need-help.md), if you are using this functionality.

#### Tokens

- `NG_GUARDS` has been renamed to [`NG_MOCKS_GUARDS`](./api/MockBuilder.md#ng_mocks_guards-token)
- `NG_INTERCEPTORS` has been renamed to [`NG_MOCKS_INTERCEPTORS`](./api/MockBuilder.md#ng_mocks_interceptors-token)

## From 9 to 10

There are no special cases.
The update should be straight forward.

## From 8 to 9

#### from MockModule to MockBuilder.mock

[`MockModule`](./api/MockModule.md) exports all imports and declarations,
and [`MockBuilder.mock`](./api/MockBuilder.md#mock) respects exports of modules.

This behavior allows tests to fail, if a declaration of a module has been changed,
and it does not export a dependency anymore. Likewise, an Angular application would fail too.

## From 7 to 8

There are no special cases.
The update should be straight forward.

## From 6 to 7

There are no special cases.
The update should be straight forward.

## From 5 to 6

There are no special cases.
The update should be straight forward.
