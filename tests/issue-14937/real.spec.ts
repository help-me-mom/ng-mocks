import { Component, Input, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, ngMocks } from 'ng-mocks';

let boundaryConstructions = 0;

@Component({
  selector: 'replace-14937-real',
  ['standalone' as never]: false,
  template: 'original:{{ marker }}',
})
class OriginalComponent {
  @Input() public marker = '';
}

@NgModule({
  declarations: [OriginalComponent],
  exports: [OriginalComponent],
})
class ReplaceModule {}

@Component({
  selector: 'replace-14937-real',
  ['standalone' as never]: false,
  template: 'replacement:{{ marker }}',
  host: { 'data-replacement': '' },
})
class ReplacementComponent {
  @Input() public marker = '';
}

@Component({
  selector: 'nested-14937-real',
  ['standalone' as never]: false,
  template:
    '<replace-14937-real marker="nested"></replace-14937-real>',
})
class NestedComponent {}

@NgModule({
  declarations: [NestedComponent],
  exports: [NestedComponent],
  imports: [ReplaceModule],
})
class NestedModule {}

@Component({
  selector: 'boundary-14937-real',
  ['standalone' as never]: false,
  template:
    '<replace-14937-real marker="boundary"></replace-14937-real>',
})
class BoundaryComponent {
  public constructor() {
    boundaryConstructions += 1;
  }
}

@NgModule({
  declarations: [BoundaryComponent],
  exports: [BoundaryComponent],
  imports: [ReplaceModule],
})
class BoundaryModule {}

@Component({
  selector: 'target-14937-real',
  ['standalone' as never]: false,
  template: `
    <section class="root">
      <replace-14937-real marker="root"></replace-14937-real>
    </section>
    <nested-14937-real></nested-14937-real>
    <boundary-14937-real></boundary-14937-real>
  `,
})
class TargetComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14937
// Independent classes prevent another case's cached module scopes affecting this baseline.
describe('issue-14937:real', () => {
  beforeEach(() => {
    ngMocks.flushTestBed();
    boundaryConstructions = 0;
  });

  it('applies the override to root and the first nested path in the real graph', async () => {
    await TestBed.configureTestingModule({
      declarations: [TargetComponent],
      imports: [NestedModule, BoundaryModule, ReplaceModule],
    })
      .overrideModule(ReplaceModule, {
        remove: {
          declarations: [OriginalComponent],
          exports: [OriginalComponent],
        },
        add: {
          declarations: [ReplacementComponent],
          exports: [ReplacementComponent],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();
    const root = ngMocks.find(fixture, '.root');
    const nested = ngMocks.find(fixture, NestedComponent);
    const boundary = ngMocks.find(fixture, BoundaryComponent);
    const rootReplacement = ngMocks.find(root, 'replace-14937-real');
    const nestedReplacement = ngMocks.find(
      nested,
      'replace-14937-real',
    );

    expect(isMockOf(fixture.componentInstance, TargetComponent)).toBe(
      false,
    );
    expect(isMockOf(nested.componentInstance, NestedComponent)).toBe(
      false,
    );
    expect(ngMocks.formatText(root)).toBe('replacement:root');
    expect(ngMocks.formatText(nested)).toBe('replacement:nested');
    expect(rootReplacement.componentInstance.marker).toBe('root');
    expect(nestedReplacement.componentInstance.marker).toBe('nested');
    expect(
      ngMocks.findInstance(
        rootReplacement,
        ReplacementComponent,
        null,
      ),
    ).toBe(rootReplacement.componentInstance);
    expect(
      ngMocks.findInstance(
        nestedReplacement,
        ReplacementComponent,
        null,
      ),
    ).toBe(nestedReplacement.componentInstance);
    expect(
      ngMocks.findInstance(root, OriginalComponent, null),
    ).toBeNull();
    expect(
      ngMocks.findInstance(nested, OriginalComponent, null),
    ).toBeNull();
    expect(rootReplacement.componentInstance).not.toBe(
      nestedReplacement.componentInstance,
    );
    expect(
      isMockOf(
        rootReplacement.componentInstance,
        ReplacementComponent,
      ),
    ).toBe(false);
    expect(
      isMockOf(
        nestedReplacement.componentInstance,
        ReplacementComponent,
      ),
    ).toBe(false);
    expect(
      isMockOf(boundary.componentInstance, BoundaryComponent),
    ).toBe(false);
    expect(boundaryConstructions).toBe(1);
  });
});
