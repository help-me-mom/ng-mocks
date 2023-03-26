import {
  Component,
  Directive,
  forwardRef,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  NG_VALIDATORS,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TargetDirective),
    },
  ],
  selector: '[target]',
})
class TargetDirective implements Validator {
  public pubRegisterOnValidatorChange: any;
  public pubValidate: any;

  public registerOnValidatorChange(fn: any): void {
    this.pubRegisterOnValidatorChange = [fn];
  }

  public validate(): ValidationErrors {
    this.pubValidate = [];

    return {
      validator: true,
    };
  }
}

@Component({
  selector: 'app-root-167-ng-validators',
  template: '<input [formControl]="control" target>',
})
class RealComponent {
  public readonly control = new FormControl();
}

@NgModule({
  declarations: [TargetDirective, RealComponent],
  exports: [RealComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/167
describe('issue-167:NG_VALIDATORS:real', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents(),
  );

  it('should trigger validation w/o an error', () => {
    const fixture = MockRender(RealComponent);

    fixture.point.componentInstance.control.setValue('updated');
    expect(fixture.point.componentInstance.control.errors).toEqual({
      validator: true,
    });
  });
});

// @see https://github.com/help-me-mom/ng-mocks/issues/167
describe('issue-167:NG_VALIDATORS:mock', () => {
  beforeEach(() =>
    MockBuilder(RealComponent, TargetModule).keep(
      ReactiveFormsModule,
    ),
  );

  it('should trigger validation w/o an error', () => {
    const fixture = MockRender(RealComponent);

    const mock = ngMocks.findInstance(
      fixture.debugElement,
      TargetDirective,
    );
    ngMocks.stubMember(
      mock,
      'validate',
      typeof jest === 'undefined'
        ? jasmine.createSpy().and.returnValue({
            mock: true,
          })
        : jest.fn().mockReturnValue({
            mock: true,
          }),
    );

    fixture.point.componentInstance.control.setValue('updated');
    expect(fixture.point.componentInstance.control.errors).toEqual({
      mock: true,
    });
  });
});
