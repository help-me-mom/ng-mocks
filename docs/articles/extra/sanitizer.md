---
title: Mocking DomSanitizer
description: Information how to test usage of DomSanitizer in Angular 
sidebar_label: Mocking DomSanitizer 
---

This article explains how to mock `DomSanitizer` in Angular tests properly.

The biggest issue is that `DomSanitizer` are used internally by Angular.
Therefore, mocking them can cause unpredictable errors such as:

- TypeError: view.root.sanitizer.sanitize is not a function
- TypeError: _co.domSanitizer.bypassSecurityTrustHtml is not a function

Because of that `ng-mocks` avoids its mocking by default.

Another problem is that the class is abstract and there is no way to detect their abstract methods in javascript runtime
in order to provide mock functions or spies instead.

However, `ng-mocks` contains [`MockRender`](/api/MockRender.md) which supports additional providers for rendered things.
Therefore, if we use [`MockRender`](/api/MockRender.md) and [`MockProvider`](/api/MockProvider.md), we can achieve desired environment and behavior:

```ts
// rendering TargetComponent component
MockRender(TargetComponent, null, {
  // providing special overrides for TargetComponent
  providers: [
    // Mocking DomSanitizer with a fake method
    MockProvider(DomSanitizer, {
      // the override should be provided explicitly
      // because sanitize method is abstract
      sanitize: jasmine.createSpy('sanitize'),
    }),
  ],
});
```

Profit.

## Always mock / spy DomSanitizer

If you want to spy `DomSanitizer` globally,
you can use [`ngMocks.globalMock`](/api/ngMocks/globalMock.md) and [`ngMocks.defaultMock`](/api/ngMocks/defaultMock.md).

In this case, `ng-mocks` understands that `DomSanitizer` should be mocked by default.

The only concern is that Angular uses `DomSanitizer` internally.
Therefore, its mock methods should the passed value at least. 

```ts
// Let ng-mocks know that it should be mocked
ngMocks.globalMock(DomSanitizer);

// Let ng-mocks know how the mock should be defined
ngMocks.defaultMock(DomSanitizer, sanitizer => {
	// Jasmine example
  sanitizer.sanitize = jasmine.createSpy().and.callFake(v => v);
  // all other methods

	// Jest example
  sanitizer.bypassSecurityTrustHtml = jest.fn(v => v);
  // all other methods

	return sanitizer;
});
```

## Full example

A full example of **mocking DomSanitizer** in Angular tests.

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockSanitizer/test.spec.ts&initialpath=%3Fspec%3DMockSanitizer)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockSanitizer/test.spec.ts&initialpath=%3Fspec%3DMockSanitizer)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockSanitizer/test.spec.ts"
describe('MockSanitizer', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('renders expected mock values', () => {
    MockRender(TargetComponent, null, {
      providers: [
        MockProvider(DomSanitizer, {
          sanitize: (context: SecurityContext, value: string) =>
            `sanitized:${context}:${value.length}`,
        }),
      ],
    });

    expect(ngMocks.formatHtml(ngMocks.find('div'))).toEqual(
      'sanitized:1:23',
    );
  });
});
```
