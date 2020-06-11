import { DOCUMENT } from '@angular/common';
import { DebugElement, DebugNode, EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { first } from 'rxjs/operators';

import { ngMocks } from '../mock-helper';
import { MockService } from '../mock-service';

import { MockedComponentFixture, MockedDebugElement, MockedDebugNode, MockRender } from './mock-render';
import { RenderRealComponent, WithoutSelectorComponent } from './mock-render.fixtures';

describe('MockRender', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RenderRealComponent, WithoutSelectorComponent],
    });
  });

  it('renders any template and respects dynamic params', () => {
    const spy = jasmine.createSpy('mockClick');
    const assertPayload = {
      magic: Math.random(),
    };

    // Rendering custom template.
    const fixture = MockRender(
      `
        before
        <render-real-component (click)="mockClick($event)" [content]="mockContent"></render-real-component>
        after
      `,
      {
        mockClick: spy,
        mockContent: 'injected content',
      }
    );
    expect(fixture).toBeTruthy();

    // Asserting inputs.
    expect(fixture.nativeElement.innerText).toEqual(`before injected content after`);

    // Asserting dynamic changes on inputs.
    fixture.componentInstance.mockContent = 'dynamic content';
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toEqual(`before dynamic content after`);

    // Asserting outputs.
    const spanElement = fixture.debugElement.query(By.css('render-real-component span'));
    expect(spanElement).toBeTruthy();
    spanElement.triggerEventHandler('click', assertPayload);
    expect(spy).toHaveBeenCalledWith(assertPayload);
  });

  it('does not detect changes on fixture if detectChanges arg is false', () => {
    const fixture = MockRender(
      `
        before
        <render-real-component [content]="mockContent"></render-real-component>
        after
      `,
      {
        mockContent: 'injected content',
      },
      false
    );
    expect(fixture.debugElement.nativeElement.innerText).not.toContain('injected content');
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.innerText).toContain('injected content');
  });

  it('binds inputs and outputs with a provided component', () => {
    const spy = jasmine.createSpy('click');
    const fixture = MockRender(RenderRealComponent, {
      click: spy,
      content: 'content',
    });
    expect(spy).not.toHaveBeenCalled();
    const payload = {
      value: 'my very random string',
    };
    fixture.point.componentInstance.click.emit(payload);
    expect(spy).toHaveBeenCalledWith(payload);
  });

  it('returns a pointer with a provided template', () => {
    const fixture: MockedComponentFixture<RenderRealComponent> = MockRender(
      `<render-real-component></render-real-component>`
    );
    // because template can include more than 1 component, be wrapped by any html element etc.
    expect(fixture.point).toBeDefined();
    expect(fixture.point.componentInstance).toEqual(jasmine.any(RenderRealComponent));
  });

  it('returns pointer with a provided component', () => {
    const fixture = MockRender(RenderRealComponent);
    expect(fixture.point.componentInstance).toEqual(jasmine.any(RenderRealComponent));
  });

  it('returns pointer with a provided component', () => {
    const document = MockService(Document);
    spyOn(document, 'getElementById');
    MockRender(
      RenderRealComponent,
      {},
      {
        providers: [
          {
            provide: DOCUMENT,
            useValue: document,
          },
        ],
      }
    );
    expect(document.getElementById).toHaveBeenCalledWith('test');
  });

  it('does not render a component without selector', () => {
    const fixture = MockRender(WithoutSelectorComponent);
    expect(fixture.debugElement.nativeElement.innerHTML).toEqual('');
  });

  it('assigns outputs to a literals', () => {
    const fixture = MockRender(RenderRealComponent, {
      click: undefined,
    });

    const expected = {
      value: Math.random(),
    };
    ngMocks.find(fixture.debugElement, 'span').triggerEventHandler('click', expected);
    expect(fixture.componentInstance.click as any).toEqual(expected);
  });

  it('assigns outputs to an EventEmitter', () => {
    const fixture = MockRender(RenderRealComponent, {
      click: new EventEmitter(),
    });

    const expected = {
      value: Math.random(),
    };
    let actual: any;
    fixture.componentInstance.click.pipe(first()).subscribe(value => (actual = value));
    ngMocks.find(fixture.debugElement, 'span').triggerEventHandler('click', expected);
    expect(actual).toEqual(expected);
  });

  it('assigns DebugNodes and DebugElements to Mocks and back', () => {
    const debugNode = ({} as any) as DebugNode;
    const debugElement = ({} as any) as DebugElement;
    const mockedDebugNode = ({} as any) as MockedDebugNode<string>;
    const mockedDebugElement = ({} as any) as MockedDebugElement<string>;

    const debugNodeToMockedDebugNode: MockedDebugNode = debugNode;
    const debugElementToMockedDebugElement: MockedDebugElement = debugElement;
    const mockedDebugNodeToDebugNode: DebugNode = mockedDebugNode;
    const mockedDebugElementToDebugElement: DebugElement = mockedDebugElement;

    const valueNode: string = mockedDebugNode.componentInstance;
    const valueElement: string = mockedDebugElement.componentInstance;

    expect(debugNodeToMockedDebugNode).toBeDefined();
    expect(debugElementToMockedDebugElement).toBeDefined();
    expect(mockedDebugNodeToDebugNode).toBeDefined();
    expect(mockedDebugElementToDebugElement).toBeDefined();
    expect(valueNode).toBeUndefined();
    expect(valueElement).toBeUndefined();
  });
});
