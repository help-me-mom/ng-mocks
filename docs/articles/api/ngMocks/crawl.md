---
title: ngMocks.crawl
description: Documentation about `ngMocks.crawl` from ng-mocks library
---

`ngMocks.crawl` is a special function which goes through the passed `DebugNode` or `DebugElement`,
respects structure `ng-container` and `ng-template` elements,
and calls a callback function on every item.

`ngMocks.crawl` is used internally by functions which search for desired elements and instances inside of fixtures.
It is better to use one of them, than this one.
`ngMocks.crawl` is in shared API in order to give a tool to create some exotic selectors, which are not covered by `ng-mocks`.  

The function accepts  a `DebugNode` or a `DebugElement` as the first parameter,
and a callback as the second parameter.
If the callback returns `true`
then `ngMocks.crawl` stops.
The callback will receive 2 parameters, the first one is the current `node` and
the second one is its `parent` if it is present.

There is a special 3rd parameter, in case if you need to include `#text` nodes.
They are skipped by default, because different versions of angular produce
a different amount of text nodes for the same template.

```ts
ngMocks.crawl(debugElement, callback, textNodes);
```

or simply with selectors which are supported by [`ngMocks.find`](find.md).

```ts
ngMocks.crawl('div.root', callback, textNodes);
```

## Example: first div

A simple example, how we can find a div element.
Let's assume that the `fixture` points to the root element.

```html
<section>
  <div>hello</div>
</section>
```

Then in the callback, we can check `nodeName`.

```ts
// looks for the first div
ngMocks.crawl(
  fixture.debugElement,
  node => {
    if (node.nativeNode.nodeName === 'DIV') {
      // do something and stop the walk
      return true;
    }
  },
);
```

## Example: direct children of ng-container

Let's assume we want to get all child elements of the first `ng-container`,
and the `fixture` points to the root element.

```html
<ng-container>
  <div>1</div>
  <div>2</div>
</ng-container>
<ng-container>
  <div>3</div>
  <div>4</div>
</ng-container>
```

Then in the callback we can find `ng-container` and then its children.

```ts
// let's find the first ng-container
let ngContainer: any;
ngMocks.crawl(
  fixture.debugElement,
  (node, parent) => {
    // ng-container is the first element
    // in our fixture
    if (parent === fixture.debugElement) {
        ngContainer = node;
        
        return true;
    }
  },
);

// let's find its divs
const divs = [];
ngMocks.crawl(
  ngContainer,
  (node, parent) => {
    // the same story
    if (parent === ngContainer) {
      divs.push(node);
      // no return because we need all divs
    }
  },
);
```
