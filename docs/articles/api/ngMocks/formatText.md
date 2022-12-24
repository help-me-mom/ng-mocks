---
title: ngMocks.formatText
description: Documentation about ngMocks.formatText from ng-mocks library
---

`ngMocks.formatText` is intended to normalize `textContent` in order to provide simpler text expectations in tests.

`ngMocks.formatText` removes:
- all html comments
- all html tags
- sequences of spaces, new lines, tabs will be replaced by a single space symbol

`ngMocks.formatText` accepts:
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
header 12
```

## ng-container

A cool thing is that `ngMocks.formatText` uses [`ngMocks.crawl`](crawl.md) under the hood
and respects `ng-container`.

so if we have a pointer to `ng-container`, we can assert its content.

```html
<div>
  &lt;
  <ng-container block1>1</ng-container>
  &amp;
  <ng-container block2>2</ng-container>
  &gt;
</div>
```

```ts
const div = ngMocks.find('div');
const block1 = ngMocks.reveal(div, ['block1']);
const block2 = ngMocks.reveal(div, ['block2']);

ngMocks.format(div);
// returns
// < 1 & 2 >

ngMocks.formatHtml(block1);
// returns
// 1
ngMocks.formatHtml(block2);
// returns
// 2
```
