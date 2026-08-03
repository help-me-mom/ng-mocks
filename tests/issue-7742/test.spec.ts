import { Component } from '@angular/core';
import {
  DeferBlockBehavior,
  DeferBlockState,
  TestBed,
} from '@angular/core/testing';

import { isMockOf, MockComponents, ngMocks } from 'ng-mocks';

@Component({
  selector: 'dependency-7742',
  template: 'dependency',
  standalone: true,
})
class DependencyComponent {
  public dependency7742() {}
}

@Component({
  selector: 'target-7742',
  template: `
    @defer {
      <dependency-7742 />
    } @placeholder {
      placeholder
    }
  `,
  standalone: true,
  imports: [DependencyComponent],
})
class TargetComponent {
  public target7742() {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/7742
describe('issue-7742', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetComponent],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    })
      .overrideComponent(TargetComponent, {
        set: {
          imports: MockComponents(DependencyComponent),
        },
      })
      .compileComponents(),
  );

  it('returns defer blocks with a mocked dependency', async () => {
    const fixture = TestBed.createComponent(TargetComponent);
    await fixture.whenStable();

    const deferBlocks = await fixture.getDeferBlocks();
    expect(deferBlocks.length).toEqual(1);

    await deferBlocks[0].render(DeferBlockState.Complete);

    expect(
      isMockOf(
        ngMocks.findInstance(DependencyComponent),
        DependencyComponent,
      ),
    ).toEqual(true);
  });
});
