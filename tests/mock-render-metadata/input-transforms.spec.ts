import { Component, Directive, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockBuilder,
  MockComponent,
  MockDirective,
  MockRender,
  ngMocks,
} from 'ng-mocks';

const componentInputs = [{ name: 'value', transform: String }];
const directiveInputs = [
  { name: 'value', alias: 'publicValue', transform: Number },
];

@Component({
  selector: 'target-metadata-transform[value]',
  standalone: true,
  inputs: componentInputs,
  template: '{{ value }}',
})
class TargetComponent {
  @Input({ transform: Number }) public value: number | string = 0;
}

@Component({
  selector: 'target-metadata-no-transform[value]',
  standalone: true,
  inputs: componentInputs,
  template: '{{ value }}',
})
class UntransformedComponent {
  @Input() public value: number | string = 0;
}

@Directive({
  selector: '[metadataTransformedValue]',
  standalone: true,
  inputs: directiveInputs,
})
class TargetDirective {
  public value: number | string = 0;
}

// Input transforms are available from Angular 16.1. Property decorators take
// precedence over the same input declared in the component metadata array.
describe('mock-render-metadata:input-transforms', () => {
  it('keeps the effective property transform on a real complex-selector clone', async () => {
    await MockBuilder(TargetComponent);
    const fixture = MockRender(TargetComponent, { value: '4' });
    const target = fixture.point.componentInstance;

    expect(isMockOf(target, TargetComponent)).toBe(false);
    expect(target.value).toBe(4);
    expect(typeof target.value).toBe('number');
    expect(fixture.nativeElement.textContent).toContain('4');

    fixture.componentRef.setInput('value', '8');
    fixture.detectChanges();

    expect(target.value).toBe(8);
    expect(typeof target.value).toBe('number');
    expect(fixture.nativeElement.textContent).toContain('8');
    expect(componentInputs).toEqual([
      { name: 'value', transform: String },
    ]);
  });

  it('keeps the effective property transform when creating a MockComponent', async () => {
    const mock = MockComponent(TargetComponent);
    await TestBed.configureTestingModule({
      imports: [mock],
    }).compileComponents();
    const fixture = MockRender(
      '<target-metadata-transform [value]="value"></target-metadata-transform>',
      { value: '4' },
    );
    const target = ngMocks.findInstance(TargetComponent);

    expect(isMockOf(target, TargetComponent)).toBe(true);
    expect(target.value).toBe(4);
    expect(typeof target.value).toBe('number');

    fixture.componentInstance.value = '8';
    fixture.detectChanges();

    expect(target.value).toBe(8);
    expect(typeof target.value).toBe('number');
    expect(componentInputs).toEqual([
      { name: 'value', transform: String },
    ]);
  });

  it('clears the class-array transform when a real cloned property has no transform', async () => {
    await MockBuilder(UntransformedComponent);
    const fixture = MockRender(UntransformedComponent, { value: 4 });
    const target = fixture.point.componentInstance;

    expect(isMockOf(target, UntransformedComponent)).toBe(false);
    expect(target.value).toBe(4);
    expect(typeof target.value).toBe('number');

    fixture.componentRef.setInput('value', 8);
    fixture.detectChanges();

    expect(target.value).toBe(8);
    expect(typeof target.value).toBe('number');
    expect(fixture.nativeElement.textContent).toContain('8');
    expect(componentInputs).toEqual([
      { name: 'value', transform: String },
    ]);
  });

  it('clears the class-array transform when a mocked property has no transform', async () => {
    const mock = MockComponent(UntransformedComponent);
    await TestBed.configureTestingModule({
      imports: [mock],
    }).compileComponents();
    const fixture = MockRender(
      '<target-metadata-no-transform [value]="value"></target-metadata-no-transform>',
      { value: 4 },
    );
    const target = ngMocks.findInstance(UntransformedComponent);

    expect(isMockOf(target, UntransformedComponent)).toBe(true);
    expect(target.value).toBe(4);
    expect(typeof target.value).toBe('number');

    fixture.componentInstance.value = 8;
    fixture.detectChanges();

    expect(target.value).toBe(8);
    expect(typeof target.value).toBe('number');
    expect(componentInputs).toEqual([
      { name: 'value', transform: String },
    ]);
  });

  it('preserves a class-array-only transform on a real directive clone', async () => {
    await MockBuilder(TargetDirective);
    const fixture = MockRender(TargetDirective, { publicValue: '4' });
    const target = fixture.point.componentInstance;

    expect(isMockOf(target, TargetDirective)).toBe(false);
    expect(target.value).toBe(4);
    expect(typeof target.value).toBe('number');

    fixture.componentRef.setInput('publicValue', '8');
    fixture.detectChanges();

    expect(target.value).toBe(8);
    expect(typeof target.value).toBe('number');
    expect(directiveInputs).toEqual([
      { name: 'value', alias: 'publicValue', transform: Number },
    ]);
  });

  it('preserves a class-array-only transform when creating a MockDirective', async () => {
    const mock = MockDirective(TargetDirective);
    await TestBed.configureTestingModule({
      imports: [mock],
    }).compileComponents();
    const fixture = MockRender(
      '<span metadataTransformedValue [publicValue]="value"></span>',
      { value: '4' },
    );
    const target = ngMocks.findInstance(TargetDirective);

    expect(isMockOf(target, TargetDirective)).toBe(true);
    expect(target.value).toBe(4);
    expect(typeof target.value).toBe('number');

    fixture.componentInstance.value = '8';
    fixture.detectChanges();

    expect(target.value).toBe(8);
    expect(typeof target.value).toBe('number');
    expect(directiveInputs).toEqual([
      { name: 'value', alias: 'publicValue', transform: Number },
    ]);
  });
});
