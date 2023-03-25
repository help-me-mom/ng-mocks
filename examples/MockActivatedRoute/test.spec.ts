import { Component, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-activated-route',
  template: '{{ param }}',
})
class TargetComponent implements OnInit {
  public param: string | null = null;

  public constructor(private route: ActivatedRoute) {}
  ngOnInit() {
    this.param = this.route.snapshot.paramMap.get('paramId');
  }
}

@NgModule({
  declarations: [TargetComponent],
  imports: [
    RouterModule.forRoot([
      {
        path: 'test/:paramId',
        component: TargetComponent,
      },
    ]),
  ],
})
class TargetModule {}

describe('MockActivatedRoute', () => {
  // Resets customizations after each test, in our case of `ActivatedRoute`.
  MockInstance.scope();

  // Keeping TargetComponent as it is and mocking all declarations in TargetModule.
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('uses paramId from ActivatedRoute', () => {
    // Let's set the params of the snapshot.
    if (typeof jest === 'undefined') {
      MockInstance(
        ActivatedRoute,
        'snapshot',
        jasmine.createSpy(),
        'get',
      ).and.returnValue({
        paramMap: new Map([['paramId', 'paramValue']]),
      });
    } else {
      // in case of jest.
      MockInstance(
        ActivatedRoute,
        'snapshot',
        jest.fn(),
        'get',
      ).mockReturnValue({
        paramMap: new Map([['paramId', 'paramValue']]),
      });
    }

    // Rendering TargetComponent.
    const fixture = MockRender(TargetComponent);

    // Asserting it got the right paramId.
    expect(fixture.point.componentInstance.param).toEqual(
      'paramValue',
    );
  });
});
