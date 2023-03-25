import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'app-hello-178',
  template: 'app-hello',
})
class HelloComponent {}

@Component({
  selector: 'app-hello2-178',
  template: 'app-hello2',
})
class Hello2Component {}

const routesHello: Routes = [
  {
    component: HelloComponent,
    path: '',
  },
  {
    component: Hello2Component,
    path: '',
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routesHello)],
})
class HelloRoutingModule {}

@NgModule({
  declarations: [HelloComponent, Hello2Component],
  exports: [HelloComponent, Hello2Component],
  imports: [HelloRoutingModule],
})
class HelloModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/178
describe('issue-178', () => {
  beforeEach(
    () =>
      MockBuilder(HelloComponent, HelloModule).replace(
        RouterModule,
        RouterTestingModule,
      ), // <- causes the issue
  );

  it('should create the component', () => {
    const fixture = MockRender(HelloComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
