import { CommonModule } from '@angular/common';
import { ApplicationConfig, Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

const appConfig: ApplicationConfig = {
  providers: [],
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: '<h1>Welcome to {{ title }}!</h1>',
})
class AppComponent {
  public readonly title = 'a16';
}

bootstrapApplication(AppComponent, appConfig).catch(error => console.error(error));
