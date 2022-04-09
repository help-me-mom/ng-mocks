import {
  Directive,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { By } from '@angular/platform-browser';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[myDirective]',
})
class MyDirective {
  @Input() public readonly value: string | null = null;
  @Output() public readonly valueChange = new EventEmitter<void>();
}

// @see https://github.com/ike18t/ng-mocks/issues/298
describe('issue-298', () => {
  beforeEach(() => MockBuilder(MyDirective));

  describe('ngMocks.find', () => {
    it('handles undefined as element', () => {
      const fixture = MockRender(`
      <div class="p1"><span myDirective value="d1"></span></div>
      <div class="p2"><span myDirective value="d2"></span></div>
    `);

      const instance1 = ngMocks.find(
        fixture.debugElement.query(By.css('.p1')),
        MyDirective,
      );
      const instance2 = ngMocks.find(
        fixture.debugElement.query(By.css('.p2')),
        MyDirective,
      );
      expect(() =>
        ngMocks.find(
          fixture.debugElement.query(By.css('.p3')),
          MyDirective,
        ),
      ).toThrowError(
        'Cannot find an element via ngMocks.find(MyDirective)',
      );
      const instance3 = ngMocks.find(
        fixture.debugElement.query(By.css('.p3')),
        MyDirective,
        undefined,
      );

      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
      expect(instance1).not.toBe(instance2);
      expect(instance3).toBeUndefined();
    });
  });

  describe('ngMocks.findAll', () => {
    it('handles undefined as element', () => {
      const fixture = MockRender(`
      <div class="p1"><span myDirective value="d1"></span></div>
      <div class="p2"><span myDirective value="d2"></span></div>
    `);

      const instances1 = ngMocks.findAll(
        fixture.debugElement.query(By.css('.p1')),
        MyDirective,
      );
      const instances2 = ngMocks.findAll(
        fixture.debugElement.query(By.css('.p2')),
        MyDirective,
      );
      const instances3 = ngMocks.findAll(
        fixture.debugElement.query(By.css('.p3')),
        MyDirective,
      );

      expect(instances1.length).toEqual(1);
      expect(instances2.length).toEqual(1);
      expect(instances3.length).toEqual(0);
    });
  });

  describe('ngMocks.findInstance', () => {
    it('handles undefined as element', () => {
      const fixture = MockRender(`
      <div class="p1"><span myDirective value="d1"></span></div>
      <div class="p2"><span myDirective value="d2"></span></div>
    `);

      const instance1 = ngMocks.findInstance(
        fixture.debugElement.query(By.css('.p1')),
        MyDirective,
      );
      const instance2 = ngMocks.findInstance(
        fixture.debugElement.query(By.css('.p2')),
        MyDirective,
      );
      expect(() =>
        ngMocks.findInstance(
          fixture.debugElement.query(By.css('.p3')),
          MyDirective,
        ),
      ).toThrowError(
        'Cannot find an instance via ngMocks.findInstance(MyDirective)',
      );
      const instance3 = ngMocks.findInstance(
        fixture.debugElement.query(By.css('.p3')),
        MyDirective,
        undefined,
      );

      expect(instance1.value).toEqual('d1');
      expect(instance2.value).toEqual('d2');
      expect(instance1).not.toBe(instance2);
      expect(instance3).toBeUndefined();
    });
  });

  describe('ngMocks.findInstances', () => {
    it('handles undefined as element', () => {
      const fixture = MockRender(`
      <div class="p1"><span myDirective value="d1"></span></div>
      <div class="p2"><span myDirective value="d2"></span></div>
    `);

      const instances1 = ngMocks.findInstances(
        fixture.debugElement.query(By.css('.p1')),
        MyDirective,
      );
      const instances2 = ngMocks.findInstances(
        fixture.debugElement.query(By.css('.p2')),
        MyDirective,
      );
      const instances3 = ngMocks.findInstances(
        fixture.debugElement.query(By.css('.p3')),
        MyDirective,
      );

      expect(instances1.length).toEqual(1);
      expect(instances1[0].value).toEqual('d1');
      expect(instances2.length).toEqual(1);
      expect(instances2[0].value).toEqual('d2');
      expect(instances3.length).toEqual(0);
    });
  });

  describe('ngMocks.findTemplateRef', () => {
    it('handles undefined as element', () => {
      const fixture = MockRender(`
      <div class="p1"><ng-template myDirective value="d1"></ng-template></div>
      <div class="p2"><ng-template myDirective value="d2"></ng-template></div>
    `);

      const instance1 = ngMocks.findTemplateRef(
        fixture.debugElement.query(By.css('.p1')),
        MyDirective,
      );
      const instance2 = ngMocks.findTemplateRef(
        fixture.debugElement.query(By.css('.p2')),
        MyDirective,
      );
      expect(() =>
        ngMocks.findTemplateRef(
          fixture.debugElement.query(By.css('.p3')),
          MyDirective,
        ),
      ).toThrowError(
        'Cannot find a TemplateRef via ngMocks.findTemplateRef(MyDirective)',
      );
      const instance3 = ngMocks.findTemplateRef(
        fixture.debugElement.query(By.css('.p3')),
        MyDirective,
        undefined,
      );

      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
      expect(instance1).not.toBe(instance2);
      expect(instance3).toBeUndefined();
    });
  });

  describe('ngMocks.findTemplateRefs', () => {
    it('handles undefined as element', () => {
      const fixture = MockRender(`
      <div class="p1"><ng-template myDirective value="d1"></ng-template></div>
      <div class="p2"><ng-template myDirective value="d2"></ng-template></div>
    `);

      const instances1 = ngMocks.findTemplateRefs(
        fixture.debugElement.query(By.css('.p1')),
        MyDirective,
      );
      const instances2 = ngMocks.findTemplateRefs(
        fixture.debugElement.query(By.css('.p2')),
        MyDirective,
      );
      const instances3 = ngMocks.findTemplateRefs(
        fixture.debugElement.query(By.css('.p3')),
        MyDirective,
      );

      expect(instances1.length).toEqual(1);
      expect(instances2.length).toEqual(1);
      expect(instances3.length).toEqual(0);
    });
  });

  describe('ngMocks.get', () => {
    it('handles undefined as element', () => {
      const fixture = MockRender(`
      <div class="p1"><span myDirective value="d1"></span></div>
      <div class="p2"><span myDirective value="d2"></span></div>
    `);

      const instance1 = ngMocks.get(
        fixture.debugElement.query(By.css('.p1 span')),
        MyDirective,
      );
      const instance2 = ngMocks.get(
        fixture.debugElement.query(By.css('.p2 span')),
        MyDirective,
      );
      expect(() =>
        ngMocks.get(
          fixture.debugElement.query(By.css('.p3 span')),
          MyDirective,
        ),
      ).toThrowError(
        'Cannot find MyDirective instance via ngMocks.get',
      );
      const instance3 = ngMocks.get(
        fixture.debugElement.query(By.css('.p3 span')),
        MyDirective,
        undefined,
      );

      expect(instance1.value).toEqual('d1');
      expect(instance2.value).toEqual('d2');
      expect(instance1).not.toBe(instance2);
      expect(instance3).toBeUndefined();
    });
  });

  describe('ngMocks.input', () => {
    it('handles undefined as element', () => {
      const fixture = MockRender(`
      <div class="p1"><span myDirective value="d1"></span></div>
      <div class="p2"><span myDirective value="d2"></span></div>
    `);

      const value1 = ngMocks.input(
        fixture.debugElement.query(By.css('.p1 span')),
        'value',
      );
      const value2 = ngMocks.input(
        fixture.debugElement.query(By.css('.p2 span')),
        'value',
      );
      expect(() =>
        ngMocks.input(
          fixture.debugElement.query(By.css('.p3 span')),
          'value',
        ),
      ).toThrowError('Cannot find value input via ngMocks.input');
      const value3 = ngMocks.input(
        fixture.debugElement.query(By.css('.p3 span')),
        'value',
        undefined,
      );

      expect(value1).toEqual('d1');
      expect(value2).toEqual('d2');
      expect(value3).toBeUndefined();
    });
  });

  describe('ngMocks.output', () => {
    it('handles undefined as element', () => {
      const fixture = MockRender(`
      <div class="p1"><span myDirective (valueChange)="d1 = $event"></span></div>
      <div class="p2"><span myDirective (valueChange)="d2 = $event"></span></div>
    `);

      const value1 = ngMocks.output(
        fixture.debugElement.query(By.css('.p1 span')),
        'valueChange',
      );
      const value2 = ngMocks.output(
        fixture.debugElement.query(By.css('.p2 span')),
        'valueChange',
      );
      expect(() =>
        ngMocks.output(
          fixture.debugElement.query(By.css('.p3 span')),
          'valueChange',
        ),
      ).toThrowError(
        'Cannot find valueChange output via ngMocks.output',
      );
      const value3 = ngMocks.output(
        fixture.debugElement.query(By.css('.p3 span')),
        'valueChange',
        undefined,
      );

      expect(value1).toBeDefined();
      expect(value2).toBeDefined();
      expect(value3).toBeUndefined();
    });
  });
});
