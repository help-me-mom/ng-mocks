import { CommonModule } from '@angular/common';
import { ContentChild, Directive, NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  inputs: ['header'],
  selector: 'app-target',
})
class TargetComponent {
  @ContentChild('header', {} as any)
  public header: any;
}

@Directive({
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

// @see https://github.com/ike18t/ng-mocks/issues/181
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

// @see https://github.com/ike18t/ng-mocks/issues/181
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
