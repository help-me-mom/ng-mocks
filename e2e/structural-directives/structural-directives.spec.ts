import { DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockDirective, MockedDirective } from '../../lib/mock-directive';
import { MockHelper } from '../../lib/mock-helper';
import { MockRender } from '../../lib/mock-render';
import { CustomNgForWithOfDirective } from './custom-ng-for-with-of.directive';
import { CustomNgForWithoutOfDirective } from './custom-ng-for-without-of.directive';
import { CustomNgIfDirective } from './custom-ng-if.directive';

describe('structural-directive-as-ng-for:real', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        CustomNgForWithOfDirective,
        CustomNgForWithoutOfDirective,
        CustomNgIfDirective,
      ],
    });
  });

  it('renders customNgForWithOf properly', () => {
    // should iterate against 3 string.
    const fixture = MockRender(`
        <div data-type="customNgForWithOf"
          *customNgForWithOf="let v of values; let i = myIndex; let f = myFirst; let l = myLast;"
        >w/ {{v}}{{i}}{{f ? 1 : 0}}{{l ? 1 : 0}}</div>
      `, {
      values: [
        'string1',
        'string2',
        'string3',
      ],
    });

    // every value should be rendered correctly.
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithOf">w/ string1010</div>');
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithOf">w/ string2100</div>');
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithOf">w/ string3201</div>');
  });

  it('renders customNgForWithoutOf properly', () => {
    // should iterate against 3 string.
    const fixture = MockRender(`
        <div data-type="customNgForWithoutOf"
          *customNgForWithoutOf="values; let v; let i = myIndex; let f = myFirst; let l = myLast;"
        >w/o {{v}}{{i}}{{f ? 1 : 0}}{{l ? 1 : 0}}</div>
      `, {
      values: [
        'string1',
        'string2',
        'string3',
      ],
    });

    // every value should be rendered correctly.
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithoutOf">w/o string1010</div>');
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithoutOf">w/o string2100</div>');
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithoutOf">w/o string3201</div>');
  });

  it('renders customNgIf properly', () => {
    // should display just first part.
    const fixture = MockRender(`
        <div data-type="customNgIfTrue" *customNgIf="values">should be shown</div>
        <div data-type="customNgIfFalse" *customNgIf="!values">should be hidden</div>
      `, {
      values: [
        'string1',
        'string2',
        'string3',
      ],
    });

    // only first div should be rendered.
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgIfTrue">should be shown</div>');
    expect(fixture.nativeElement.innerHTML)
      .not.toContain('<div data-type="customNgIfFalse">should be hidden</div>');
  });
});

describe('structural-directive-as-ng-for:mock', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockDirective(CustomNgIfDirective),
        MockDirective(CustomNgForWithOfDirective),
        MockDirective(CustomNgForWithoutOfDirective),
      ],
    });
  });

  it('mocks customNgIf properly', () => {
    const fixture = MockRender(`
        <div data-type="customNgIfTrue" *customNgIf="values;let data;let randomParam = fromDirective">
          $implicit:{{ data | json }}
          fromDirective:{{ randomParam | json }}
        </div>
      `, {
      values: [
        'string1',
        'string2',
        'string3',
      ],
    });
    // By default mocked structural directives are rendered with undefined variables.
    expect(fixture.nativeElement.innerText).toEqual('$implicit: fromDirective:');

    // Extracting mock.
    const debugElement = fixture.debugElement.query(By.css('div'));
    const directive = MockHelper.getDirective(
      debugElement,
      MockDirective(CustomNgIfDirective),
    );
    expect(directive).toBeTruthy();
    if (!directive) {
      return;
    }

    // Assert that mock got right variables.
    expect(directive.setValue).toEqual([
      'string1',
      'string2',
      'string3',
    ]);

    // Now we want to assert how our html is rendered based on structural directive variables' definition.
    directive.__render(true, {
      fromDirective: false,
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toEqual('$implicit:true fromDirective:false');

    // And we want dynamically change variables for render.
    directive.__render(false, {
      fromDirective: true,
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toEqual('$implicit:false fromDirective:true');
  });

  it('mocks CustomNgForWithOfDirective properly', () => {
    const fixture = MockRender(`
        <div data-type="customNgForWithOf"
          *customNgForWithOf="let v of values; let i = myIndex; let f = myFirst; let l = myLast;"
        >
          w/ {{v}}{{i}}{{f ? 1 : 0}}{{l ? 1 : 0}}
        </div>
      `, {
      values: [
        'string1',
        'string2',
        'string3',
      ],
    });
    // By default mocked structural directives are rendered with undefined variables.
    expect(fixture.nativeElement.innerText).toEqual('w/ 00');

    const debugElement = fixture.debugElement.query(By.css('div'));
    expect(debugElement).toBeTruthy();

    // Extracting mock.
    const directive = MockHelper.getDirective(
      debugElement,
      MockDirective(CustomNgForWithOfDirective),
    );
    expect(directive).toBeTruthy();
    if (!directive) {
      return;
    }

    // Assert that mock got right variables.
    expect(directive.setItems).toEqual([
      'string1',
      'string2',
      'string3',
    ]);

    // Now we want to assert how our html is rendered based on structural directive variables' definition.
    directive.__render('MainValue', {
      myFirst: true,
      myIndex: 'MyIndex',
      myLast: false,
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toEqual('w/ MainValueMyIndex10');

    // And we want dynamically change variables for render.
    directive.__render('MainValue2', {
      myFirst: false,
      myIndex: 'MyIndex2',
      myLast: true,
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toEqual('w/ MainValue2MyIndex201');
  });

  it('mocks customNgForWithoutOf properly', () => {
    const fixture = MockRender(`
        <div data-type="customNgForWithoutOf"
          *customNgForWithoutOf="values; let v; let i = myIndex; let f = myFirst; let l = myLast;"
        >
          w/o {{v}}{{i}}{{f ? 1 : 0}}{{l ? 1 : 0}}
        </div>
      `, {
      values: [
        'string1',
        'string2',
        'string3',
      ],
    });
    // By default mocked structural directives are rendered with undefined variables.
    expect(fixture.nativeElement.innerText).toEqual('w/o 00');

    const debugElement = fixture.debugElement.query(By.css('div'));
    expect(debugElement).toBeTruthy();

    // Extracting mock.
    const directive = MockHelper.getDirective(
      debugElement,
      MockDirective(CustomNgForWithoutOfDirective),
    );
    expect(directive).toBeTruthy();
    if (!directive) {
      return;
    }

    // Assert that mock got right variables.
    expect(directive.setItems).toEqual([
      'string1',
      'string2',
      'string3',
    ]);

    // Now we want to assert how our html is rendered based on structural directive variables' definition.
    directive.__render('MainValue', {
      myFirst: true,
      myIndex: 'MyIndex',
      myLast: false,
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toEqual('w/o MainValueMyIndex10');

    // And we want dynamically change variables for render.
    directive.__render('MainValue2', {
      myFirst: false,
      myIndex: 'MyIndex2',
      myLast: true,
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toEqual('w/o MainValue2MyIndex201');
  });

  it('searches for related directive', () => {
    let debugElement: DebugElement | undefined;
    let mockedDirective: MockedDirective<CustomNgForWithoutOfDirective> | undefined;

    const fixture = MockRender(`
        <div data-type="node-1"
          *customNgForWithoutOf="values1; let v; let i = myIndex; let f = myFirst; let l = myLast;"
        >
          w/o {{v}}{{i}}{{f ? 1 : 0}}{{l ? 1 : 0}}
        </div>
        <div data-type="node-2"
          *customNgForWithoutOf="values2; let v; let i = myIndex; let f = myFirst; let l = myLast;"
        >
          w/o {{v}}{{i}}{{f ? 1 : 0}}{{l ? 1 : 0}}
        </div>
      `, {
      values1: [
        'string1',
        'string2',
        'string3',
      ],
      values2: [
        'string4',
        'string5',
        'string6',
      ],
    });

    // Looking for first directive.
    debugElement = fixture.debugElement.query(By.css('[data-type="node-1"]'));
    mockedDirective = MockHelper.getDirective(
      debugElement,
      MockDirective(CustomNgForWithoutOfDirective),
    );
    expect(mockedDirective).toBeTruthy();
    if (mockedDirective) {
      expect(mockedDirective.setItems).toEqual([
        'string1',
        'string2',
        'string3',
      ]);
    }

    // Looking for second directive.
    debugElement = fixture.debugElement.query(By.css('[data-type="node-2"]'));
    mockedDirective = MockHelper.getDirective(
      debugElement,
      MockDirective(CustomNgForWithoutOfDirective),
    );
    expect(mockedDirective).toBeTruthy();
    if (mockedDirective) {
      expect(mockedDirective.setItems).toEqual([
        'string4',
        'string5',
        'string6',
      ]);
    }
  });
});
