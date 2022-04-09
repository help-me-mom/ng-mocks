import { CommonModule } from '@angular/common';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { CustomRootComponent, CustomTypeDirective } from './fixtures';

describe('context-with-directives:real', () => {
  beforeEach(() =>
    MockBuilder()
      .keep(CustomTypeDirective)
      .keep(CustomRootComponent)
      .keep(CommonModule),
  );

  it('renders everything right', () => {
    const fixture = MockRender(`
      <custom-root>
        <div>header</div>
        <ng-template [type]="'template'">
          template w/ directive w/o binding
        </ng-template>
        <ng-template [type]="'template1'" let-value>
          template w/ directive w/ binding {{ value[0] }}
        </ng-template>
        <ng-template [type]="'template2'" let-value>
          template w/ directive w/ binding w/o render
        </ng-template>
        <ng-template>
          template w/o directive w/o binding
        </ng-template>
        <ng-template let-value>
          template w/o directive w/ binding {{ value[0] }}
        </ng-template>
        <div>footer</div>
      </custom-root>
    `);

    // template should be rendered under .template
    expect(
      ngMocks.formatHtml(
        ngMocks.find(fixture.debugElement, '.template'),
      ),
    ).toContain('template w/ directive w/o binding');

    // template1 should be rendered under .template1
    expect(
      ngMocks.formatHtml(
        ngMocks.find(fixture.debugElement, '.template1'),
      ),
    ).toContain('template w/ directive w/ binding 1');

    // template2 should not be rendered
    expect(ngMocks.formatHtml(fixture)).not.toContain(
      'template w/ directive w/ binding w/o render',
    );

    // unused ng-templates should not be rendered at all
    expect(ngMocks.formatHtml(fixture)).not.toContain(
      'template w/o directive w/o binding',
    );
    expect(ngMocks.formatHtml(fixture)).not.toContain(
      'template w/o directive w/ binding',
    );

    // ng-content contains header and footer
    expect(
      ngMocks.formatHtml(
        ngMocks.find(fixture.debugElement, '.nested'),
      ),
    ).toContain('<div>header</div>');
    expect(
      ngMocks.formatHtml(
        ngMocks.find(fixture.debugElement, '.nested'),
      ),
    ).toContain('<div>footer</div>');
  });
});

describe('context-with-directives:mock', () => {
  beforeEach(() =>
    MockBuilder().mock(CustomTypeDirective).mock(CustomRootComponent),
  );

  it('renders everything what is not template', () => {
    const fixture = MockRender(`
      <custom-root>
        <div>header</div>
        <ng-template [type]="'template'">
          template w/ directive w/o binding
        </ng-template>
        <ng-template [type]="'template1'" let-value>
          template w/ directive w/ binding {{ value[0] }}
        </ng-template>
        <ng-template [type]="'template2'" let-value>
          template w/ directive w/ binding {{ value[0] }}
        </ng-template>
        <ng-template>
          template w/o directive w/o binding
        </ng-template>
        <ng-template let-value>
          template w/o directive w/ binding {{ value[0] }}
        </ng-template>
        <div>footer</div>
      </custom-root>
    `);

    expect(fixture.nativeElement.innerHTML).toContain(
      '<div>header</div>',
    );
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div>footer</div>',
    );

    // No templates should be rendered when we mock them.
    // The reason for that is that only directive knows when to render it, that means if we want to render,
    // we should do that manually.
    expect(ngMocks.formatHtml(fixture)).not.toContain('template');
  });
});
