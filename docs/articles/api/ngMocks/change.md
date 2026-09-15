---
title: ngMocks.change
description: Read and change native inputs, Angular form controls, and mocked custom controls with ngMocks.change
---

`ngMocks.change(selector, value)` finds a control and simulates editing it.
Pass a CSS selector directly when you only need to change its value:

```html
<input name="inputName" [(ngModel)]="inputValue" />
```

```ts
// The component declares: public inputValue = 'Ada';
// Keep FormsModule real and await fixture.whenStable() after rendering.

// Read the value.
expect(component.inputValue).toBe('Ada');

// Find the input by name and simulate an edit.
ngMocks.change('[name="inputName"]', 'Grace');
// Render the update and wait for ngModel to settle.
fixture.detectChanges();
await fixture.whenStable();

// Assert the result.
expect(component.inputValue).toBe('Grace');
```

The first argument also accepts selectors supported by [`ngMocks.find`](find.md):

```ts
ngMocks.change('input', 'Grace');
ngMocks.change('[name="inputName"]', 'Grace');
ngMocks.change(['name', 'inputName'], 'Grace');
ngMocks.change(CvaComponent, 'Grace');
```

If you need to inspect the native element, retrieve it with `ngMocks.find`.
For a more complex lookup, such as matching an Angular input binding, use
[`ngMocks.reveal`](reveal.md) once and reuse its returned host:

```ts
// Match a reactive control by the FormControl bound in the template.
const control = ngMocks.reveal(['formControl', component.formControl]);
ngMocks.change(control, 'Grace');

// Match a signal field by its field tree and reuse the host.
const field = ngMocks.reveal(['formField', component.f.inputValue]);
ngMocks.change(field, 'Grace');
```

Pass the `FormControl` or signal `FieldTree` itself to `reveal`. Several radio hosts
can share that binding; use a CSS selector to find the intended radio option.
Tuples passed directly to `change`, such as `['name', 'inputName']`, match HTML
attributes. Matching a `formField` binding requires `reveal`.

## Supported controls and values

The helper supports ordinary native controls, `FormsModule`, `ReactiveFormsModule`,
signal forms, and real or mocked custom form controls. Keep the Angular forms
infrastructure real when testing the connection between a host and its model.

| Control | Read | Change |
| --- | --- | --- |
| Text input or textarea | Native `value`, or the bound model | A string |
| Native checkbox | Native `checked`, or the bound model | `true` to check it; `false` to uncheck it |
| Native radio option | Native `checked`, or the group's model | `true` to select it; `false` to uncheck it |
| Number input | Native `value` (a string), or the numeric model | A number, or `null` / `undefined` to clear |
| Single select with string options | Native `value`, or the bound model | An option's value |
| Native multiple select | Each option's `selected` property | An array of option strings, or `[]` to clear |
| Multiple select with `ngModel` or reactive forms | The bound array, or each option's `selected` property | An array of model values, or `[]` to clear |
| Real or mocked `ControlValueAccessor` | Its bound model | The value expected by the control |
| Real or mocked `FormValueControl` / `FormCheckboxControl` | Its model input, or the bound field | Its value or checked state |

Classic multiple selects use Angular's built-in accessor to match model values to options,
including `[ngValue]` objects and `compareWith`. A native `FormField` multiple select
does not support array values in Angular 21–22; use a custom signal control for that
case. The [signal forms guide](/guides/signal-forms.md#multiple-selections-with-a-custom-control)
links to an executable multiple-select example.

There is no common stored-value property on every custom CVA. Read the bound
component model, `FormControl.value`, or signal field's `value()` to assert the
application value. Native DOM values may have a different representation: numeric
inputs expose strings through `value`, and multiple selects expose only the first
selected option through `value`.

## Mocked signal form bindings

When `FormField` is mocked, the helper can update the real `FieldTree` supplied to its
`formField` input. Find the host with `ngMocks.reveal` once and reuse it:

```ts
// Find the host by its supplied field tree.
const field = ngMocks.reveal(['formField', component.f.inputValue]);

// Read the initial value.
expect(component.f.inputValue().value()).toBe('Ada');

// Change the supplied field.
ngMocks.change(field, 'Grace');

// Assert the model update and dirty state.
expect(component.f.inputValue().value()).toBe('Grace');
expect(component.f.inputValue().dirty()).toBe(true);
```

The binding path calls the field's `controlValue.set`, which marks it dirty and follows
Angular's debounce policy. Pass the field's model value; custom-control payloads retain
object and array identity. Native checkbox arguments become booleans; for native radios,
`true` writes the option's DOM value and `false` leaves the field unchanged.

This path does not dispatch DOM events, synchronize native or child values, or mark
the field touched. Use [`ngMocks.touch`](touch.md) explicitly; it can also flush an edit
pending under `debounce(path, 'blur')`. A mocked CVA with a registered change callback
continues to use that callback. Keep `FormField` real when testing the full Angular connection.
See [mocking form bindings](/guides/mock/form-bindings.md#signal-fields) for the
component, setup, and complete example.

## Radio and checkbox values

For a native radio or checkbox, pass `true` to check the host and `false` to
uncheck it. The option's value stays unchanged.

```ts
// Get the radio option so its checked state can be inspected.
const radio = ngMocks.find('[name="radioName"][value="second"]');

// Select the option.
ngMocks.change('[name="radioName"][value="second"]', true);
// or ngMocks.change(radio, true);

// Assert the result.
expect(radio.nativeElement.checked).toBe(true);
expect(radio.nativeElement.value).toBe('second');

// Uncheck the option.
ngMocks.change('[name="radioName"][value="second"]', false);
// or ngMocks.change(radio, false);

// Assert the result.
expect(radio.nativeElement.checked).toBe(false);
expect(radio.nativeElement.value).toBe('second');
```

Angular writes the checked state to a bound checkbox model. Selecting a radio
writes that option's value to the group model, including when the option's bound
value is itself a boolean.

Passing `false` to a radio changes its `checked` state without emitting a new selection.
Select another option to change the group value, or reset the model explicitly to
clear it. The included blur can still commit a previously pending edit when the
control uses `updateOn: 'blur'`.

Existing calls with nonboolean arguments keep their previous behavior. Use
`true` and `false` to express a native control's checked state.

For custom-element CVAs and `FormValueControl` / `FormCheckboxControl`, pass the
control's model value directly. A custom checkbox control can accept `true` and
`false` as its checked state.

## Blur and touched state

A mocked `FormField` uses the separate binding path described above. For other hosts,
whether a change also triggers blur or marks the field touched depends on the control:

| Selected control | Blur and touched behavior |
| --- | --- |
| Native form element | Includes blur. Touched state follows the real form binding and its update policy. |
| Real CVA with input/change handlers on the host | Includes blur. Its blur handler must report the touch. |
| Real CVA using its registered change callback | Invokes that callback without blur or touch. |
| Mocked CVA | Includes host blur, but does not invoke the CVA touch callback. |
| Real or mocked `FormValueControl` / `FormCheckboxControl` | Emits `valueChange` or `checkedChange` without blur or touch. |

Use [`ngMocks.touch`](touch.md) for a separate touch interaction. Native changes
dispatch `focus`, `input`, `change`, and `blur`; these events do not move actual
browser focus. Another manual blur is unnecessary when this path already dispatched it.
Passing `false` to a native radio omits `input` and `change` so Angular does not
interpret the interaction as selecting that option.

With classic `updateOn: 'blur'`, the included blur commits the value. With
`updateOn: 'submit'`, changes and touches remain pending until the form handles
submission. See [testing form submission](/extra/mock-ng-submit.md).

## Custom CVA callback names

For a real CVA without host input/change handlers, the helper recognizes common
registered callback names such as `onChange`. If a third-party control stores it
under another name, supply that name as the third argument:

```ts
ngMocks.change(CvaComponent, 'Grace', 'customChangeCallback');
```

The callback must be the one registered by Angular through `registerOnChange`.
The helper reports possible method names when it cannot locate a supported callback.

For complete component and test examples, see [native inputs](/guides/native-inputs.md),
[ngModel](/guides/ng-model.md), [reactive forms](/guides/reactive-forms.md), and
[signal forms](/guides/signal-forms.md).
