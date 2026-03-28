import { Component, Inject, VERSION } from '@angular/core';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
} from 'ng-mocks';

declare const require: any;

const ngForms: any = require('@angular/forms');
const { ReactiveFormsModule } = ngForms;
const nonNullableFormBuilderToken: any =
  ngForms.NonNullableFormBuilder;

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
    @Inject(nonNullableFormBuilderToken)
    private readonly fb: any,
  ) {}
}

describe('issue-7938', () => {
  if (
    !nonNullableFormBuilderToken ||
    Number.parseInt(VERSION.major, 10) < 15
  ) {
    it('needs >=a15.1', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  it('fails with only ReactiveFormsModule kept', async () => {
    await MockBuilder(TargetComponent).keep(ReactiveFormsModule);

    let error: undefined | Error;

    try {
      MockRender(TargetComponent);
    } catch (caughtError) {
      error = caughtError as Error;
    }

    expect(error).toBeDefined();
    expect((error as Error).message).toMatch(
      /(?:group|control) is not a function/,
    );
  });

  it('works when NonNullableFormBuilder is explicitly kept', async () => {
    await MockBuilder(TargetComponent)
      .keep(ReactiveFormsModule)
      .keep(nonNullableFormBuilderToken);

    expect(() => MockRender(TargetComponent)).not.toThrow();
  });

  it('works when all root providers are kept', async () => {
    await MockBuilder(TargetComponent)
      .keep(ReactiveFormsModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS);

    expect(() => MockRender(TargetComponent)).not.toThrow();
  });
});
