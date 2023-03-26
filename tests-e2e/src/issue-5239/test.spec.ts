import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  isMockOf,
  MockComponent,
  MockRender,
  ngMocks,
} from 'ng-mocks';

// A simple dependency component we are going to mock that imports the standalone pipe.
@Component({
  selector: 'dependency',
  template: 'dependency',
  standalone: true,
  imports: [MatMenuModule],
})
class DependencyComponent {
  public dependency5239e2e() {}
}

// A standalone component we are going to test.
@Component({
  selector: 'target',
  template: `
    <dependency></dependency>
    <mat-expansion-panel [expanded]="true">
      <mat-expansion-panel-header>
        This is the expansion title
      </mat-expansion-panel-header>
      <ng-template matExpansionPanelContent>
        Some deferred content
      </ng-template>
    </mat-expansion-panel>
  `,
})
class TargetComponent {
  public target5239e2e() {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/5239
describe('issue-5239', () => {
  beforeEach(() => {
    return TestBed.configureTestingModule({
      declarations: [
        // our component for testing
        TargetComponent,
      ],
      imports: [
        NoopAnimationsModule,

        // imports PortalModule, therefore it should be kept.
        MatExpansionModule,

        // the dependent component we want to mock,
        // but internally uses MatMenuModule > OverlayModule > PortalModule,
        // and mocks it, but should not.
        MockComponent(DependencyComponent),
      ],
    }).compileComponents();
  });

  it('renders dependencies', () => {
    const fixture = MockRender(TargetComponent);
    const html = ngMocks.formatHtml(fixture);
    expect(html).toContain('Some deferred content');

    const dependency = ngMocks.findInstance(DependencyComponent);
    expect(isMockOf(dependency, DependencyComponent)).toEqual(true);
  });
});
