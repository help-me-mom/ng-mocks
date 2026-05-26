import { Component, Inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-7938',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    ReactiveFormsModule,
  ],
  template: '',
})
class TargetComponent {
  public form = this.fb.group({
    age: this.fb.control(21),
    name: this.fb.control(''),
  });

  public constructor(
    @Inject(NonNullableFormBuilder)
    private readonly fb: NonNullableFormBuilder,
  ) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/7938
// `NonNullableFormBuilder` is a root provider whose factory returns
// `inject(FormBuilder).nonNullable`; it is not provided by ReactiveFormsModule
// itself. The bug happened because `.keep(NonNullableFormBuilder)` stored the
// class token directly, so the provider resolver could replace Angular's real
// factory provider with a class/provider shape that did not expose `control`.
// The fix preserves reflected factory metadata for explicitly kept root
// providers, including Angular 22's `Service({ factory })` metadata form.
describe('issue-7938', () => {
  it('works when NonNullableFormBuilder is explicitly kept', async () => {
    await MockBuilder(TargetComponent)
      .keep(ReactiveFormsModule)
      .keep(NonNullableFormBuilder);

    expect(() => MockRender(TargetComponent)).not.toThrow();
  });
});
