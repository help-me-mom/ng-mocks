import { TestBed } from '@angular/core/testing';
import { MockRender } from '../../lib/mock-render';
import { CustomNgForWithOfDirective } from './custom-ng-for-with-of.directive';
import { CustomNgForWithoutOfDirective } from './custom-ng-for-without-of.directive';
import { CustomNgIfDirective } from './custom-ng-if.directive';

describe('structural-directive-as-ng-for', () => {

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
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithOf"> w/ string1010 </div>');
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithOf"> w/ string2100 </div>');
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithOf"> w/ string3201 </div>');
  });

  it('renders customNgForWithoutOf properly', () => {
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
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithoutOf"> w/o string1010 </div>');
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithoutOf"> w/o string2100 </div>');
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgForWithoutOf"> w/o string3201 </div>');
  });

  it('renders customNgIf properly', () => {
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
    expect(fixture.nativeElement.innerHTML)
      .toContain('<div data-type="customNgIfTrue"> should be shown </div>');
    expect(fixture.nativeElement.innerHTML)
      .not.toContain('<div data-type="customNgIfFalse"> should be hidden </div>');
  });
});

// fdescribe('structural-directive-as-ng-for fixtures are mocked as they should', () => {
//
//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             declarations: [
//                 MockDirective(CustomNgForWithOfDirective),
//                 MockDirective(CustomNgForWithoutOfDirective),
//                 MockDirective(CustomNgIfDirective),
//                 StructuralDirectiveConsumerComponent,
//             ],
//         });
//     });
//
//     it('provides way to fetch information of structural directive', () => {
//         const fixture = MockRender(`
//             <structural-directive-consumer-component></structural-directive-consumer-component>
//         `);
//         console.log(fixture.nativeElement.innerHTML);
//
//         const debugElement = fixture.debugElement.query(By.css('[data-type="customNgIfTrue"]'));
//         expect(debugElement).toBeTruthy();
//         console.log(debugElement.nativeElement.outerHTML);
//
//         // ideally
//         // const element = debugElement.injector.get(MockDirective(ExampleStructuralDirective)); // tslint:disable-line
//         // expect(element.exampleStructuralDirective).toBe(true);
//
//         // acceptable :shrug:
//         // const data = debugElement.nativeElement.getAttribute('exampleStructuralDirective');
//         // expect(data.exampleStructuralDirective).toBe(true);
//
//         expect(1).toEqual(0);
//     });
// });
