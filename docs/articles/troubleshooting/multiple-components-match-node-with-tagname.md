---
title: 'How to fix Error NG0300: Multiple components match node with tagname'
description: 'A solution for Angular tests when they fail with "Error NG0300: Multiple components match node with tagname"'
sidebar_label: 'Multiple components'
---

If you are facing `Error NG0300: Multiple components match node with tagname` in your tests,
it means that somehow the same component is imported or declared via different modules.
Usually, it's a sign that something has been mocked incorrectly.

Let's imagine we have the next module:

```ts
@NgModule({
  imports: [Module1, Module2, Module3],
  declarations: [Component1, Component2, Component3],
  exports: [Component1, Component2, Component3],
})
exports class MainModule {}
```

The module declares 3 components and imports 3 modules.
The components use each other and the imported modules heavily.
However, in out test we would like to mock `Component2` only.

Therefore, `TestBed` might look like that:

```ts
TestBed.configureTestingModule({
  imports: [
    MainModule,
  ],
  declarations: [
    MockComponent2, // our own mock with the same selector
  ],
});
```

Although it looks right and the intention is to utilize `MockComponent2` instead of `Component2` as an override,
tests won't pass because `MockComponent2` and `Component2` match node with tagname `component-2`.

The solution here is to substitute `Component2` with `MockComponent2` in `MainModule`,
so `TestBed` wouldn't encounter `Component2` at all.

To do so, you should use [`MockBuilder.replace`](/api/MockBuilder.md#replace):

```ts
beforeEach(() => {
  return MockBuilder(MainModule)
    .replace(Component2, MockComponent2);
});
```

The definition above declares `MainModule` in `TestBed` in the way that `MockComponent2` is presented everywhere,
where `Component2` was before.

Now the test won't throw `Error NG0300: Multiple components match node with tagname`.
