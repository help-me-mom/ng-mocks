import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from '../mock-component';
import { MockModule } from './mock-module';
import { ExampleComponent, ParentModule } from './test-fixtures';

@Component({
  selector: 'component-subject',
  template: `
    <example-component></example-component>
    <span example-directive></span>
    {{ test | examplePipe }}
  `
})
class ComponentSubject {
  test = 'test';
}

describe('MockModule', () => {
  let fixture: ComponentFixture<ComponentSubject>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ComponentSubject
      ],
      imports: [
        MockModule(ParentModule)
      ],
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(ComponentSubject);
      fixture.detectChanges();
    });
  }));

  it('should do stuff', () => {
    const mockedComponent = fixture.debugElement
                                   .query(By.directive(MockComponent(ExampleComponent)))
                                   .componentInstance as ExampleComponent;
    expect(mockedComponent).not.toBeNull();
  });
});
