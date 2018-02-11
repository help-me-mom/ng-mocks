import { Component, Pipe, PipeTransform } from '@angular/core';
import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { MockPipe } from './mock_pipe';

@Pipe({ name: 'mockedPipe' })
export class ExamplePipe implements PipeTransform {
  transform = (args: string): string => 'hi';
}

@Pipe({ name: 'anotherMockedPipe' })
export class AnotherExamplePipe implements PipeTransform {
  transform = (args: string): string => 'hi';
}

@Component({
  selector: 'example-component',
  template: `
    <span id="examplePipe">{{ someStuff | mockedPipe: 'foo' }}</span>
    <span id="anotherExamplePipe">{{ someStuff | anotherMockedPipe: 'fighters' }}</span>
  `
})
export class ExampleComponent {
  someStuff = 'bah';
}

describe('MockPipe', () => {
  let fixture: ComponentFixture<ExampleComponent>;

  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ExampleComponent,
        MockPipe(ExamplePipe, () => 'foo'),
        MockPipe(AnotherExamplePipe)
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleComponent);
    fixture.detectChanges();
  });

  it('should not display the word hi that is output by the unmocked pipe, because it is now mocked', () => {
    expect(fixture.debugElement.query(By.css('#anotherExamplePipe')).nativeElement.innerHTML).toEqual('');
  });

  describe('with transform override', () => {
    it('should return the result of the provided transform function', () => {
      expect(fixture.debugElement.query(By.css('#examplePipe')).nativeElement.innerHTML).toEqual('foo');
    });
  });
});
