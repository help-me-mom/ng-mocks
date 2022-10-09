import { Component, forwardRef, VERSION } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// A standalone CVA component
@Component(
  {
    selector: 'standalone-cva',
    template: `<input
    type="text"
    [value]="value"
    change="onValueChange($event.target.value)"
  />`,
    standalone: true,
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => StandaloneCVAComponent),
        multi: true,
      },
    ],
  } as never /* TODO: remove after upgrade to a14 */,
)
class StandaloneCVAComponent implements ControlValueAccessor {
  public value = '';

  onChange: any = () => undefined;
  onTouched: any = () => undefined;
  writeValue: any = () => undefined;

  registerOnChange(fn: (url: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(): void {}

  onValueChange(value: string): void {
    this.value = value;
    this.onChange(this.value);
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/3778
// The problem is that StandaloneCVAComponent provides itself as NG_VALUE_ACCESSOR,
// whereas NG_VALUE_ACCESSOR is going to be mocked.
// The fix is to keep such NG_VALUE_ACCESSOR if its useExisting points to a kept thing.
describe('issue-3791', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs >=a14', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('issue', () => {
    beforeEach(() =>
      MockBuilder([
        StandaloneCVAComponent,
        FormsModule,
        ReactiveFormsModule,
      ]),
    );

    it('does not fail on standard render', () => {
      const fixture = MockRender(StandaloneCVAComponent);
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('does not fail as ReactiveFormsModule', () => {
      const fixture = MockRender(
        `<standalone-cva [formControl]="control"></standalone-cva>`,
        {
          control: new FormControl('test'),
        },
      );

      expect(fixture.componentInstance).toBeTruthy();
    });

    it('does not fail as FormsModule', () => {
      const fixture = MockRender(
        `<standalone-cva [(ngModel)]="control"></standalone-cva>`,
        {
          value: 'test',
        },
      );

      expect(fixture.componentInstance).toBeTruthy();
    });
  });

  describe('.mock', () => {
    beforeEach(() =>
      MockBuilder([
        StandaloneCVAComponent,
        FormsModule,
        ReactiveFormsModule,
      ]).mock(NG_VALUE_ACCESSOR),
    );

    it('provides undefined as NG_VALUE_ACCESSOR', () => {
      MockRender(StandaloneCVAComponent);
      const token = ngMocks.findInstance(NG_VALUE_ACCESSOR);
      expect(token).toEqual([undefined] as never);
    });
  });

  describe('.mock with a value', () => {
    const mock = {
      onChange: () => undefined,
      onTouched: () => undefined,
      writeValue: () => undefined,
    };

    beforeEach(() =>
      MockBuilder([
        StandaloneCVAComponent,
        FormsModule,
        ReactiveFormsModule,
      ]).mock(NG_VALUE_ACCESSOR, [mock] as never),
    );

    it('provides a mock as NG_VALUE_ACCESSOR', () => {
      MockRender(StandaloneCVAComponent);
      const token = ngMocks.findInstance(NG_VALUE_ACCESSOR);
      expect(token).toEqual([mock] as never);
    });
  });

  describe('.exclude', () => {
    beforeEach(() =>
      MockBuilder([
        StandaloneCVAComponent,
        FormsModule,
        ReactiveFormsModule,
      ]).exclude(NG_VALUE_ACCESSOR),
    );

    it('removes NG_VALUE_ACCESSOR from declarations', () => {
      MockRender(StandaloneCVAComponent);
      const token = ngMocks.findInstance(
        NG_VALUE_ACCESSOR,
        undefined,
      );
      expect(token).toEqual(undefined);
    });
  });
});
