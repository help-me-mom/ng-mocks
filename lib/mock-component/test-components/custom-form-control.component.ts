// sample control value accessor copied from
// https://alligator.io/angular/custom-form-control/

import { Component, forwardRef, HostBinding, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const STARS = 5;
const OPACITY = 0.25;

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomFormControlComponent),
    }
  ],
  selector: 'custom-form-control',
  styles: [`
      span {
          display: inline-block;
          width: 25px;
          line-height: 25px;
          text-align: center;
          cursor: pointer;
      }
  `],
  template: `
      <span
              *ngFor="let starred of stars; let i = index"
              (click)="onTouched(); rate(i + (starred ? (value > i + 1 ? 1 : 0) : 1))">
      <ng-container *ngIf="starred; else noStar">⭐</ng-container>
      <ng-template #noStar>·</ng-template>
    </span>
  `,
})
export class CustomFormControlComponent implements ControlValueAccessor {

  @Input() disabled = false;
  stars: boolean[] = Array(STARS).fill(false);

  // Allow the input to be disabled, and when it is make it somewhat transparent.
  @HostBinding('style.opacity')
  get opacity() {
    return this.disabled ? OPACITY : 1;
  }

  /* tslint:disable:no-empty */
  // Function to call when the rating changes.
  onChange = (rating: number) => {};

  // Function to call when the input is touched (when a star is clicked).
  // @ts-ignore
  onTouched = () => {};
  /* tslint:enable:no-empty */

  get value(): number {
    return this.stars.reduce((total, starred) =>
      total + (starred ? 1 : 0),
      0);
  }

  rate(rating: number) {
    if (!this.disabled) {
      this.writeValue(rating);
    }
  }

  // Allows Angular to register a function to call when the model (rating) changes.
  // Save the function as a property to call later here.
  registerOnChange(fn: (rating: number) => void): void {
    this.onChange = fn;
  }

  // Allows Angular to register a function to call when the input has been touched.
  // Save the function as a property to call later here.
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Allows Angular to disable the input.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Allows Angular to update the model (rating).
  // Update the model and changes needed for the view here.
  writeValue(rating: number): void {
    this.stars = this.stars.map((_, i) => rating > i);
    this.onChange(this.value);
  }
}
