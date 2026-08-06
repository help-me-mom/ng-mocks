import {
  Component,
  input,
  NgModule,
  reflectComponentType,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

let transformations = 0;
let requiredTransformations = 0;

@Component({
  selector: 'target-11101',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class TargetComponent {
  public readonly plain = input('plain-default');
  public readonly transformed = input('transformed-default', {
    alias: 'publicTransformed',
    transform: (value: string) => {
      transformations += 1;

      return `${value}-transformed`;
    },
  });
  public readonly required = input.required({
    transform: (value: string) => {
      requiredTransformations += 1;

      return `${value}-required`;
    },
  });
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/11101
describe('issue-11101', () => {
  if (
    !reflectComponentType(TargetComponent)?.inputs.some(
      inputMetadata => inputMetadata.propName === 'plain',
    )
  ) {
    it('needs compiled signal input metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('preserves signal input defaults until inputs are updated', () => {
    transformations = 0;
    requiredTransformations = 0;
    const fixture = MockRender(TargetComponent);

    expect(fixture.point.componentInstance.plain()).toEqual(
      'plain-default',
    );
    expect(fixture.point.componentInstance.transformed()).toEqual(
      'transformed-default',
    );
    expect((fixture.componentInstance as any).plain).toEqual(
      'plain-default',
    );
    expect(
      (fixture.componentInstance as any).publicTransformed,
    ).toEqual('transformed-default');
    expect(transformations).toEqual(0);
    expect(fixture.point.componentInstance.required()).toEqual(
      'null-required',
    );
    expect(requiredTransformations).toEqual(1);

    fixture.componentRef.setInput('plain', 'plain-updated');
    fixture.componentRef.setInput(
      'publicTransformed',
      'transformed-updated',
    );
    fixture.componentRef.setInput('required', 'required-updated');
    fixture.detectChanges();

    expect(fixture.point.componentInstance.plain()).toEqual(
      'plain-updated',
    );
    expect(fixture.point.componentInstance.transformed()).toEqual(
      'transformed-updated-transformed',
    );
    expect(transformations).toEqual(1);
    expect(fixture.point.componentInstance.required()).toEqual(
      'required-updated-required',
    );
    expect(requiredTransformations).toEqual(2);
  });
});
