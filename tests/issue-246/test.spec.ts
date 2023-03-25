import { Component, Directive, forwardRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';

import {
  isMockControlValueAccessor,
  isMockValidator,
  MockBuilder,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TargetComponent),
    },
  ],
  selector: 'target-246',
  template: '{{ providedValue }}',
})
class TargetComponent implements ControlValueAccessor {
  public providedChange: any;
  public providedDisable: any;
  public providedTouch: any;
  public providedValue: any;

  public registerOnChange(fn: any): void {
    this.providedChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.providedTouch = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.providedDisable = isDisabled;
  }

  public writeValue(obj: any): void {
    this.providedValue = obj;
  }
}

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
  public provideChange: any;
  public provideControl: any;

  public registerOnValidatorChange(fn: () => void): void {
    this.provideChange = fn;
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    this.provideControl = control;

    return {
      target: true,
    };
  }
}

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => TargetAsyncDirective),
    },
  ],
  selector: '[targetAsync]',
})
class TargetAsyncDirective implements Validator {
  public provideChange: any;
  public provideControl: any;

  public registerOnValidatorChange(fn: () => void): void {
    this.provideChange = fn;
  }

  public async validate(
    control: AbstractControl,
  ): Promise<ValidationErrors> {
    this.provideControl = control;

    return {
      targetAsync: true,
    };
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/246
describe('issue-246:real', () => {
  beforeEach(async () => {
    return TestBed.configureTestingModule({
      declarations: [
        TargetComponent,
        TargetDirective,
        TargetAsyncDirective,
      ],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  it('turns value control accessor into auto mocks', async () => {
    const control = new FormControl('246');

    // default render.
    const fixture = MockRender(
      '<target-246 [formControl]="control" target targetAsync></target-246>',
      {
        control,
      },
    );
    await fixture.whenStable();

    expect(control.touched).toEqual(false);
    expect(control.dirty).toEqual(false);
    expect(control.errors).toEqual({
      target: true,
    });

    // async fails independently only.
    ngMocks.stubMember(
      ngMocks.findInstance(TargetDirective),
      'validate',
      typeof jest === 'undefined'
        ? jasmine.createSpy().and.returnValue(null)
        : jest.fn().mockReturnValue(null),
    );
    control.updateValueAndValidity();
    await fixture.whenStable();
    expect(control.errors).toEqual({
      targetAsync: true,
    });
  });
});

// @see https://github.com/help-me-mom/ng-mocks/issues/246
describe('issue-246:mock', () => {
  beforeEach(() =>
    MockBuilder(ReactiveFormsModule)
      .mock(TargetComponent)
      .mock(TargetDirective)
      .mock(TargetAsyncDirective),
  );

  it('turns value control accessor into auto mocks', async () => {
    const control = new FormControl('246');

    // default render.
    const fixture = MockRender(
      '<target-246 [formControl]="control" target targetAsync></target-246>',
      {
        control,
      },
    );
    expect(control.touched).toEqual(false);
    expect(control.dirty).toEqual(false);

    const component = ngMocks.findInstance(TargetComponent);
    expect(component.registerOnChange).toHaveBeenCalledTimes(1);
    expect(component.registerOnTouched).toHaveBeenCalledTimes(1);
    expect(component.writeValue).toHaveBeenCalledWith('246');
    expect(component.writeValue).toHaveBeenCalledTimes(1);

    const directive = ngMocks.findInstance(TargetDirective);
    expect(directive.registerOnValidatorChange).toHaveBeenCalledTimes(
      1,
    );
    expect(directive.validate).toHaveBeenCalledWith(control);
    expect(directive.validate).toHaveBeenCalledTimes(1);

    const directiveAsync = ngMocks.findInstance(TargetAsyncDirective);
    expect(
      directiveAsync.registerOnValidatorChange,
    ).toHaveBeenCalledTimes(1);
    expect(directiveAsync.validate).toHaveBeenCalledWith(control);
    expect(directiveAsync.validate).toHaveBeenCalledTimes(1);

    // checking that touch works.
    if (isMockControlValueAccessor(component)) {
      component.__simulateTouch();
    }
    expect(control.touched).toEqual(true);

    // checking that change works.
    if (isMockControlValueAccessor(component)) {
      component.__simulateChange('fixed');
    }
    expect(control.value).toEqual('fixed');

    // checking async errors.
    if (isMockValidator(directiveAsync)) {
      ngMocks.stubMember(
        directiveAsync,
        'validate',
        typeof jest === 'undefined'
          ? jasmine.createSpy().and.returnValue(
              Promise.resolve({
                targetAsync: true,
              }),
            )
          : jest.fn().mockReturnValue(
              Promise.resolve({
                targetAsync: true,
              }),
            ),
      );
      directiveAsync.__simulateValidatorChange();
    }
    await fixture.whenStable();
    expect(control.errors).toEqual({
      targetAsync: true,
    });

    // checking sync errors, they block async validators.
    if (isMockValidator(directive)) {
      ngMocks.stubMember(
        directive,
        'validate',
        typeof jest === 'undefined'
          ? jasmine.createSpy().and.returnValue({
              test: true,
            })
          : jest.fn().mockReturnValue({
              test: true,
            }),
      );
      directive.__simulateValidatorChange();
    }
    expect(control.errors).toEqual({
      test: true,
    });
  });
});
