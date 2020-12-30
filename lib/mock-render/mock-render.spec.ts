import { DOCUMENT } from '@angular/common';
import { DebugElement, DebugNode, EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

import { ngMocks } from '../mock-helper/mock-helper';
import { MockService } from '../mock-service/mock-service';

import { MockRender } from './mock-render';
import {
  EmptyComponent,
  RenderRealComponent,
  WithoutSelectorComponent,
} from './mock-render.spec.fixtures';
import {
  MockedComponentFixture,
  MockedDebugElement,
  MockedDebugNode,
} from './types';

describe('MockRender', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        RenderRealComponent,
        WithoutSelectorComponent,
        EmptyComponent,
      ],
    });
  });

  it('respects no inputs and outputs', () => {
    const fixture = MockRender(EmptyComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<empty>empty</empty>',
    );
  });

  it('respects observables', () => {
    const click = new Subject();
    const fixture = MockRender(RenderRealComponent, { click });
    let actual: any;
    click.subscribe(value => (actual = value));
    ngMocks.output(fixture.point, 'click').emit(true);
    click.complete();
    expect(actual).toEqual(true);
  });

  it('respects getters, setters and methods', () => {
    const fixture = MockRender(RenderRealComponent);
    fixture.componentInstance.nameProp = 'test';
    expect(fixture.point.componentInstance.nameProp).toEqual('test');
    expect(fixture.point.componentInstance.name()).toEqual('test');
    fixture.point.componentInstance.nameProp = '';
    expect(fixture.componentInstance.nameProp).toEqual('');
    expect(fixture.componentInstance.name()).toEqual('');
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
      },
    );
    expect(fixture).toBeTruthy();

    // Asserting inputs.
    expect(
      fixture.nativeElement.innerText.replace(/\s+/gim, ' ').trim(),
    ).toEqual(`before injected content after`);

    // Asserting dynamic changes on inputs.
    fixture.componentInstance.mockContent = 'dynamic content';
    fixture.detectChanges();
    expect(
      fixture.nativeElement.innerText.replace(/\s+/gim, ' ').trim(),
    ).toEqual(`before dynamic content after`);

    // Asserting outputs.
    const spanElement = fixture.debugElement.query(
      By.css('render-real-component span'),
    );
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
      false,
    );
    expect(fixture.nativeElement.innerText).not.toContain(
      'injected content',
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toContain(
      'injected content',
    );
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
      `<render-real-component></render-real-component>`,
    );
    // because template can include more than 1 component, be wrapped by any html element etc.
    expect(fixture.point).toBeDefined();
    expect(fixture.point.componentInstance).toEqual(
      jasmine.any(RenderRealComponent),
    );
  });

  it('returns pointer with a provided component', () => {
    const fixture = MockRender(RenderRealComponent);
    expect(fixture.point.componentInstance).toEqual(
      jasmine.any(RenderRealComponent),
    );
  });

  it('returns pointer with a provided component', () => {
    const mock = MockService(document);
    spyOn(mock, 'getElementById');
    MockRender(
      RenderRealComponent,
      {},
      {
        providers: [
          {
            provide: DOCUMENT,
            useValue: mock,
          },
        ],
      },
    );
    expect(mock.getElementById).toHaveBeenCalledWith('test');
  });

  it('does render a component without selector', () => {
    const fixture = MockRender(WithoutSelectorComponent);
    expect(fixture.nativeElement.innerHTML).toContain(
      'WithoutSelectorComponent',
    );
  });

  it('renders empty templates w/o point', () => {
    const fixture = MockRender('');
    expect(fixture.point).toBeUndefined();
  });

  it('assigns outputs to a literals', () => {
    const fixture = MockRender(RenderRealComponent, {
      click: undefined,
    });

    const expected = {
      value: Math.random(),
    };
    ngMocks
      .find(fixture.debugElement, 'span')
      .triggerEventHandler('click', expected);
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
    fixture.componentInstance.click
      .pipe(first())
      .subscribe(value => (actual = value));
    ngMocks
      .find(fixture.debugElement, 'span')
      .triggerEventHandler('click', expected);
    expect(actual).toEqual(expected);
  });

  it('assigns DebugNodes and DebugElements to Mocks and back', () => {
    const debugNode = ({} as any) as DebugNode;
    const debugElement = ({} as any) as DebugElement;
    const mockDebugNode = ({} as any) as MockedDebugNode<string>;
    const mockDebugElement = ({} as any) as MockedDebugElement<string>;

    const debugNodeToMockedDebugNode: MockedDebugNode = debugNode;
    const debugElementToMockedDebugElement: MockedDebugElement = debugElement;
    const mockedDebugNodeToDebugNode: DebugNode = mockDebugNode;
    const mockedDebugElementToDebugElement: DebugElement = mockDebugElement;

    const valueNode: string = mockDebugNode.componentInstance;
    const valueElement: string = mockDebugElement.componentInstance;

    expect(debugNodeToMockedDebugNode).toBeDefined();
    expect(debugElementToMockedDebugElement).toBeDefined();
    expect(mockedDebugNodeToDebugNode).toBeDefined();
    expect(mockedDebugElementToDebugElement).toBeDefined();
    expect(valueNode).toBeUndefined();
    expect(valueElement).toBeUndefined();
  });
});
