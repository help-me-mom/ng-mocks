// tslint:disable:max-classes-per-file

import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockDirective } from '../mock-directive';
import { MockRender } from '../mock-render';
import { MockHelper } from './mock-helper';

@Directive({
  exportAs: 'foo',
  selector: '[exampleDirective]'
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
  selector: '[exampleStructuralDirective]'
})
export class ExampleStructuralDirective {
  @Input() exampleStructuralDirective = true;
}

describe('MockHelper:getDirective', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockDirective(ExampleDirective),
        MockDirective(ExampleStructuralDirective),
      ]
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
    const elementFromHelper = MockHelper.getDirective(
      fixture.debugElement.query(By.css('div')),
      ExampleDirective,
    );
    expect(elementFromHelper).toBeTruthy();
    if (!elementFromHelper) {
      return;
    }

    // Verification.
    expect(elementFromHelper).toBe(element);
  });

  it('should return right structural directive', () => {
    const fixture = MockRender(`
      <div id="example-structural-directive" *exampleStructuralDirective="false">hi</div>
    `);

    // Using helper.
    const elementFromHelper = MockHelper.getDirective(
      fixture.debugElement.query(By.css('div')),
      ExampleStructuralDirective,
    );
    expect(elementFromHelper).toBeTruthy();
    if (!elementFromHelper) {
      return;
    }

    // Verification.
    expect(elementFromHelper.exampleStructuralDirective).toEqual(false);
  });
});
