import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { MockDirective, MockRender } from 'ng-mocks';
import { CustomRootComponent } from './custom-root.component';
import { CustomTypeDirective } from './custom-type.directive';

describe('context-with-directives:real', () => {

  beforeEach((done) => {
    TestBed.configureTestingModule({
      declarations: [
        CustomTypeDirective,
        CustomRootComponent,
      ],
      imports: [
        CommonModule,
      ]
    }).compileComponents().then(done);
  });

  it('renders everything right', () => {
    const fixture = MockRender(`
      <custom-root>
        <ng-template [type]="'template1'" let-value>
          Here goes {{ value[0] }}
        </ng-template>
        <ng-template [type]="'template2'" let-value>
          Here goes {{ value[0] }}
        </ng-template>
        <ng-template [type]="'template'" let-value>
          Here goes {{ value[0] }}
        </ng-template>
      </custom-root>
    `);

    expect(fixture.nativeElement.innerText).toContain('Here goes 0');
    expect(fixture.nativeElement.innerText).toContain('Here goes 1');
    expect(fixture.nativeElement.innerText).toContain('Here goes 2');
  });
});

fdescribe('context-with-directives:mock', () => {

  beforeEach((done) => {
    TestBed.configureTestingModule({
      declarations: [
        MockDirective(CustomTypeDirective),
        MockDirective(CustomRootComponent),
      ],
      imports: [
        CommonModule,
      ]
    }).compileComponents().then(done);
  });

  it('renders everything right', () => {
    const fixture = MockRender(`
      <custom-root>
        <ng-template [type]="'template1'" let-value>
          Here goes {{ value[0] }}
        </ng-template>
        <ng-template [type]="'template2'" let-value>
          Here goes {{ value[0] }}
        </ng-template>
        <ng-template [type]="'template'" let-value>
          Here goes {{ value[0] }}
        </ng-template>
      </custom-root>
    `);

    console.log(fixture.nativeElement.innerText);

    expect(fixture.nativeElement.innerText).toContain('Here goes 0');
    expect(fixture.nativeElement.innerText).toContain('Here goes 1');
    expect(fixture.nativeElement.innerText).toContain('Here goes 2');
  });
});
