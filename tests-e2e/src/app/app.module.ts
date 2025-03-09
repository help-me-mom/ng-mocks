import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppDirective } from './app.directive';
import { AppPipe } from './app.pipe';
import { AppService } from './app.service';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent, AppDirective, AppPipe],
  exports: [AppComponent, AppComponent, AppPipe],
  imports: [BrowserModule],
  providers: [AppService],
})
class AppModule {}

export { AppModule };

export { AppComponent } from './app.component';
export { AppPipe } from './app.pipe';
export { AppDirective } from './app.directive';

export { AppService } from './app.service';
