# Investigating form interactions

Use this checklist when a report concerns `ngMocks.change`, `ngMocks.touch`, value accessors or mocked form
bindings. Read current helpers and the closest form examples before changing behavior; framework internals
and authoring APIs vary by Angular version.

## Establish the actual connection

- Inspect the original declaration's metadata and constructor. A CVA may provide `NG_VALUE_ACCESSOR`, or
  register itself through local `NgControl.valueAccessor`. A UI-token `useExisting` alias is a separate contract.
- Record what the host injector provides, which declaration each token resolves to, and whether an accessor
  is the rendered declaration or a forwarding proxy. Check the proxy's target and callback registration;
  a non-null accessor or a callable `__simulateChange` alone does not prove that edits reach the parent.
- Distinguish native event handlers, CVA callbacks, model input/output pairs and a helper's mocked-binding
  fallback. Identify the path actually used by the failing host. An initialized null property is not necessarily
  an immutable getter, and a silent result is not proof that execution reached the native event fallback.
- Angular signal forms also accept classic `value`/`valueChange` and `checked`/`checkedChange` pairs;
  signal metadata is not required. Match public aliases on the same declaration, prefer `value` when both
  pairs exist, and preserve registered CVA priority. See the [classic-pair regressions](../../../../tests/ng-mocks-change/classic-model-controls.spec.ts).
- Compare plain `TestBed`, explicitly kept dependencies and intentionally mocked dependencies. Keep the
  forms infrastructure decision separate from whether the custom child is real or mocked. Retain required
  root services when testing actual Angular behavior.

## Reproduce the contract with own declarations

Use existing Material or other integration suites to understand the library's behavior. Reproduce the relevant
constructor, prototype CVA methods, providers, aliases and parent bindings with small repository-owned
components/directives in the appropriate issue suite. Do not install the UI library in core or spread targets.

Assert the meaningful parts of the observed connection inline:

- Class and UI-token lookup identify the intended rendered instance; ancestor and sibling hosts are not used.
- Initial and later parent values reach the connected child. A child edit updates the intended parent once.
- A touch with no pending edit preserves the value, and a pristine touch does not create an edit. With a
  pending edit, assert the configured commit policy: blur can apply it. Check dirty state, deferred updates
  and disabled forwarding when the failing mechanism can affect them.
- Check native DOM preconditions before event dispatch and resulting bindings after change detection.
  Dispatch can drain mutation callbacks in zoned runners; do not assume the pre-event DOM survives until
  an explicit `detectChanges()`. See the [native select example](../../../../examples/TestSignalForms/native-multiple-select.spec.ts).
- Default, built-in and custom accessor precedence remains Angular's own policy. Genuine duplicate custom
  candidates must still fail; selecting the first provider is not a category-preserving fix.
- A registered mock proxy retains its connection instead of falling back to another binding. Preserve the
  existing native-event route and explicit callback selection for real controls. Unregistered proxy callbacks
  must not silently consume an interaction; do not call `__simulateChange` merely because it exists.

Gate each fixture at the API's real introduction boundary. Pair internal resolver/proxy branches with source
unit coverage and compiled Angular spread regressions as required by the runbook. Passing nearby cases or
an observed failure with a different setup do not reproduce the reporter's exact diagnostics.

## Keep mock behavior and real forms distinct

A helper can update a real control or field supplied to a mocked binding without recreating Angular's full
connection. Define the supported contract explicitly: value/state writes, deferred update handling, touch,
native DOM synchronization and parent-to-child updates are separate outcomes. Do not infer one from another.
Keep real form directives when the test needs Angular's actual connection or host-provided CVA/directive
validation. A real field supplied to a mocked binding can still apply its own schema validation.

Check the current API and preservation tests before changing accepted payloads. For native checkboxes and
radio options, boolean helper arguments control checked state even when the element has its own option value.
Custom CVA or group hosts can instead exchange their model value; do not generalize native boolean handling to
every host. Review `null`, `undefined`, arrays and option selection only where they belong to the affected path.

Do not expand a value-interaction fix into validator behavior unless the report and authorized scope require
it. Record separate confirmed defects independently. Describe unreproduced reports with their evidence and
missing reproduction context instead of claiming them resolved or adding a guessed fix.

## Starting points

- [Accessor lookup](../../../../libs/ng-mocks/src/lib/mock-helper/cva/func.get-vca.ts),
  [change](../../../../libs/ng-mocks/src/lib/mock-helper/cva/mock-helper.change.ts) and
  [touch](../../../../libs/ng-mocks/src/lib/mock-helper/cva/mock-helper.touch.ts): callback routing and fallbacks.
- [CVA proxy](../../../../libs/ng-mocks/src/lib/common/mock-control-value-accessor-proxy.ts) and
  [provider cloning](../../../../libs/ng-mocks/src/lib/mock/clone-providers.ts): forwarding and accessor categories.
- [MockForms](../../../../examples/MockForms), [MockReactiveForms](../../../../examples/MockReactiveForms) and
  [MockFormBindings](../../../../examples/MockFormBindings): existing names, explanatory comments and real/mocked setup.
- [TestSignalForms](../../../../examples/TestSignalForms): binding selectors, native/CVA/model hosts and callable
  field-tree parameters. Use the API docs and these executable cases as the maintained behavior reference.
