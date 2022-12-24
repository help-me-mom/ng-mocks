---
title: ngMocks.formatHtml
description: Documentation about ngMocks.formatHtml from ng-mocks library
---

`ngMocks.formatHtml` is intended to normalize HTML in order to provide simpler html expectations in tests.

```ts
const element = document.createElement('div');

// default mode
ngMocks.formatHtml(element); // empty

// outer mode
ngMocks.formatHtml(element, true); // <div></div>
```

`ngMocks.formatHtml` removes:
- all html comments
- sequences of spaces, new lines, tabs will be replaced by a single space symbol
- gaps inside and between siblings is removed, so `<div> </div>` will become `<div></div>`

`ngMocks.formatHtml` accepts:
- a string
- `HTMLElement`, `Text`, `Comment`
- `DebugElement`, `DebugNode`, `ComponentFixture`
- an array of them

## dirty html

a html like

```html
<div>
  <!-- binding1 -->
  <strong>header</strong>
  <!-- binding2 -->
  <ul>
    <li>1</li>
    <li>2</li>
  </ul>
  <!-- binding3 -->
</div>
```

becomes

```html
<div><strong>header</strong><ul><li>1</li><li>2</li></ul></div>
```

## ng-container

A cool thing is that `ngMocks.formatHtml` uses [`ngMocks.crawl`](crawl.md) under the hood
and respects `ng-container`.

so if we have a pointer to `ng-container`, we can assert its content.

```html
<div>
  header
  <ng-container block1>1</ng-container>
  body
  <ng-container block2>2</ng-container>
  footer
</div>
```

```ts
const div = ngMocks.find('div');
const block1 = ngMocks.reveal(div, ['block1']);
const block2 = ngMocks.reveal(div, ['block2']);

ngMocks.formatHtml(div, true);
// returns
// <div> headaer 1 body 2 footer </div>

ngMocks.formatHtml(block1);
// returns
// 1
ngMocks.formatHtml(block2);
// returns
// 2
```
