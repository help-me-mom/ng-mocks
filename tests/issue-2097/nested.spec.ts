import { Component, InjectionToken, NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const TOKEN = new InjectionToken<string>('TOKEN');

@Component({
  providers: [
    {
      provide: TOKEN,
      useValue: 'parent',
    },
  ],
  selector: 'parent',
  template: '<child></child><child></child><ng-content></ng-content>',
})
class ParentComponent {}

@Component({
  selector: 'child',
  template: 'child',
})
class ChildComponent {}

@NgModule({
  declarations: [ParentComponent, ChildComponent],
  providers: [
    {
      provide: TOKEN,
      useValue: 'token',
    },
  ],
})
class TargetModule {}

describe('issue-2097:nested', () => {
  beforeEach(() =>
    MockBuilder(
      [ParentComponent, ChildComponent, TOKEN],
      TargetModule,
    ),
  );

  it('finds tokens correctly', () => {
    MockRender(`
      <parent>
        <child></child>
        <child></child>
      </parent>
    `);

    // it should be found on the parent node only.
    const instances = ngMocks.findInstances('parent', TOKEN);
    expect(instances).toEqual(['parent']);
  });
});
