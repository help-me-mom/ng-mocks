import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { ngMocks } from 'ng-mocks';

@Pipe({
  name: 'nothing',
  pure: false,
})
class NothingPipe implements PipeTransform {
  transform<T>(value: T): T {
    return value;
  }
}

@Component({
  selector: 'target-2314',
  template: `
    <div
      class="array"
      *ngFor="
        let item of array$ | nothing | async | nothing | nothing
      "
    >
      item: {{ item }}
    </div>
    <div
      class="false"
      *ngIf="false$ | nothing | async | nothing | nothing"
    >
      false
    </div>
    <div class="text">
      {{ text$ | nothing | async | nothing | nothing }}
    </div>
    <div
      class="true"
      *ngIf="true$ | nothing | async | nothing | nothing"
    >
      true
    </div>
  `,
})
export class TargetComponent {
  public array$ = new BehaviorSubject([1]);
  public false$ = new BehaviorSubject(false);
  public text$ = new BehaviorSubject('text');
  public true$ = new BehaviorSubject(true);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/2314
describe('issue-2314', () => {
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(async () => {
    return TestBed.configureTestingModule({
      declarations: [TargetComponent, NothingPipe],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();
  });

  it(`finds all pipes`, () => {
    const allPipes = ngMocks.findInstances(AsyncPipe);
    expect(allPipes.length).toBe(4);
  });

  describe('ngMocks.findInstance', () => {
    it(`finds pipes on '.array'`, () => {
      const arrayPipe = ngMocks.findInstance(
        '.array',
        AsyncPipe,
        undefined,
      );
      expect(arrayPipe).toBeDefined();
    });

    it(`finds pipes on '.false'`, () => {
      // Because it isn't rendered, we cannot find the element with `.false`, therefore, we need to rely on NgIf itself.
      const ngIf = ngMocks.reveal(NgIf);
      const falsePipe = ngMocks.findInstance(
        ngIf,
        AsyncPipe,
        undefined,
      );
      expect(falsePipe).toBeDefined();
    });

    it(`find pipes on '.text'`, () => {
      const textPipe = ngMocks.findInstance(
        '.text',
        AsyncPipe,
        undefined,
      );
      expect(textPipe).toBeDefined();
    });

    it(`finds pipes on '.true'`, () => {
      const truePipe = ngMocks.findInstance(
        '.true',
        AsyncPipe,
        undefined,
      );
      expect(truePipe).toBeDefined();
    });
  });

  describe('ngMocks.findInstances', () => {
    it(`finds pipes on '.array'`, () => {
      const arrayPipe = ngMocks.findInstances('.array', AsyncPipe);
      expect(arrayPipe.length).toEqual(1);
    });

    it(`finds pipes on '.false'`, () => {
      // Because it isn't rendered, we cannot find the element with `.false`, therefore, we need to rely on NgIf itself.
      const ngIf = ngMocks.reveal(NgIf);
      const falsePipe = ngMocks.findInstances(ngIf, AsyncPipe);
      expect(falsePipe.length).toEqual(1);
    });

    it(`find pipes on '.text'`, () => {
      const textPipe = ngMocks.findInstances('.text', AsyncPipe);
      expect(textPipe.length).toEqual(1);
    });

    it(`finds pipes on '.true'`, () => {
      const truePipe = ngMocks.findInstances('.true', AsyncPipe);
      expect(truePipe.length).toEqual(1);
    });
  });

  describe('ngMocks.get', () => {
    it(`finds pipes on '.array'`, () => {
      const arrayPipe = ngMocks.get('.array', AsyncPipe, undefined);
      expect(arrayPipe).toBeDefined();
    });

    it(`finds pipes on '.false'`, () => {
      // Because it isn't rendered, we cannot find the element with `.false`, therefore, we need to rely on NgIf itself.
      const ngIf = ngMocks.reveal(NgIf);
      const falsePipe = ngMocks.get(ngIf, AsyncPipe, undefined);
      expect(falsePipe).toBeDefined();
    });

    it(`find pipes on '.text'`, () => {
      const textPipe = ngMocks.get('.text', AsyncPipe, undefined);
      expect(textPipe).toBeDefined();
    });

    it(`finds pipes on '.true'`, () => {
      const truePipe = ngMocks.get('.true', AsyncPipe, undefined);
      expect(truePipe).toBeDefined();
    });

    it(`returns default value when pipes are missing`, () => {
      const truePipe = ngMocks.get('.true', DatePipe, undefined);
      expect(truePipe).toBeUndefined();
    });
  });
});
