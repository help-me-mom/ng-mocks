import { Component, Input } from '@angular/core';
import { MockComponent } from './mock_component';
import { TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'parent',
  template: '<child [a]="a"></child>'
})
export class ParentComponent {
  a = 'Unit Testing';
}

@Component({
  selector: 'child',
  template: '{{a}}'
})
export class ChildComponent {
  @Input()
  a: String;
}

describe('ParentComponent', () => {
  let fixture: any,
    element: any;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ParentComponent,
        MockComponent(ChildComponent)
      ]
    });

    fixture = TestBed.createComponent(ParentComponent);
    element = fixture.debugElement;
  }));

  it('should mock the child component', () => {
    fixture.detectChanges();
    expect(element.query(By.css('child'))).not.toBeNull();
    console.log(element);
  });
});
