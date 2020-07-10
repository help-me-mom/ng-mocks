import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HelloComponent } from './hello.component';

@NgModule({
  declarations: [HelloComponent],
  exports: [HelloComponent],
  imports: [CommonModule],
})
export class HelloModule {}
