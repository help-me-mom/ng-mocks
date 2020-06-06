import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockDirective, MockRender } from 'ng-mocks';
import { CustomRootComponent } from './custom-root.component';
import { CustomTypeDirective } from './custom-type.directive';

describe('context-with-directives:real', () => {
  beforeEach(done => {
    TestBed.configureTestingModule({
      declarations: [CustomTypeDirective, CustomRootComponent],
      imports: [CommonModule],
    })
      .compileComponents()
      .then(done);
  });

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
    expect(fixture.debugElement.query(By.css('.template')).nativeElement.innerText).toContain(
      'template w/ directive w/o binding'
    );

    // template1 should be rendered under .template1
    expect(fixture.debugElement.query(By.css('.template1')).nativeElement.innerText).toContain(
      'template w/ directive w/ binding 1'
    );

    // template2 should not be rendered
    expect(fixture.nativeElement.innerText).not.toContain('template w/ directive w/ binding w/o render');

    // unused ng-templates shouldn't be rendered at all
    expect(fixture.nativeElement.innerText).not.toContain('template w/o directive w/o binding');
    expect(fixture.nativeElement.innerText).not.toContain('template w/o directive w/ binding');

    // ng-content contains header and footer
    expect(fixture.debugElement.query(By.css('.nested')).nativeElement.innerText.replace(/\s+/, ' ')).toContain(
      'header footer'
    );
  });
});

describe('context-with-directives:mock', () => {
  beforeEach(done => {
    TestBed.configureTestingModule({
      declarations: [MockDirective(CustomTypeDirective), MockDirective(CustomRootComponent)],
    })
      .compileComponents()
      .then(done);
  });

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

    expect(fixture.nativeElement.innerText).toContain('header');
    expect(fixture.nativeElement.innerText).toContain('footer');

    // No templates should be rendered when we mock them.
    // The reason for that is that only directive knows when to render it, that means if we want to render,
    // we should do that manually.
    expect(fixture.nativeElement.innerText).not.toContain('template');
  });
});
