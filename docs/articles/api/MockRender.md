---
title: MockRender - advanced rendering in Angular tests
describe: Information about rendering in Angular tests via MockRender from ng-mocks
sidebar_label: MockRender
---

**Advanced rendering in Angular tests** is provided via `MockRender` function.
`MockRender` helps when you want to assert `Inputs`, `Outputs`, `ChildContent`, or to render custom templates.

`MockRender` uses Angular `TestBed.createComponent` under the hood and provides:

- correct bindings to `Inputs` and `Outputs`
- rendering of custom templates
- support for all lifecycle hooks (`ngOnInit`, `ngOnChanges` etc)
- support for testing `ChangeDetectionStrategy.OnPush` components
- support for context providers

## Important to know

### Returned type

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

### Proxy between params and fixture

There are `fixture.componentInstance` and `fixture.point.componentInstance` with `MockRender` usage,
and, it's important to know their difference: 

- `fixture.point.componentInstance` is the real component instance
- `fixture.componentInstance` correctly controls `@Inputs` and `@Outputs` of the component

When `MockRender(Component, params)` is used then `fixture.componentInstance` is a proxy to the `params`,
therefore, changing `fixture.componentInstance` is the same as changing `params` and vise-versa.

When `MockRender(Component)` is used without params then `fixture.componentInstance` controls `@Inputs` and `@Outputs`
of the component. That lets it trigger the correct lifecycle hooks. 

An example:

```ts
class Component {
  @Input() public i1: number = 1;
  @Input() public i2: number = 2;
}

const params = {
  i1: 5,
};

const fixture = MockRender(Component, params);

// fixture.componentInstance.i1 = 5;
// The value is taken via a proxy from params,
// because params have i1.

// fixture.componentInstance.i2 = 2;
// The value is take via a proxy from point,
// because params don't have i2, and Componet has.

params.i1 = 6;
// Now fixture.componentInstance.i1 = 6.

fixture.componentInstance.i1 = 7;
// Now params.i1 = 7.

params.i2 = 8;
// It does nothing, because the proxy is based on
// the initial keys of params,
// and i2 isn't present there.

fixture.point.componentInstance.i2 = 3;
// Now fixture.componentInstance.i2 = 3.

fixture.componentInstance.i2 = 4;
// Now fixture.point.componentInstance.i2 = 4.

fixture.point.componentInstance.i3 = 5;
// It does nothing, because the proxy is based on
// the initial properties in the point,
// and i3 isn't present there.
```

Looks too complicated, right?

That's why the best way to write tests with `MockRender` is to rely on

- `fixture.componentInstance` or `params` if you want to change inputs / outputs
- `fixture.point.componentInstance` if you want to assert expectations

:::tip
As a possible solution, `params` might be spread:

```ts
const fixture = MockRender(Component, { ...params });
```
:::

### One MockRender per one test

`MockRender` creates a special wrapper component which should be injected into `TestBed`.
The wrapper is needed in order to render a custom template, which is provided or generated based on parameters.
A declaration of new components in `TestBed` is possible only if `TestBed` has not been used yet.

Because of this,
usage of `MockRender` after usage of `TestBed.get`, `TestBed.inject`, `TestBed.createComponent` or another `MockRender`
triggers an error about dirty `TestBed`.

However, it is still possible to use `MockRender` more than once in a test.
It requires a reset of `TestBed` (check [`ngMocks.flushTestBed`](ngMocks/flushTestBed.md)).
Please note, that this makes all existing service instances obsolete.

```ts
it('two renders', () => {
  MockRender('<div>1</div>'); // ok
  MockRender('<div>2</div>'); // err
});

// The right way to use MockRender.
it('first of two renders', () => {
  MockRender('<div>1</div>'); // ok
});
it('the second of two renders', () => {
  MockRender('<div>2</div>'); // ok
});

// Possible, but not recommended.
it('two renders', () => {
  MockRender('<div>1</div>'); // ok
  ngMocks.flushTestBed();
  MockRender('<div>2</div>'); // ok
  MockRender('<div>3</div>', {}, {reset: true}); // ok
});
```

## Testing ChangeDetectionStrategy.OnPush

Have you ever tried to use `TestBed.createComponent(OnPushComponent)`
with a `ChangeDetectionStrategy.OnPush` component?

Then you know its sad story, there is no rerender on inputs change.

`MockRender` covers this case, and you can check how changes of inputs and outputs
affect rendering of your components and directives.

```ts
const fixture = MockRender(OnPushComponent);

fixture.componentInstance.myInput = 5;
fixture.detectChanges();
expect(ngMocks.formatText(fixture)).toContain(':5:');

fixture.componentInstance.myInput = 6;
fixture.detectChanges();
expect(ngMocks.formatText(fixture)).toContain(':6:');
```

More details how inputs and outputs are handled by `MockRender` are described in the sections below.

## Factory

`MockRender` creates a middleware component. This can add an undesired impact on test performance.
Especially, in cases, when the same setup should be used in different tests.

For example, we have 5 tests and every test calls `MockRender(MyComponent)`.
It means that every time a middleware component has been created and injected into `TestBed`,
whereas `MockRender` could reuse the existing middleware component and simply would create a new fixture out of it.

In such situations, `MockRenderFactory` can be used instead of `MockRender`.
It accepts `bindings` and `providers`, but instead of an instant render,
it returns a factory function. The factory function simply creates a new fixture out of its middleware component.

Considering the conditions above, we would need to create a factory once with help of `MockRenderFactory` in `beforeAll`,
and then 5 tests should call the factory in order to create fixtures.

```ts
describe('Maximum performance', () => {
  const factory = MockRenderFactory(MyComponent, ['input1', 'input2']);
  
  ngMocks.faster();
  beforeAll(() => MockBuilder(MyComponent, MyModule));
  beforeAll(() => factory.configureTestBed());

  it('covers one case', () => {
    const fixture = factory({input1: 1});
    expect(fixture.point.componentInstance.input1).toEqual(1);
  });

  it('covers another case', () => {
    const fixture = factory({input2: 2});
    expect(fixture.point.componentInstance.input2).toEqual(2);
  });
});
```

## Params, Inputs and Outputs

`MockRender` accepts as the second parameter as `params` for the generated template.
The intention of the `params` is to provide flexibility and to allow control of `inputs`, `outputs` and template variables.

If a component or a directive has been passed into `MockRender`,
then `MockRender` generates a template based on its `selector`, `inputs`, `outputs` and provided `params`.

It is essential to know how `MockRender` handles `params` in order to understand which template is being generated.

### No params

If `MockRender` has been called with no `params` or `null` or `undefined` as `params`,
then it automatically binds all `inputs` and ignores all `outputs`.
Therefore, no default values will be used in the tested component, all `inputs` will receive `null`.

:::tip
Why `null`?

Because `Angular` uses `null` when optional chain has failed: `<my-comp [input]="data?.set?.value"></my-comp>`.
Despite its default value, if the chain has failed then `input` is `null`.

Being likewise, `MockRender` provides this behavior by default.
:::

For example, we have a component `MyComponent`
which has two `inputs`: `input1` and `input2`,
and has two `outputs`: `update1` and `update2`.

Then any call like

```ts
MockRender(MyComponent);
MockRender(MyComponent, null);
MockRender(MyComponent, undefined);
```

generates a template like

```html
<my-component [input1]="input1" [input2]="input2"></my-component>
```

where `input1` and `input2` are properties of the wrapper component and equal to `null`.

```ts
expect(fixture.componentInstance.input1).toEqual(null);
expect(fixture.componentInstance.input2).toEqual(null);

expect(fixture.point.componentInstance.input1).toEqual(null);
expect(fixture.point.componentInstance.input1).toEqual(null);
```

If we change props of `fixture.componentInstance`, then, after `fixture.detectChanges()`,
the tested component will receive updated values.

```ts
expect(fixture.componentInstance.input1).toEqual(null);
expect(fixture.point.componentInstance.input1).toEqual(null);

fixture.componentInstance.input1 = 1;
// still old value
expect(fixture.point.componentInstance.input1).toEqual(null);

fixture.detectChanges();
// now it works
expect(fixture.point.componentInstance.input1).toEqual(1);
```

Please proceed to the next section, if you want to use / test default values. 

### Empty params

In order to test default values, we can provide an empty object as `params`.
In this case, `MockRender` handles `inputs` and `outputs` only if they have been set in the provided objects.

For example, we have a component `MyComponent`
which has two `inputs`: `input1` and `input2`,
and has two `outputs`: `update1` and `update2`.

Then a call like

```ts
MockRender(MyComponent, {});
```

generates a template like

```html
<my-component></my-component>
```

If we access the `inputs`, then we will get their default values:
```ts
expect(fixture.point.componentInstance.input1).toEqual('default1');
expect(fixture.point.componentInstance.input1).toEqual('default2');
```

The wrapper component is useless in this case,
and changes should be done on the instance of the tested component (`point`).

### Provided params

`MockRender` tries to generate a template for a wrapper component, based on provided `params`.
Only `params` which have the same name as `inputs` and `outputs` affect the template.

#### Inputs

It is quite simple in case of `inputs`, `MockRender` simply generates `[propName]="propName"`.

For example, we have a component `MyComponent`
which has three `inputs`: `input1`, `input2` and `input3`,

Then a call like

```ts
const params = {input1: 1, input2: 2};
const fixture = MockRender(MyComponent, params);
```

generates a template like

```html
<my-component [input1]="input1" [input2]="input2"></my-component>
```

where `input1` and `input2` belong to the passed object and any change in the object will affect values in the template,
and `input3` is ignored and will have its default value.

```ts
expect(fixture.point.componentInstance.input1).toEqual(1);

params.input1 = 3;
fixture.detectChanges();
expect(fixture.point.componentInstance.input1).toEqual(3);
```

#### Outputs

The story differs a bit with `outputs`. `MockRender` detects types of properties and generates different pieces in templates.

Currently, `MockRender` handles the next types:

- functions
- event emitters
- subjects
- literals

For example, we have a component `MyComponent`
which has four `outputs`: `o1`, `o2`, `o3` and `o4`,

Then a call like

```ts
const params = {
  o1: undefined,
  o2: jasmine.createSpy('o2'),
  o3: new EventEmitter(),
  o4: new Subject(),
};
const fixture = MockRender(MyComponent, params);
```

generates a template like

```html
<my-component
  (o1)="o1=$event"
  (o2)="o2($event)"
  (o3)="o3.emit($event)"
  (o4)="o4.next($event)"
></my-component>
```

Any emit on the `outputs` will trigger the related action:

```ts
expect(params.o1).toEqual(undefined);
expect(params.o2).not.toHaveBeenCalled();

fixture.point.componentInstance.o1.emit(1);
fixture.point.componentInstance.o2.emit(2);

expect(params.o1).toEqual(1);
expect(params.o2).toHaveBeenCalledWith(2);
```

## fixture.detectChanges

By default `MockRender` triggers `fixture.detectChanges`, so you don't need to trigger it yourself.
However, it might be needed to postpone the trigger of `fixture.detectChanges`.

In order to do so, you need to set `detectChanges` to `false` in `MockRender` options:

```ts
const fixture = MockRender(MyComponent, null /* or undefined or params */, {
  detectChanges: false,
});

// ... some magic
fixture.detectChanges();
```
```ts
// or simply
const fixture = MockRender(MyComponent, null /* or undefined or params */, false);
// ... some magic
fixture.detectChanges();
```

## Example with a component

```ts
const fixture = MockRender(AppComponent);

// is a middle component, mostly useless
fixture.componentInstance;

// an instance of the AppComponent
fixture.point.componentInstance;
```

## Example with a directive

```ts
const fixture = MockRender(AppDirective);

// is a middle component, mostly useless
fixture.componentInstance;

// an instance of AppDirective
fixture.point.componentInstance;
```

## Example with a pipe

```ts
const fixture = MockRender(DatePipe, {
  $implicit: new Date(), // the value to transform
});

// is a middle component to manage params
fixture.componentInstance.$implicit.setHours(5);

// an instance of DatePipe
fixture.point.componentInstance;
```

```ts
const fixture = MockRender('{{ 3.99 | currency }}');

// an unknown instance
fixture.point.componentInstance;
```

## Example with a service

```ts
const fixture = MockRender(TranslationService);

// is a middle component, mostly useless
fixture.componentInstance;

// an instance of TranslationService
fixture.point.componentInstance;
```

## Example with a token

```ts
const fixture = MockRender(APP_BASE_HREF);

// is a middle component, mostly useless
fixture.componentInstance;

// a value of APP_BASE_HREF
fixture.point.componentInstance;
```

## Example with a custom template

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

## Example with providers

If we want, we can specify `providers` or `viewProviders` for the render passing them via the 3rd parameter.
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
    providers: [MockProvider(OtherService, {
      serviceFlag: true,
    })],
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

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockRender/test.spec.ts&initialpath=%3Fspec%3DMockRender)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockRender/test.spec.ts&initialpath=%3Fspec%3DMockRender)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockRender/test.spec.ts"
describe('MockRender', () => {
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetComponent, ChildModule));

  it('renders template', () => {
    const spy = jasmine.createSpy();
    // in case of jest
    // const spy = jest.fn();

    const fixture = MockRender(
      `
        <target
          (trigger)="myListener1($event)"
          [value1]="myParam1"
          value2="check"
        >
          <ng-template #header>
            something as ng-template
          </ng-template>
          something as ng-content
        </target>
      `,
      {
        myListener1: spy,
        myParam1: 'something1',
      },
    );

    // ngMocks.input helps to get the current value of an input on
    // a related debugElement without knowing its owner.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual(
      'something1',
    );
    expect(ngMocks.input(fixture.point, 'value2')).toEqual('check');

    // ngMocks.output does the same with outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo1');
    expect(spy).toHaveBeenCalledWith('foo1');
  });

  it('renders inputs and outputs automatically', () => {
    const spy = jasmine.createSpy();
    // in case of jest
    // const logoClickSpy = jest.fn();

    // Generates a template like:
    // <target [value1]="value1" [value2]="value2"
    // (trigger)="trigger"></target>.
    const fixture = MockRender(TargetComponent, {
      trigger: spy,
      value1: 'something2',
    });

    // Checking the inputs.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual(
      'something2',
    );
    expect(ngMocks.input(fixture.point, 'value2')).toEqual(
      'default2',
    );

    // Checking the outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo2');
    expect(spy).toHaveBeenCalledWith('foo2');

    // checking that an updated value has been passed into
    // the testing component.
    fixture.componentInstance.value1 = 'updated';
    fixture.detectChanges();
    expect(ngMocks.input(fixture.point, 'value1')).toEqual('updated');
  });
});
```
