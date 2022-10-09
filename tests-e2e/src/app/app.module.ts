import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MockComponent, MockDirective, MockPipe, MockModule, MockProvider } from 'ng-mocks';

import { AppComponent } from './app.component';
import { AppDirective } from './app.directive';
import { AppPipe } from './app.pipe';
import { AppService } from './app.service';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent, AppDirective, AppPipe],
  imports: [BrowserModule],
  providers: [AppService],
})
export class AppModule {}

export const AppTestingModule = MockModule(AppModule);
export const AppTestingComponent = MockComponent(AppComponent);
export const AppTestingDirective = MockDirective(AppDirective);
export const AppTestingPipe = MockPipe(AppPipe);
export const AppTestingService = MockProvider(AppService);
