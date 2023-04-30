import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-root',
  template: '{{ title }}',
})
class AppComponent {
  public readonly title: string = 'Hello World';
}

bootstrapApplication(AppComponent).catch(error => console.error(error));
