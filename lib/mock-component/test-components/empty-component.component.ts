import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmptyComponent),
    },
  ],
  selector: 'empty-component',
  template: 'some template',
})
export class EmptyComponent {}
