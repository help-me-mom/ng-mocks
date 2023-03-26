import { CommonModule, NgIf } from '@angular/common';
import {
  ApplicationModule,
  ChangeDetectionStrategy,
  Component,
  VERSION,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MockBuilder } from 'ng-mocks';

@Component(
  {
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: ` <a [routerLink]="['link']">Link</a> `,
    changeDetection: ChangeDetectionStrategy.OnPush,
  } as never /* TODO: remove after upgrade to a14 */,
)
class MyComponent {
  constructor(public activatedRoute: ActivatedRoute) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/3635
// MockBuilder doesn't detect always keep modules such as CommonModule.
describe('issue-3635', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs a14', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  it('does not throw because CommonModule is an import in MyComponent', () => {
    expect(() =>
      MockBuilder(MyComponent, ActivatedRoute).build(),
    ).not.toThrowError(/MockBuilder has found a missing dependency/);
  });

  it('throws because ApplicationModule is not imported anywhere', () => {
    expect(() =>
      MockBuilder(MyComponent, ActivatedRoute)
        .mock(ApplicationModule)
        .build(),
    ).toThrowError(/MockBuilder has found a missing dependency/);
  });

  it('does not throw because NgIf is a part of CommonModule from MyComponent', () => {
    expect(() =>
      MockBuilder(MyComponent, ActivatedRoute).mock(NgIf).build(),
    ).not.toThrowError(/MockBuilder has found a missing dependency/);
  });
});
