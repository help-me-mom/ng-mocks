// tslint:disable max-file-line-count

import {
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { isMockOf } from '../common/func.is-mock-of';
import { MockDirective } from '../mock-directive/mock-directive';
import { MockRender } from '../mock-render/mock-render';

import { ngMocks } from './mock-helper';

@Directive({
  exportAs: 'foo',
  selector: '[exampleDirective]',
})
export class ExampleDirective {
  @Input() public exampleDirective = '';
  @Output() public someOutput = new EventEmitter<boolean>();
  @Input('bah') public something = '';

  protected s: any;

  public performAction(s: string) {
    this.s = s;

    return this;
  }
}

@Directive({
  selector: '[exampleStructuralDirective]',
})
export class ExampleStructuralDirective {
  @Input() public exampleStructuralDirective = true;
}

@Component({
  selector: 'component-a',
  template: 'body-a',
})
export class AComponent {}

@Component({
  selector: 'component-b',
  template: 'body-b',
})
export class BComponent {}

describe('MockHelper:getDirective', () => {
  beforeEach(async () => {
    return TestBed.configureTestingModule({
      declarations: [
        MockDirective(ExampleDirective),
        MockDirective(ExampleStructuralDirective),
        AComponent,
        BComponent,
      ],
    }).compileComponents();
  });

  it('should return right attribute directive', () => {
    const fixture = MockRender(`
      <div exampleDirective></div>
    `);

    // Looking for original.
    const debugElement = fixture.debugElement.query(
      By.directive(ExampleDirective),
    );
    const element = debugElement.injector.get(ExampleDirective);

    // Using helper.
    const elementFromHelper = ngMocks.get(
      fixture.debugElement.query(By.css('div')),
      ExampleDirective,
    );

    // Verification.
    expect(elementFromHelper).toBe(element);
  });

  it('should return right structural directive via getDirective', () => {
    const fixture = MockRender(`
      <div id="example-structural-directive" *exampleStructuralDirective="false">hi</div>
    `);

    // we need to render mock structural directives manually
    for (const instance of ngMocks.findInstances(
      fixture.debugElement,
      ExampleStructuralDirective,
    )) {
      if (isMockOf(instance, ExampleStructuralDirective, 'd')) {
        instance.__render();
      }
    }
    fixture.detectChanges();

    // Using helper.
    const elementFromHelper = ngMocks.get(
      fixture.debugElement.query(By.css('div')),
      ExampleStructuralDirective,
    );
    expect(elementFromHelper).toBeTruthy();
    if (!elementFromHelper) {
      return;
    }

    // Verification.
    expect(elementFromHelper.exampleStructuralDirective).toEqual(
      false,
    );
  });

  it('should return right structural directive via getDirectiveOrFail', () => {
    const fixture = MockRender(`
      <div id="example-structural-directive" *exampleStructuralDirective="false">hi</div>
    `);

    // we need to render mock structural directives manually
    for (const instance of ngMocks.findInstances(
      fixture.debugElement,
      ExampleStructuralDirective,
    )) {
      if (isMockOf(instance, ExampleStructuralDirective, 'd')) {
        instance.__render();
      }
    }
    fixture.detectChanges();

    // Using helper.
    const elementFromHelper = ngMocks.get(
      fixture.debugElement.query(By.css('div')),
      ExampleStructuralDirective,
    );

    // Verification.
    expect(elementFromHelper.exampleStructuralDirective).toEqual(
      false,
    );
  });

  it('find selector: T', () => {
    const fixture = MockRender(`<component-a></component-a>`);
    const componentA = ngMocks.find(fixture.debugElement, AComponent);
    expect(componentA.componentInstance).toEqual(
      jasmine.any(AComponent),
    );

    expect(() => ngMocks.find(componentA, BComponent)).toThrowError(
      'Cannot find an element via ngMocks.find(BComponent)',
    );
  });

  it('find selector: string', () => {
    const fixture = MockRender(`<component-b></component-b>`);
    const componentB = ngMocks.find(
      fixture.debugElement,
      'component-b',
    );
    expect(componentB.componentInstance).toEqual(
      jasmine.any(BComponent),
    );

    expect(() => ngMocks.find(componentB, AComponent)).toThrowError(
      'Cannot find an element via ngMocks.find(AComponent)',
    );
  });

  it('find selector: T', () => {
    const fixture = MockRender(`<component-a></component-a>`);
    const componentA = ngMocks.find(fixture.debugElement, AComponent);
    expect(componentA.componentInstance).toEqual(
      jasmine.any(AComponent),
    );

    const componentB = ngMocks.find(
      fixture.debugElement,
      BComponent,
      null,
    );
    expect(componentB).toBe(null);
  });

  it('find selector: string', () => {
    const fixture = MockRender(`<component-b></component-b>`);
    const componentB = ngMocks.find(
      fixture.debugElement,
      'component-b',
    );
    expect(componentB.componentInstance).toEqual(
      jasmine.any(BComponent),
    );

    const componentA = ngMocks.find(
      fixture.debugElement,
      'component-a',
      null,
    );
    expect(componentA).toBe(null);
  });

  it('find selector: missed string', () => {
    const fixture = MockRender(`<component-b></component-b>`);
    expect(() =>
      ngMocks.find(fixture.debugElement, 'component-a'),
    ).toThrowError(/Cannot find an element/);
  });

  it('findAll selector: T', () => {
    const fixture = MockRender(
      `<component-a></component-a><component-a></component-a>`,
    );
    const componentA = ngMocks.findAll(fixture, AComponent);
    expect(componentA.length).toBe(2);
    expect(componentA[0].componentInstance).toEqual(
      jasmine.any(AComponent),
    );
    expect(componentA[1].componentInstance).toEqual(
      jasmine.any(AComponent),
    );

    const componentB = ngMocks.findAll(
      fixture.debugElement,
      BComponent,
    );
    expect(componentB.length).toBe(0);
  });

  it('findAll selector: string', () => {
    const fixture = MockRender(
      `<component-b></component-b><component-b></component-b>`,
    );
    const componentB = ngMocks.findAll(fixture, 'component-b');
    expect(componentB.length).toEqual(2);
    expect(componentB[0].componentInstance).toEqual(
      jasmine.any(BComponent),
    );
    expect(componentB[0].componentInstance).toEqual(
      jasmine.any(BComponent),
    );

    const componentA = ngMocks.findAll(
      fixture.debugElement,
      'component-a',
    );
    expect(componentA.length).toBe(0);
  });

  it('findInstance throws an error', () => {
    const fixture = MockRender(`<component-a></component-a>`);
    expect(() =>
      ngMocks.findInstance(fixture.debugElement, BComponent),
    ).toThrowError(
      /Cannot find an instance via ngMocks.findInstance\(BComponent\)/,
    );
  });

  it('findInstance returns default value', () => {
    const fixture = MockRender(`<component-a></component-a>`);
    const instance = ngMocks.findInstance(
      fixture.debugElement,
      BComponent,
      undefined,
    );
    expect(instance).toBeUndefined();
  });

  it('input returns emitter', () => {
    const fixture = MockRender(`<div exampleDirective="5"></div>`);

    const node = ngMocks.find(fixture.debugElement, 'div');
    const input = ngMocks.input(node, 'exampleDirective');
    expect(input).toEqual('5');
  });

  it('input returns default value', () => {
    const fixture = MockRender(`<div exampleDirective="5"></div>`);

    const node = ngMocks.find(fixture.debugElement, 'div');
    const input = ngMocks.input(node, 'default', undefined);
    expect(input).toBeUndefined();
  });

  it('input throws', () => {
    const fixture = MockRender(`<div></div>`);
    const node = ngMocks.find(fixture.debugElement, 'div');
    expect(() => ngMocks.input(node, 'default')).toThrowError(
      /Cannot find default input/,
    );
  });

  it('output returns emitter', () => {
    const spy = jasmine.createSpy('someOutput');
    const fixture = MockRender(
      `<div (someOutput)="spy($event)" exampleDirective></div>`,
      {
        spy,
      },
    );

    const node = ngMocks.find(fixture.debugElement, 'div');
    const output = ngMocks.output(node, 'someOutput');
    output.emit(true);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('output returns default value', () => {
    const spy = jasmine.createSpy('someOutput');
    const fixture = MockRender(
      `<div (someOutput)="spy($event)" exampleDirective></div>`,
      {
        spy,
      },
    );

    const node = ngMocks.find(fixture.debugElement, 'div');
    const output = ngMocks.output(node, 'default', undefined);
    expect(output).toBeUndefined();
  });

  it('output throws', () => {
    const fixture = MockRender(`<div></div>`);
    const node = ngMocks.find(fixture.debugElement, 'div');
    expect(() => ngMocks.output(node, 'default')).toThrowError(
      /Cannot find default output/,
    );
  });

  it('get returns default value', () => {
    const fixture = MockRender('<div></div>');
    const actual = ngMocks.get(
      fixture.debugElement,
      ExampleDirective,
      undefined,
    );
    expect(actual).toBeUndefined();
  });

  it('get throws an error', () => {
    const fixture = MockRender('<div></div>');
    expect(() =>
      ngMocks.get(fixture.debugElement, ExampleDirective),
    ).toThrowError(/Cannot find ExampleDirective/);
  });
});
