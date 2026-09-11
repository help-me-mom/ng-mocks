import {
  ChangeDetectionStrategy,
  Component,
  input,
  isSignal,
  reflectComponentType,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockComponent, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-14897-component',
  standalone: false,
  template: '',
})
class TargetComponent {
  public static constructed = 0;
  public static transformed = 0;

  public readonly value = input(0, {
    alias: 'publicValue',
    transform: (value: string | number) => {
      TargetComponent.transformed += 1;

      return Number(value) * 2;
    },
  });

  public constructor() {
    TargetComponent.constructed += 1;
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'host-14897-component',
  standalone: false,
  template: `
    <target-14897-component
      [publicValue]="value"
    ></target-14897-component>
  `,
})
class HostComponent {
  public value: string | number = '2';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14897
describe('issue-14897:component', () => {
  // The root TypeScript-only runner does not transform signal declarations.
  if (
    !reflectComponentType(TargetComponent)?.inputs.some(
      inputMetadata => inputMetadata.propName === 'value',
    )
  ) {
    it('needs compiled signal input metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => {
    TargetComponent.constructed = 0;
    TargetComponent.transformed = 0;

    return TestBed.configureTestingModule({
      declarations: [HostComponent, MockComponent(TargetComponent)],
    }).compileComponents();
  });

  it('updates an aliased signal input without executing its original transform', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = ngMocks.find(fixture, TargetComponent);
    const component = element.componentInstance;
    const value = component.value;

    expect(isMockOf(component, TargetComponent)).toBe(true);
    expect(isSignal(value)).toBe(true);
    // Angular does not expose the signal transform in compiled input metadata.
    // MockComponent skips original field initializers, so the signal receives
    // raw bound values without executing the original transform.
    expect(value() as unknown).toEqual('2');
    expect(ngMocks.input(element, 'publicValue')).toEqual('2');
    expect(TargetComponent.constructed).toEqual(0);
    expect(TargetComponent.transformed).toEqual(0);

    fixture.componentInstance.value = 3;
    // Direct TestBed fixtures need notification after plain property updates in zoneless mode.
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(component.value).toBe(value);
    expect(value()).toEqual(3);
    expect(ngMocks.input(element, 'publicValue')).toEqual(3);
    expect(TargetComponent.constructed).toEqual(0);
    expect(TargetComponent.transformed).toEqual(0);

    fixture.componentInstance.value = '4';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(component.value).toBe(value);
    expect(value() as unknown).toEqual('4');
    expect(ngMocks.input(element, 'publicValue')).toEqual('4');
    expect(TargetComponent.constructed).toEqual(0);
    expect(TargetComponent.transformed).toEqual(0);
  });
});
