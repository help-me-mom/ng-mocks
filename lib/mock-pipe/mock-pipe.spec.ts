import { Component, Pipe, PipeTransform } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MockPipe } from './mock-pipe';

@Pipe({ name: 'mockedPipe' })
export class ExamplePipe implements PipeTransform {
  transform = (args: string): string => 'hi';
}

// tslint:disable:max-classes-per-file

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

// tslint:enable:max-classes-per-file

describe('MockPipe', () => {
  let fixture: ComponentFixture<ExampleComponent>;

  describe('Base tests', () => {
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

  describe('Cache check', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
          declarations: [
            ExampleComponent,
            MockPipe(ExamplePipe, () => 'bar'),
            MockPipe(AnotherExamplePipe)
          ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ExampleComponent);
      fixture.detectChanges();
    });

    it('should return the result of the new provided transform function', () => {
      expect(fixture.debugElement.query(By.css('#examplePipe')).nativeElement.innerHTML).toEqual('bar');
    });
  });
});
