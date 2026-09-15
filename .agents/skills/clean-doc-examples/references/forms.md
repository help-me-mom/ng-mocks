# Writing form interaction guides

Use this reference with the parent skill when writing or updating form guides. Follow the structure in
[`native-inputs.md`](../../../../docs/articles/guides/native-inputs.md) and
[`ng-model.md`](../../../../docs/articles/guides/ng-model.md), and compare their executable examples.

## Teaching order

1. Show the component or directive under test and its template first. Make the relationship between the
   element, binding and component property visible before showing test code.
2. Explain `MockBuilder` in a separate test-setup section using `beforeEach`. Keep the subsequent example's
   rendering and interactions inside `it`; omit repeated imports from these focused snippets.
3. Show render → find → read → change → assert in one code block, with blank lines and simple comments between
   actions. Explain required settling or change detection where it matters. Put any update-on-blur/submit
   caveat near the beginning of this section, qualified for the actual binding rather than copied to every host.
4. Follow with short recipes for relevant control types, then a complete example and its source and live links.
   Cover every published recipe in `examples/`, including clearing values and control-specific behavior.
   Additional regression cases need not all appear in the article.

Keep guides about ordinary values focused on those interactions. Put custom-control mocking, validation and
other independent subjects in their respective articles. Keep related guides beside one another in the existing
How to test or How to mock sidebar group according to what the test demonstrates.

## Finding and changing controls

For simple native selectors, demonstrate the direct call and the already-found element alternative:

```ts
// Find the input to read its current value.
const input = ngMocks.find('[name="inputName"]');

// Change the value.
ngMocks.change('[name="inputName"]', 'Grace');
// or ngMocks.change(input, 'Grace');
```

When selection needs a binding reference, find the host once with
`ngMocks.reveal(['formField', component.f.inputValue])` and reuse that variable. Pass the bound field tree
without calling it. A shared binding, such as a radio group, needs an option-specific selector or narrower scope.
Do not add test IDs when existing names or binding references identify the intended host. An HTML `name`
selector and an Angular template reference such as `#input` serve different purposes; the latter can be needed
by the component's event handler even when the test selects by name.

## Keeping examples consistent

Preserve names in existing specs; a similar new variant can reuse their names and structure. Use `inputValue`
and `inputName` for new independent state and HTML-name examples. Review repeated control tables and prose
together so supported arguments, clearing values and timing agree with the executable specs and API docs.
When shortening an article, relocate still-relevant
guidance rather than silently dropping an original request.
