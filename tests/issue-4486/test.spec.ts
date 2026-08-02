import { Component, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'issue-4486-real',
  standalone: false,
  template: 'real',
})
class Issue4486RealComponent {}

@NgModule({
  declarations: [Issue4486RealComponent],
  exports: [Issue4486RealComponent],
})
class Issue4486RealModule {}

@Component({
  selector: 'issue-4486-nested',
  standalone: false,
  template: '<issue-4486-real></issue-4486-real>',
})
class Issue4486NestedComponent {}

@NgModule({
  imports: [Issue4486RealModule],
  declarations: [Issue4486NestedComponent],
  exports: [Issue4486NestedComponent],
})
class Issue4486NestedModule {}

@Component({
  selector: 'issue-4486-target',
  standalone: true,
  imports: [Issue4486NestedModule],
  template: '<issue-4486-nested></issue-4486-nested>',
} as never)
class Issue4486TargetComponent {}

@Component({
  selector: 'issue-4486-real',
  standalone: false,
  template: 'test',
  host: {
    'data-issue-4486': 'testing',
  },
})
class Issue4486RealTestingComponent {}

@NgModule({
  declarations: [Issue4486RealTestingComponent],
  exports: [Issue4486RealTestingComponent],
})
class Issue4486RealTestingModule {}

@NgModule({
  declarations: [Issue4486NestedComponent],
  exports: [Issue4486NestedComponent],
  imports: [Issue4486RealTestingModule],
})
class Issue4486NestedTestingModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/4486
// The testing module reuses the nested component but changes its transitive
// import. The replacement must compile that component in the testing scope.
describe('issue-4486', () => {
  beforeEach(() =>
    MockBuilder(Issue4486TargetComponent).replace(
      Issue4486NestedModule,
      Issue4486NestedTestingModule,
    ),
  );

  it('renders the nested replacement dependency', () => {
    const fixture = MockRender(Issue4486TargetComponent);

    expect(ngMocks.formatText(fixture)).toEqual('test');
  });
});
