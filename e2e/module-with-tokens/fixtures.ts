// tslint:disable:max-classes-per-file no-parameter-properties

import { CommonModule } from '@angular/common';
import { Component, Inject, InjectionToken, NgModule } from '@angular/core';

export const MY_TOKEN_SINGLE = new InjectionToken('MY_TOKEN_SINGLE');

export const MY_TOKEN_MULTI = new InjectionToken('MY_TOKEN_MULTI');

@Component({
  selector: 'internal-component',
  template: '{{ tokenSingle | json }} {{ tokenMulti | json }}',
})
export class TargetComponent {
  constructor(
    @Inject(MY_TOKEN_SINGLE) public readonly tokenSingle: string,
    @Inject(MY_TOKEN_MULTI) public readonly tokenMulti: string[]
  ) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [CommonModule],
  providers: [
    {
      provide: MY_TOKEN_SINGLE,
      useValue: 'MY_TOKEN_SINGLE',
    },
    {
      multi: true,
      provide: MY_TOKEN_MULTI,
      useValue: 'MY_TOKEN_MULTI',
    },
    {
      multi: true,
      provide: MY_TOKEN_MULTI,
      useValue: 'MY_TOKEN_MULTI_2',
    },
  ],
})
export class TargetModule {}
