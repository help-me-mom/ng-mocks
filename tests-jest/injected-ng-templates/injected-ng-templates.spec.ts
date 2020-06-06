import { DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockComponent, MockRender, ngMocks } from 'ng-mocks';

import { CustomInjectionComponent } from './custom-injection.component';

describe('injected-ng-templates:real', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomInjectionComponent],
    });
  });

  it('renders injected template properly', () => {
    // should iterate against 3 string.
    const fixture = MockRender(
      `<custom-injection [items]="values">
        <ng-template let-value #block>
          <div>{{value}}</div>
        </ng-template>
      </custom-injection>`,
      {
        values: ['string1', 'string2', 'string3'],
      }
    );

    // every value should be rendered correctly.
    expect(fixture.nativeElement.innerHTML).toContain('<div>string1</div>');
    expect(fixture.nativeElement.innerHTML).toContain('<div>string2</div>');
    expect(fixture.nativeElement.innerHTML).toContain('<div>string3</div>');
  });
});

describe('structural-directive-as-ng-for:mock', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockComponent(CustomInjectionComponent)],
    });
  });

  it('renders mocked component with injected template properly', () => {
    // do not remove, it checks casts from MockDebugElement to DebugElement.
    let block: undefined | DebugElement;

    // should iterate against 3 string.
    const fixture = MockRender(
      `<custom-injection [items]="values">
        <ng-template let-value let-custom="test" #block>
          <div>{{outside}} {{value}} {{custom}}</div>
        </ng-template>
        <div>ng-content</div>
      </custom-injection>`,
      {
        outside: 'string0',
        values: ['string1', 'string2', 'string3'],
      }
    );

    // By default @ContentChild('block') shouldn't be rendered at all.
    block = ngMocks.find(fixture.debugElement, '[data-key="block"]', undefined);
    expect(block).toBeUndefined();

    const mockedComponent = ngMocks.find(fixture.debugElement, MockComponent(CustomInjectionComponent))
      .componentInstance;

    // Now we want to render @ContentChild('block') with some context.
    mockedComponent.__render('block', 'string1', {
      test: 'test1',
    });
    fixture.detectChanges();
    block = ngMocks.find(fixture.debugElement, '[data-key="block"]');
    expect(block.nativeElement.innerHTML).toContain('<div>string0 string1 test1</div>');

    // Now we want to render @ContentChild('block') with another context.
    mockedComponent.__render('block', 'string2', {
      test: 'test2',
    });
    fixture.detectChanges();
    block = ngMocks.find(fixture.debugElement, '[data-key="block"]');
    expect(block.nativeElement.innerHTML).toContain('<div>string0 string2 test2</div>');
  });
});
