import { Component, Directive, Input, Type } from '@angular/core';
import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { MockDirective } from './mock_directive';

@Directive({
  selector: '[exampleDirective]'
})
export class ExampleDirective {
  @Input() exampleDirective: string;
  @Input() something: string;
}

@Component({
  selector: 'example-component-container',
  template: `
    <div [exampleDirective]="'bye'" [something]="'hi'"></div>
  `
})
export class ExampleComponentContainer {}

describe('MockComponent', () => {
  let fixture: ComponentFixture<ExampleComponentContainer>;
  let directive: Type<ExampleDirective>;

  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ExampleComponentContainer,
        directive = MockDirective(ExampleDirective)
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleComponentContainer);
    fixture.detectChanges();
  });

  it('should have use the original component\'s selector', () => {
    const element = fixture.debugElement.query(By.directive(directive));
    expect(element).not.toBeNull();
  });

  it('should have the input set on the mock component', () => {
    const debugElement = fixture.debugElement.query(By.directive(directive));
    const element = debugElement.injector.get(directive);
    expect(element.something).toEqual('hi');
    expect(element.exampleDirective).toEqual('bye');
  });
});
