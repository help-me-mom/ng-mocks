import { Component, Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MockDirective, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[myDirective]',
})
class MyDirective {
  @Input() public value?: string;
}

@Component({
  selector: 'app',
  template: `
    <div class="p1"><span myDirective value="d1"></span></div>
    <div class="p2"><span myDirective value="d2"></span></div>
    <div class="p3"><span myDirective value="d3"></span></div>
  `,
})
class AppComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/298
describe('issue-298:stack-blitz', () => {
  let fixture: ComponentFixture<AppComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockDirective(MyDirective), AppComponent],
    });
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it("should be 'd1'", () => {
    const debugElement = fixture.debugElement.query(By.css('.p1'));
    const directive = ngMocks.findInstance(debugElement, MyDirective);
    expect(directive.value).toBe('d1');
  });

  it("should be 'd2'", () => {
    const debugElement = fixture.debugElement.query(By.css('.p2'));
    const directive = ngMocks.findInstance(debugElement, MyDirective);
    expect(directive.value).toBe('d2');
  });

  it("should be 'd3'", () => {
    const debugElement = fixture.debugElement.query(By.css('.p3'));
    const directive = ngMocks.findInstance(debugElement, MyDirective);
    expect(directive.value).toBe('d3');
  });
});
