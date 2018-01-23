import { Component, Pipe, PipeTransform } from '@angular/core';
import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { MockPipe } from './mock_pipe';

@Pipe({ name: 'mockedPipe' })
export class ExamplePipe implements PipeTransform {
  transform = (args: string): string => 'hi';
}

/* tslint:disable:max-classes-per-file */
@Component({
  selector: 'example-component',
  template: `{{ someStuff | mockedPipe: 'foo' }}`
})
export class ExampleComponent {
  someStuff = 'bah';
}
/* tslint:enable:max-classes-per-file */

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
        MockPipe(ExamplePipe)
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleComponent);
    fixture.detectChanges();
  });

  it('should regurgitate the passed in arg', () => {
    expect(fixture.nativeElement.innerHTML).toEqual('bah,foo');
  });
});
