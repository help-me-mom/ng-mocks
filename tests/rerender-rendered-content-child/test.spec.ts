import {
  MockBuilder,
  MockComponent,
  MockRender,
  ngMocks,
} from 'ng-mocks';

import { ContentChildComponent } from './fixtures';

describe('Rerender of a rendered @ContentChild', () => {
  beforeEach(async () => {
    await MockBuilder().mock(ContentChildComponent, {
      render: {
        block: {
          $implicit: '$implicit',
        },
      },
    });
  });

  it('should rerender everything correctly', () => {
    const fixture = MockRender(
      `<ccc>
        <ng-template #block let-value>{{ value }} {{ outside }}</ng-template>
    </ccc>`,
      {
        outside: '1',
      },
    );
    expect(fixture).toBeDefined();
    expect(fixture.nativeElement.innerHTML).toContain('$implicit 1');

    fixture.componentInstance.outside = '2';
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('$implicit 2');

    const component = ngMocks.find(
      fixture.debugElement,
      MockComponent(ContentChildComponent),
    ).componentInstance;

    component.__render('block', 'updated');
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('updated 2');

    fixture.componentInstance.outside = '3';
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('updated 3');
  });
});
