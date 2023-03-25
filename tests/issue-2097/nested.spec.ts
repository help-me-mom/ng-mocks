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
  selector: 'parent-2097-nested',
  template:
    '<child-2097-nested></child-2097-nested><child-2097-nested></child-2097-nested><ng-content></ng-content>',
})
class ParentComponent {}

@Component({
  selector: 'child-2097-nested',
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

// @see https://github.com/help-me-mom/ng-mocks/issues/2097
describe('issue-2097:nested', () => {
  beforeEach(() =>
    MockBuilder(
      [ParentComponent, ChildComponent, TOKEN],
      TargetModule,
    ),
  );

  it('finds tokens correctly', () => {
    MockRender(`
      <parent-2097-nested>
        <child-2097-nested></child-2097-nested>
        <child-2097-nested></child-2097-nested>
      </parent-2097-nested>
    `);

    // it should be found on the parent node only.
    const instances = ngMocks.findInstances(
      'parent-2097-nested',
      TOKEN,
    );
    expect(instances).toEqual(['parent']);
  });
});
