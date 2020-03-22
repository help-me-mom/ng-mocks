import { By } from '@angular/platform-browser';
import { MockBuilder, MockedComponent, MockRender } from 'ng-mocks';

import { ContentChildComponent } from './fixtures.components';

describe('Rerender of a rendered @ContentChild', () => {
  beforeEach(async (done: DoneFn) => {
    await MockBuilder()
      .mock(ContentChildComponent, {
        render: {
          block: {
            $implicit: '$implicit',
          }
        }
      });
    done();
  });

  it('should rerender everything correctly', () => {
    const fixture = MockRender(`<ccc>
        <ng-template #block let-value>{{ value }} {{ outside }}</ng-template>
    </ccc>`, {
      outside: '1',
    });
    expect(fixture).toBeDefined();
    expect(fixture.debugElement.nativeElement.innerText).toContain('$implicit 1');

    fixture.componentInstance.outside = '2';
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.innerText).toContain('$implicit 2');

    const component = fixture.debugElement.query(By.directive(ContentChildComponent))
      .componentInstance as MockedComponent<ContentChildComponent>;

    component.__render('block', 'updated');
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.innerText).toContain('updated 2');

    fixture.componentInstance.outside = '3';
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.innerText).toContain('updated 3');
  });
});
