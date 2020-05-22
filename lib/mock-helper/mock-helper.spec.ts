import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MockDirective, MockedDirective } from '../mock-directive';
import { MockRender } from '../mock-render';

import { MockHelper } from './mock-helper';

@Directive({
  exportAs: 'foo',
  selector: '[exampleDirective]',
})
export class ExampleDirective {
  @Input() exampleDirective: string;
  @Output() someOutput = new EventEmitter<boolean>();
  @Input('bah') something: string;

  performAction(s: string) {
    return this;
  }
}

@Directive({
  selector: '[exampleStructuralDirective]',
})
export class ExampleStructuralDirective {
  @Input() exampleStructuralDirective = true;
}

@Component({
  selector: 'component-a',
  template: 'body-a',
})
export class AComponent {}

@Component({
  selector: 'component-b',
  template: 'body-b',
})
export class BComponent {}

describe('MockHelper:getDirective', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockDirective(ExampleDirective),
        MockDirective(ExampleStructuralDirective),
        AComponent,
        BComponent,
      ],
    });
  }));

  it('should return right attribute directive', () => {
    const fixture = MockRender(`
      <div exampleDirective></div>
    `);

    // Looking for original.
    const debugElement = fixture.debugElement.query(By.directive(ExampleDirective));
    const element = debugElement.injector.get(ExampleDirective);

    // Using helper.
    const elementFromHelper = MockHelper.getDirective(fixture.debugElement.query(By.css('div')), ExampleDirective);
    expect(elementFromHelper).toBeTruthy();
    if (!elementFromHelper) {
      return;
    }

    // Verification.
    expect(elementFromHelper).toBe(element);
  });

  it('should return right structural directive via getDirective', () => {
    const fixture = MockRender(`
      <div id="example-structural-directive" *exampleStructuralDirective="false">hi</div>
    `);

    // we need to render mocked structural directives manually
    MockHelper.findDirectives(fixture.debugElement, ExampleStructuralDirective).forEach(
      (item: MockedDirective<ExampleStructuralDirective>) => {
        item.__render();
      }
    );
    fixture.detectChanges();

    // Using helper.
    const elementFromHelper = MockHelper.getDirective(
      fixture.debugElement.query(By.css('div')),
      ExampleStructuralDirective
    );
    expect(elementFromHelper).toBeTruthy();
    if (!elementFromHelper) {
      return;
    }

    // Verification.
    expect(elementFromHelper.exampleStructuralDirective).toEqual(false);
  });

  it('should return right structural directive via getDirectiveOrFail', () => {
    const fixture = MockRender(`
      <div id="example-structural-directive" *exampleStructuralDirective="false">hi</div>
    `);

    // we need to render mocked structural directives manually
    MockHelper.findDirectives(fixture.debugElement, ExampleStructuralDirective).forEach(
      (item: MockedDirective<ExampleStructuralDirective>) => {
        item.__render();
      }
    );
    fixture.detectChanges();

    // Using helper.
    const elementFromHelper = MockHelper.getDirectiveOrFail(
      fixture.debugElement.query(By.css('div')),
      ExampleStructuralDirective
    );

    // Verification.
    expect(elementFromHelper.exampleStructuralDirective).toEqual(false);
  });

  it('find selector: T', () => {
    const fixture = MockRender(`<component-a></component-a>`);
    const componentA = MockHelper.findOrFail(fixture.debugElement, AComponent);
    expect(componentA.componentInstance).toEqual(jasmine.any(AComponent));

    expect(() => MockHelper.findOrFail(componentA, BComponent)).toThrowError(
      'Cannot find an element via MockHelper.findOrFail'
    );
  });

  it('find selector: string', () => {
    const fixture = MockRender(`<component-b></component-b>`);
    const componentB = MockHelper.findOrFail(fixture.debugElement, 'component-b');
    expect(componentB.componentInstance).toEqual(jasmine.any(BComponent));

    expect(() => MockHelper.findOrFail(componentB, AComponent)).toThrowError(
      'Cannot find an element via MockHelper.findOrFail'
    );
  });

  it('find selector: T', () => {
    const fixture = MockRender(`<component-a></component-a>`);
    const componentA = MockHelper.find(fixture.debugElement, AComponent);
    expect(componentA && componentA.componentInstance).toEqual(jasmine.any(AComponent));

    const componentB = MockHelper.find(fixture.debugElement, BComponent);
    expect(componentB).toBe(null); // tslint:disable-line:no-null-keyword
  });

  it('find selector: string', () => {
    const fixture = MockRender(`<component-b></component-b>`);
    const componentB = MockHelper.find(fixture.debugElement, 'component-b');
    expect(componentB && componentB.componentInstance).toEqual(jasmine.any(BComponent));

    const componentA = MockHelper.find(fixture.debugElement, 'component-a');
    expect(componentA).toBe(null); // tslint:disable-line:no-null-keyword
  });

  it('findAll selector: T', () => {
    const fixture = MockRender(`<component-a></component-a><component-a></component-a>`);
    const componentA = MockHelper.findAll(fixture.debugElement, AComponent);
    expect(componentA.length).toBe(2); // tslint:disable-line:no-magic-numbers
    expect(componentA[0].componentInstance).toEqual(jasmine.any(AComponent));
    expect(componentA[1].componentInstance).toEqual(jasmine.any(AComponent));

    const componentB = MockHelper.findAll(fixture.debugElement, BComponent);
    expect(componentB.length).toBe(0);
  });

  it('findAll selector: string', () => {
    const fixture = MockRender(`<component-b></component-b><component-b></component-b>`);
    const componentB = MockHelper.findAll(fixture.debugElement, 'component-b');
    expect(componentB.length).toEqual(2); // tslint:disable-line:no-magic-numbers
    expect(componentB[0].componentInstance).toEqual(jasmine.any(BComponent));
    expect(componentB[0].componentInstance).toEqual(jasmine.any(BComponent));

    const componentA = MockHelper.findAll(fixture.debugElement, 'component-a');
    expect(componentA.length).toBe(0);
  });
});
