import { Component, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: CvaComponent,
    },
  ],
  selector: 'cva-ng-mocks-touch-cdr-touch',
  template: ' {{ show }} ',
})
class CvaComponent implements ControlValueAccessor {
  public onChange: any = () => undefined;
  public onTouched: any = () => undefined;
  public show: any = null;

  public registerOnChange = (onChange: any) =>
    (this.onChange = onChange);
  public registerOnTouched = (onTouched: any) =>
    (this.onTouched = onTouched);

  public writeValue = (value: any) => {
    this.show = value;
  };
}

@Component({
  selector: 'target-ng-mocks-touch-cdr-touch',
  template: `
    <cva-ng-mocks-touch-cdr-touch
      [formControl]="control"
      class="form-control"
    ></cva-ng-mocks-touch-cdr-touch>
    <cva-ng-mocks-touch-cdr-touch
      [(ngModel)]="value"
      class="ng-model"
    ></cva-ng-mocks-touch-cdr-touch>
  `,
})
class TargetComponent {
  public control = new FormControl();
  public value: string | null = null;
}

@NgModule({
  declarations: [CvaComponent, TargetComponent],
  imports: [ReactiveFormsModule, FormsModule],
})
class MyModule {}

// checking how normal form works
describe('ng-mocks-touch:cdr-blur', () => {
  const dataSet: Array<[string, () => void]> = [
    ['real', () => MockBuilder(TargetComponent).keep(MyModule)],
    [
      'mock-vca',
      () =>
        MockBuilder(TargetComponent)
          .keep(MyModule)
          .mock(CvaComponent),
    ],
  ];

  for (const [label, init] of dataSet) {
    describe(label, () => {
      beforeEach(init);

      it('correctly touches CVA', () => {
        const fixture = MockRender(TargetComponent);

        const formControl = ngMocks.find('.form-control');
        expect(ngMocks.formatHtml(formControl, true)).toContain(
          'class="form-control ng-untouched ng-pristine ng-valid"',
        );
        ngMocks.touch(formControl);
        expect(ngMocks.formatHtml(formControl, true)).toContain(
          'class="form-control ng-untouched ng-pristine ng-valid"',
        );

        // nothing should be rendered so far, but now we trigger the render
        fixture.detectChanges();
        expect(ngMocks.formatHtml(formControl, true)).toContain(
          'class="form-control ng-pristine ng-valid ng-touched"',
        );

        const ngModel = ngMocks.find('.ng-model');
        expect(ngMocks.formatHtml(ngModel, true)).toContain(
          'class="ng-model ng-untouched ng-pristine ng-valid"',
        );
        ngMocks.touch(ngModel);
        expect(ngMocks.formatHtml(ngModel, true)).toContain(
          'class="ng-model ng-untouched ng-pristine ng-valid"',
        );

        // nothing should be rendered so far, but now we trigger the render
        fixture.detectChanges();
        expect(ngMocks.formatHtml(ngModel, true)).toContain(
          'class="ng-model ng-pristine ng-valid ng-touched"',
        );
      });
    });
  }
});

describe('ng-mocks-touch:cdr-blur:full-mock', () => {
  beforeEach(() => MockBuilder(TargetComponent, MyModule));

  it('correctly touches CVA', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    const formControl = ngMocks.find('.form-control');
    ngMocks.touch(formControl);
    expect(component.control.touched).toEqual(true);
  });
});
