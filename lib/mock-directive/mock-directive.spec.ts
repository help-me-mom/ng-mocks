import { Component, Directive, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormControlDirective } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockDirective } from './mock-directive';

// tslint:disable:max-classes-per-file
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

@Component({
  selector: 'example-component-container',
  template: `
    <div [exampleDirective]="'bye'" [bah]="'hi'" #f="foo" (someOutput)="emitted = $event"></div>
    <div exampleDirective></div>
    <div id="example-structural-directive" *exampleStructuralDirective="true">
      hi
    </div>
    <input [formControl]="fooControl"/>
  `
})
export class ExampleComponentContainer {
  @ViewChild(ExampleDirective) childDirective: ExampleDirective;
  emitted = false;
  foo = new FormControl('');

  performActionOnChild(s: string): void {
    this.childDirective.performAction(s);
  }
}
// tslint:enable:max-classes-per-file

describe('MockDirective', () => {
  let component: ExampleComponentContainer;
  let fixture: ComponentFixture<ExampleComponentContainer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ExampleComponentContainer,
        MockDirective(FormControlDirective),
        MockDirective(ExampleDirective),
        MockDirective(ExampleStructuralDirective)
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleComponentContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have use the original component\'s selector', () => {
    const element = fixture.debugElement.query(By.directive(ExampleDirective));
    expect(element).not.toBeNull();
  });

  it('should have the input set on the mock component', () => {
    const debugElement = fixture.debugElement.query(By.directive(ExampleDirective));
    const element = debugElement.injector.get(ExampleDirective); // tslint:disable-line
    expect(element.something).toEqual('hi');
    expect(element.exampleDirective).toEqual('bye');
  });

  it('triggers output bound behavior for extended outputs', () => {
    const debugElement = fixture.debugElement.query(By.directive(ExampleDirective));
    const element = debugElement.injector.get(ExampleDirective); // tslint:disable-line

    element.someOutput.emit(true);
    expect(component.emitted).toEqual(true);
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
    const debugElement = fixture.debugElement.query(By.directive(ExampleDirective));
    expect(debugElement).not.toBeNull();
  });

  it('should display structural directive content', () => {
    const debugElement = fixture.debugElement.query(By.css('#example-structural-directive'));
    expect(debugElement.nativeElement.innerHTML).toContain('hi');
  });

  it('should set ViewChild directives correctly', () => {
    fixture.detectChanges();
    expect(component.childDirective).toBeTruthy();
  });

  it('should allow spying of viewchild directive methods', () => {
    const spy = spyOn(component.childDirective, 'performAction');
    component.performActionOnChild('test');
    expect(spy).toHaveBeenCalledWith('test');
  });
});
