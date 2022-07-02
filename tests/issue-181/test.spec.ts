import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  Directive,
  NgModule,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['header'],
  selector: 'app-target',
  template: '<ng-content></ng-content>',
})
class TargetComponent {
  @ContentChild('header', {} as any)
  public header: any;
}

@Directive({
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['header'],
  selector: '[appTarget]',
})
class TargetDirective {
  @ContentChild('header', {} as any)
  public header: any;
}

@NgModule({
  declarations: [TargetComponent, TargetDirective],
  exports: [TargetComponent, TargetDirective],
  imports: [CommonModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/181
describe('issue-181:real', () => {
  beforeEach(() => MockBuilder().keep(TargetModule));

  it('should create the component', () => {
    const fixture = MockRender(`
      <app-target appTarget>
        <ng-template #header>
          header
        </ng-template>
      </app-target>
    `);
    expect(
      ngMocks.findInstance(fixture.debugElement, TargetComponent)
        .header,
    ).toBeTruthy();
    expect(
      ngMocks.findInstance(fixture.debugElement, TargetDirective)
        .header,
    ).toBeTruthy();
  });
});

// @see https://github.com/help-me-mom/ng-mocks/issues/181
describe('issue-181:mock', () => {
  beforeEach(() => MockBuilder().mock(TargetModule));

  // it fails in e2e with enabled ivy only.
  it('should create the component', () => {
    const fixture = MockRender(`
      <app-target appTarget>
        <ng-template #header>
          header
        </ng-template>
      </app-target>
    `);
    expect(
      ngMocks.findInstance(fixture.debugElement, TargetComponent)
        .header,
    ).toBeTruthy();
    expect(
      ngMocks.findInstance(fixture.debugElement, TargetDirective)
        .header,
    ).toBeTruthy();
  });
});
