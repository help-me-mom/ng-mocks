import { Component, NgModule } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target',
  template: `
    <input
      type="text"
      matInput
      [formControl]="control"
      name="form-control"
    />
    <input type="text" matInput [(ngModel)]="value" name="ng-model" />
  `,
})
class TargetComponent {
  public readonly control = new FormControl();
  public value: any;
}

@NgModule({
  declarations: [TargetComponent],
  imports: [FormsModule, ReactiveFormsModule, MatInputModule],
})
class TargetModule {}

describe('mat-input', () => {
  describe('real', () => {
    beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

    it('changes values', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      const input1 = ngMocks.find(['name', 'form-control']);
      const input2 = ngMocks.find(['name', 'ng-model']);

      ngMocks.change(input1, 'input1');
      expect(component.control.value).toEqual('input1');

      ngMocks.change(input2, 'input2');
      expect(component.value).toEqual('input2');

      ngMocks.output(input2, 'ngModelChange').emit('input3');
      expect(component.value).toEqual('input3');
    });
  });
});
