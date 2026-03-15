import { ApplicationConfig, Component, provideBrowserGlobalErrorListeners, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners()],
};

@Component({
  selector: 'app-root',
  template: '<h1>Hello, {{ title() }}</h1>',
})
class App {
  protected readonly title = signal('min');
}

bootstrapApplication(App, appConfig).catch(error => console.error(error));
