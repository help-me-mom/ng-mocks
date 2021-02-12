---
title: Mock components, services and more out of annoying dependencies in Angular tests
description: An Angular testing library for creating mock services, components, directives,
  pipes and modules in unit tests, which includes shallow rendering
  and supports jasmine and jest.
sidebar_label: Get started
slug: /
---

[![chat on gitter](https://img.shields.io/gitter/room/ike18t/ng-mocks)](https://gitter.im/ng-mocks/community)
[![npm version](https://img.shields.io/npm/v/ng-mocks)](https://www.npmjs.com/package/ng-mocks)
[![build status](https://img.shields.io/travis/ike18t/ng-mocks/master)](https://travis-ci.org/github/ike18t/ng-mocks/branches)
[![coverage status](https://img.shields.io/coveralls/github/ike18t/ng-mocks/master)](https://coveralls.io/github/ike18t/ng-mocks?branch=master)
[![language grade](https://img.shields.io/lgtm/grade/javascript/g/ike18t/ng-mocks)](https://lgtm.com/projects/g/ike18t/ng-mocks/context:javascript)

`ng-mocks` is a testing library which helps with
**mocking [services](api/MockService.md),
[components](api/MockComponent.md)**,
[directives](api/MockDirective.md),
[pipes](api/MockPipe.md) and
[modules](api/MockModule.md)
in tests for Angular applications.
When we have a **noisy child component**,
or any other **annoying dependency**,
`ng-mocks` has tools to turn these declarations into their mocks,
keeping interfaces as they are, but suppressing their implementation.

The current version of `ng-mocks` has been tested and **can be used** with:

- Angular 12 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 11 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 10 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 9 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 8 (Jasmine, Jest, es5, es2015)
- Angular 7 (Jasmine, Jest, es5, es2015)
- Angular 6 (Jasmine, Jest, es5, es2015)
- Angular 5 (Jasmine, Jest, es5, es2015)

In the header menu we can find **preconfigured sandboxes**, where we could **check all the features**.
To focus on a particular one, simply prefix it with `fdescribe` or `fit`.

Also, there is a brief summary with **the latest changes** in [CHANGELOG](https://github.com/ike18t/ng-mocks/blob/master/CHANGELOG.md).
