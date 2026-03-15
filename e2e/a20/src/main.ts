import {
  ApplicationConfig,
  Component,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  signal,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideZoneChangeDetection({ eventCoalescing: true })],
};

@Component({
  selector: 'app-root',
  template: '<h1>Hello, {{ title() }}</h1>',
})
class App {
  protected readonly title = signal('a20');
}

bootstrapApplication(App, appConfig).catch(error => console.error(error));
