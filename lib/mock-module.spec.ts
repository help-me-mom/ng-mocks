import { Component } from '@angular/core';
import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { MockComponent } from 'mock-component';
import { ExampleComponent, ParentModule } from './test-fixtures';
import { MockModule } from './mock-module';

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

  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );

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
