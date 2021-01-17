---
title: MockRender - shallow rendering in Angular tests
describe: Information about shallow rendering in Angular tests via MockRender from ng-mocks
sidebar_label: MockRender
---

**Shallow rendering in Angular tests** is provided via `MockRender` function.
`MockRender` helps when we want to assert `Inputs`, `Outputs`, `ChildContent`, or to render custom templates.

`MockRender` relies on Angular `TestBed` and provides:

- shallow rendering of Components, Directives, Services, Tokens
- rendering of custom templates
- support of context providers
- support of all lifecycle hooks (`ngOnInit`, `ngOnChanges` etc)
- support of components without selectors

## Important to know

:::caution
The `fixture` of `MockRender(Component)` is not assignable to
`ComponentFixture<Component>`.

Its type is `MockedComponentFixture<Component>`.
:::

It happens because `MockRender` generates an additional component to
render the desired thing and its interface differs.

It returns `MockedComponentFixture<T>` type. The difference is an additional `point` property.
The best thing about it is that `fixture.point.componentInstance` is typed to the related class,
and **supports not only components, but also directives, services and tokens**.

### Example with a component

```ts
const fixture = MockRender(AppComponent);

// is a middle component, mostly useless
fixture.componentInstance;

// an instance of the AppComponent
fixture.point.componentInstance;
```

### Example with a directive

```ts
const fixture = MockRender(AppDirective);

// is a middle component, mostly useless
fixture.componentInstance;

// an instance of AppDirective
fixture.point.componentInstance;
```

### Example with a service

```ts
const fixture = MockRender(TranslationService);

// is a middle component, mostly useless
fixture.componentInstance;

// an instance of TranslationService
fixture.point.componentInstance;
```

### Example with a token

```ts
const fixture = MockRender(APP_BASE_HREF);

// is a middle component, mostly useless
fixture.componentInstance;

// a value of APP_BASE_HREF
fixture.point.componentInstance;
```

### Example with a custom template

```ts
// custom template
const fixture = MockRender<AppComponent>(
  `<app-component [header]="value | translate">
    custom body
  </app-component>`,
  { value: 'test' },
);

// is a middle component, mostly useless
fixture.componentInstance;

// an instance of AppComponent
fixture.point.componentInstance;
```

### Example with providers

If we want, we can specify providers for the render passing them via the 3rd parameter.
It is useful, when we want to **provide mock system tokens / services** such as `APP_INITIALIZER`, `DOCUMENT` etc.

```ts
const fixture = MockRender(
  ComponentToRender,
  {},
  {
    providers: [
      SomeService,
      {
        provide: DOCUMENT,
        useValue: MockService(Document),
      },
    ],
  },
);
```

## Advanced example

:::tip
Please, do not forget to call `fixture.detectChanges()` and / or `await fixture.whenStable()` to update the render
if we have changed values of parameters.
:::

There is **an advanced example how to render a custom template in an Angular test** below.
Please, pay attention to comments in the code.

- [Try it on StackBlitz](https://stackblitz.com/github/ng-mocks/examples?file=src/examples/MockRender/test.spec.ts&initialpath=%3Fspec%3DMockRender)
- [Try it on CodeSandbox](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockRender/test.spec.ts&initialpath=%3Fspec%3DMockRender)

```ts
describe('MockRender', () => {
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TestedComponent, DependencyModule));

  it('renders template', () => {
    const spy = jasmine.createSpy();
    // in case of jest
    // const spy = jest.fn();

    const fixture = MockRender(
      `
        <tested
          (trigger)="myListener1($event)"
          [value1]="myParam1"
          value2="check"
        >
          <ng-template #header>
            something as ng-template
          </ng-template>
          something as ng-content
        </tested>
      `,
      {
        myListener1: spy,
        myParam1: 'something1',
      },
    );

    // ngMocks.input helps to get the current value of an input on
    // a related debugElement without knowing its owner.
    expect(ngMocks.input(fixture.point, 'value1'))
      .toEqual('something1');
    expect(ngMocks.input(fixture.point, 'value2'))
      .toEqual('check');

    // ngMocks.output does the same with outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo1');
    expect(spy).toHaveBeenCalledWith('foo1');
  });

  it('renders inputs and outputs automatically', () => {
    const spy = jasmine.createSpy();
    // in case of jest
    // const logoClickSpy = jest.fn();

    // Generates a template like:
    // <tested [value1]="value1" [value2]="value2"
    // (trigger)="trigger"></tested>.
    const fixture = MockRender(TestedComponent, {
      trigger: spy,
      value1: 'something2',
    });

    // Checking the inputs.
    expect(ngMocks.input(fixture.point, 'value1'))
      .toEqual('something2');
    expect(ngMocks.input(fixture.point, 'value2'))
      .toBeUndefined();

    // Checking the outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo2');
    expect(spy).toHaveBeenCalledWith('foo2');

    // checking that an updated value has been passed into
    // the testing component.
    fixture.componentInstance.value1 = 'updated';
    fixture.detectChanges();
    expect(ngMocks.input(fixture.point, 'value1'))
      .toEqual('updated');
  });
});
```
