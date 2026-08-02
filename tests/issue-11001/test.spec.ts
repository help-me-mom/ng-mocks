import {
  Component,
  input,
  NgModule,
  reflectComponentType,
} from '@angular/core';

import {
  MockBuilder,
  MockRender,
  MockedComponentFixture,
} from 'ng-mocks';

let transformations = 0;

@Component({
  selector: 'target-11001',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class TargetComponent {
  public readonly items = input<string[]>([]);
  public readonly quantity = input(0, {
    alias: 'publicQuantity',
    transform: (value: number | string) => {
      transformations += 1;

      return Number(value) + 1;
    },
  });
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/11001
describe('issue-11001', () => {
  if (
    !reflectComponentType(TargetComponent)?.inputs.some(
      inputMetadata => inputMetadata.propName === 'items',
    )
  ) {
    it('needs compiled signal input metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  // Signal inputs are reflected as structured metadata. MockRender used to
  // omit their bindings and expose no wrapper inputs, so setInput threw NG0303.
  // The wrapper now declares ordinary inputs, and change detection forwards
  // their values to the real signal inputs without copying signal metadata.
  it('sets signal inputs through the MockRender wrapper', () => {
    const fixture: MockedComponentFixture<TargetComponent> =
      MockRender(TargetComponent);
    const wrapper = reflectComponentType(
      fixture.componentRef.componentType,
    );

    expect(
      wrapper?.inputs
        .map(
          inputMetadata =>
            `${inputMetadata.propName}:${inputMetadata.templateName}`,
        )
        .sort(),
    ).toEqual(['items:items', 'publicQuantity:publicQuantity']);

    transformations = 0;
    fixture.componentRef.setInput('items', ['updated']);
    fixture.componentRef.setInput('publicQuantity', '4');

    expect(fixture.componentInstance.items).toEqual(['updated']);
    expect((fixture.componentInstance as any).publicQuantity).toEqual(
      '4',
    );

    fixture.detectChanges();

    expect(fixture.point.componentInstance.items()).toEqual([
      'updated',
    ]);
    expect(fixture.point.componentInstance.quantity()).toEqual(5);
    expect(transformations).toEqual(1);
  });

  it('exposes only inputs bound by provided params', () => {
    const params = {
      items: ['initial'],
    };
    const fixture = MockRender(TargetComponent, params);
    const wrapper = reflectComponentType(
      fixture.componentRef.componentType,
    );

    expect(
      wrapper?.inputs.map(
        inputMetadata => inputMetadata.templateName,
      ),
    ).toEqual(['items']);

    fixture.componentRef.setInput('items', ['updated']);
    expect(params.items).toEqual(['updated']);

    fixture.detectChanges();
    expect(fixture.point.componentInstance.items()).toEqual([
      'updated',
    ]);
  });
});
