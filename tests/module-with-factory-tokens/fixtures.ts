import { CommonModule } from '@angular/common';
import { Component, Inject, InjectionToken, NgModule } from '@angular/core';

export const MY_TOKEN_SINGLE = new (InjectionToken as any)(/* A5 */ 'MY_TOKEN_SINGLE', {
  factory: () => 'MY_TOKEN_SINGLE',
});

export const MY_TOKEN_MULTI = new (InjectionToken as any)(/* A5 */ 'MY_TOKEN_MULTI', {
  factory: () => 'MY_TOKEN_MULTI',
});

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
})
export class TargetModule {}
