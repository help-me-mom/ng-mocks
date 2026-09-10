import {
  Component,
  input,
  NgModule,
  reflectComponentType,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

let transformations = 0;

@Component({
  selector: 'target-14894-transformed',
  standalone: false,
  template: '{{ value() }}',
})
class TargetComponent {
  public readonly value = input('initial', {
    alias: 'publicValue',
    transform: (value: string | number) => {
      transformations += 1;

      return `transformed:${value}`;
    },
  });
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14894
describe('issue-14894:transformed', () => {
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

  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('keeps raw wrapper values and transforms each aliased input update once', () => {
    transformations = 0;
    const fixture = MockRender(TargetComponent);
    const value = fixture.point.componentInstance.value;

    expect(fixture.componentInstance.value).toEqual('initial');
    expect(value()).toEqual('initial');
    expect(fixture.nativeElement.textContent).toContain('initial');
    expect(transformations).toEqual(0);

    fixture.componentInstance.value = 1;
    expect(fixture.componentInstance.value).toEqual(1);
    expect(transformations).toEqual(0);
    fixture.detectChanges();

    expect(fixture.point.componentInstance.value).toBe(value);
    expect(fixture.componentInstance.value).toEqual(1);
    expect(value()).toEqual('transformed:1');
    expect(fixture.nativeElement.textContent).toContain(
      'transformed:1',
    );
    expect(transformations).toEqual(1);

    fixture.componentRef.setInput('publicValue', 'public-update');
    expect<string | number>(fixture.componentInstance.value).toEqual(
      'public-update',
    );
    expect(transformations).toEqual(1);
    fixture.detectChanges();

    expect(fixture.point.componentInstance.value).toBe(value);
    expect<string | number>(fixture.componentInstance.value).toEqual(
      'public-update',
    );
    expect(value()).toEqual('transformed:public-update');
    expect(fixture.nativeElement.textContent).toContain(
      'transformed:public-update',
    );
    expect(transformations).toEqual(2);

    fixture.detectChanges();
    expect(transformations).toEqual(2);
  });
});
