import { Component, Directive, Input, Type } from '@angular/core';
import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { MockDirective } from './mock_directive';

@Directive({
  exportAs: 'foo',
  selector: '[exampleDirective]'
})
export class ExampleDirective {
  @Input() exampleDirective: string;
  @Input('bah') something: string;
}

@Component({
  selector: 'example-component-container',
  template: `
    <div [exampleDirective]="'bye'" [bah]="'hi'" #f="foo"></div>
    <div exampleDirective></div>
  `
})
export class ExampleComponentContainer {}

describe('MockComponent', () => {
  let fixture: ComponentFixture<ExampleComponentContainer>;

  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ExampleComponentContainer,
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

  it('should memoize the return value by argument', () => {
    expect(MockDirective(ExampleDirective)).toEqual(MockDirective(ExampleDirective));
    expect(MockDirective(ExampleDirective)).not.toEqual(ExampleDirective);
  });
});
