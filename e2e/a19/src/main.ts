import { ApplicationConfig, Component, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true })],
};

@Component({
  selector: 'app-root',
  template: '<h1>Welcome to {{ title }}!</h1>',
})
class AppComponent {
  public readonly title = 'a19';
}

bootstrapApplication(AppComponent, appConfig).catch(error => console.error(error));
