import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormControlDirective } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockDirective } from './mock-directive';

@Directive({
  exportAs: 'foo',
  selector: '[exampleDirective]'
})
export class ExampleDirective {
  @Input() exampleDirective: string;
  @Output() someOutput = new EventEmitter<boolean>();
  @Input('bah') something: string;
}

@Component({
  selector: 'example-component-container',
  template: `
    <div [exampleDirective]="'bye'" [bah]="'hi'" #f="foo" (someOutput)="emitted = $event"></div>
    <div exampleDirective></div>
    <input [formControl]="fooControl"/>
  `
})
export class ExampleComponentContainer {
  emitted = false;
  foo = new FormControl('');
} // tslint:disable-line:max-classes-per-file

describe('MockDirective', () => {
  let fixture: ComponentFixture<ExampleComponentContainer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ExampleComponentContainer,
        MockDirective(FormControlDirective),
        MockDirective(ExampleDirective)
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleComponentContainer);
    fixture.detectChanges();
  });

  it('should have use the original component\'s selector', () => {
    const element = fixture.debugElement.query(By.directive(MockDirective(ExampleDirective)));
    expect(element).not.toBeNull();
  });

  it('should have the input set on the mock component', () => {
    const debugElement = fixture.debugElement.query(By.directive(MockDirective(ExampleDirective)));
    const element = debugElement.injector.get(MockDirective(ExampleDirective));
    expect(element.something).toEqual('hi');
    expect(element.exampleDirective).toEqual('bye');
  });

  it('triggers output bound behavior for extended outputs', () => {
    const debugElement = fixture.debugElement.query(By.directive(MockDirective(ExampleDirective)));
    const element = debugElement.injector.get(MockDirective(ExampleDirective));

    element.someOutput.emit(true);
    expect(fixture.componentInstance.emitted).toEqual(true);
  });

  it('should memoize the return value by argument', () => {
    expect(MockDirective(ExampleDirective)).toEqual(MockDirective(ExampleDirective));
    expect(MockDirective(ExampleDirective)).not.toEqual(ExampleDirective);
  });

  it('can mock formControlDirective from angular', () => {
    // Some angular directives set up their metadata in a different way than @Directive does
    // I found that FormControlDirective is one of those weird directives.
    // Since I don't know how they did it, I don't know how to test it except to write this
    // Test around a known-odd directive.
    const debugElement = fixture.debugElement.query(By.directive(MockDirective(ExampleDirective)));
    expect(debugElement).not.toBeNull();
  });
});
