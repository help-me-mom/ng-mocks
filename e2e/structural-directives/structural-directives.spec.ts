import { DebugNode } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockDirective } from '../../lib/mock-directive';
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

    // every value should be rendered correctly.
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithOf"> w/ string1010 </div>');
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithOf"> w/ string2100 </div>');
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithOf"> w/ string3201 </div>');
  });

  it('renders customNgForWithoutOf properly', () => {
    // should iterate against 3 string.
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

    // every value should be rendered correctly.
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithoutOf"> w/o string1010 </div>');
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithoutOf"> w/o string2100 </div>');
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithoutOf"> w/o string3201 </div>');
  });

  it('renders customNgIf properly', () => {
    // should display just first part.
    const fixture = MockRender(`
        <div data-type="customNgIfTrue" *customNgIf="values">
          should be shown
        </div>
        <div data-type="customNgIfFalse" *customNgIf="!values">
          should be hidden
        </div>
      `, {
      values: [
        'string1',
        'string2',
        'string3',
      ],
    });

    // only first div should be rendered.
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgIfTrue"> should be shown </div>');
    expect(fixture.nativeElement.innerHTML)
      .not.toContain('<div data-type="customNgIfFalse"> should be hidden </div>');
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

    // We're looking for related ng-template (DebugNode), not DebugElement.
    // I think we can try to obfuscate it with own logic to reduce amount of code.
    const debugNode = fixture.debugElement.queryAllNodes((element) => {
      try {
        element.injector.get(MockDirective(CustomNgIfDirective));
        return true;
      } catch (error) {
        return false;
      }
    }).shift() as DebugNode;
    expect(debugNode).toBeTruthy();

    // Extracting mock.
    const directive = debugNode.injector.get(MockDirective(CustomNgIfDirective)) as MockDirective<CustomNgIfDirective>;
    expect(directive).toBeTruthy();

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

    // We're looking for related ng-template (DebugNode), not DebugElement.
    // I think we can try to obfuscate it with own logic to reduce amount of code.
    const debugNode = fixture.debugElement.queryAllNodes((element) => {
      try {
        element.injector.get(MockDirective(CustomNgForWithOfDirective));
        return true;
      } catch (error) {
        return false;
      }
    }).shift() as DebugNode;
    expect(debugNode).toBeTruthy();

    // Extracting mock.
    const directive = debugNode.injector
      .get(MockDirective(CustomNgForWithOfDirective)) as MockDirective<CustomNgForWithOfDirective>;
    expect(directive).toBeTruthy();

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

    // We're looking for related ng-template (DebugNode), not DebugElement.
    // I think we can try to obfuscate it with own logic to reduce amount of code.
    const debugNode = fixture.debugElement.queryAllNodes((element) => {
      try {
        element.injector.get(MockDirective(CustomNgForWithoutOfDirective));
        return true;
      } catch (error) {
        return false;
      }
    }).shift() as DebugNode;
    expect(debugNode).toBeTruthy();

    // Extracting mock.
    const directive = debugNode.injector
      .get(MockDirective(CustomNgForWithoutOfDirective)) as MockDirective<CustomNgForWithoutOfDirective>;
    expect(directive).toBeTruthy();

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
});
