import {
  Component,
  input,
  model,
  NgModule,
  reflectComponentType,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-14894',
  standalone: false,
  template: '{{ value() }}:{{ count() }}',
})
class TargetComponent {
  public readonly value = input('initial', { alias: 'publicValue' });
  public readonly count = model(1, { alias: 'quantity' });
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14894
describe('issue-14894', () => {
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

  it('reads and writes an aliased input binding by its original property name', () => {
    const fixture = MockRender(TargetComponent);
    const value = fixture.point.componentInstance.value;

    expect(fixture.componentInstance.value).toEqual('initial');

    // The original name must control the public binding, not replace the
    // readonly signal reference through the ordinary component mirror.
    fixture.componentInstance.value = 'updated';
    fixture.detectChanges();

    expect(fixture.point.componentInstance.value).toBe(value);
    expect(value()).toEqual('updated');
    expect(fixture.componentInstance.value).toEqual('updated');
    expect(fixture.nativeElement.textContent).toContain('updated:1');

    fixture.componentRef.setInput('publicValue', 'public-update');
    fixture.detectChanges();

    expect(fixture.point.componentInstance.value).toBe(value);
    expect(value()).toEqual('public-update');
    expect(fixture.componentInstance.value).toEqual('public-update');
    expect(fixture.nativeElement.textContent).toContain(
      'public-update:1',
    );
  });

  it('writes an aliased model binding without replacing its signal or emitting an output', () => {
    const fixture = MockRender(TargetComponent);
    const count = fixture.point.componentInstance.count;
    const changes: number[] = [];
    count.subscribe(value => changes.push(value));

    expect(fixture.componentInstance.count).toEqual(1);

    fixture.componentInstance.count = 2;
    fixture.detectChanges();

    expect(fixture.point.componentInstance.count).toBe(count);
    expect(count()).toEqual(2);
    expect(fixture.componentInstance.count).toEqual(2);
    expect(fixture.nativeElement.textContent).toContain('initial:2');
    expect(changes).toEqual([]);

    fixture.componentRef.setInput('quantity', 3);
    fixture.detectChanges();

    expect(fixture.point.componentInstance.count).toBe(count);
    expect(count()).toEqual(3);
    expect(fixture.componentInstance.count).toEqual(3);
    expect(fixture.nativeElement.textContent).toContain('initial:3');
    expect(changes).toEqual([]);
  });

  it('preserves explicit public-alias params and setInput updates', () => {
    const params = { publicValue: 'provided', quantity: 4 };
    const fixture = MockRender(TargetComponent, params);
    const value = fixture.point.componentInstance.value;
    const count = fixture.point.componentInstance.count;

    expect(value()).toEqual('provided');
    expect(count()).toEqual(4);
    expect(fixture.nativeElement.textContent).toContain('provided:4');

    params.publicValue = 'params-update';
    params.quantity = 5;
    fixture.detectChanges();

    expect(fixture.point.componentInstance.value).toBe(value);
    expect(fixture.point.componentInstance.count).toBe(count);
    expect(value()).toEqual('params-update');
    expect(count()).toEqual(5);
    expect(fixture.nativeElement.textContent).toContain(
      'params-update:5',
    );

    fixture.componentRef.setInput('publicValue', 'public-update');
    fixture.componentRef.setInput('quantity', 6);
    fixture.detectChanges();

    expect(fixture.point.componentInstance.value).toBe(value);
    expect(fixture.point.componentInstance.count).toBe(count);
    expect(value()).toEqual('public-update');
    expect(count()).toEqual(6);
    expect(fixture.nativeElement.textContent).toContain(
      'public-update:6',
    );
  });
});
