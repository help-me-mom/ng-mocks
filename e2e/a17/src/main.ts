import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

@Component({
  selector: 'app-root',
  template: '{{ title }}',
})
class AppComponent {
  public readonly title: string = 'Hello World';
}

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
})
class AppModule {}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(error => console.error(error));
