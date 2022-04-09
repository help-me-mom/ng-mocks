import { Directive, Input } from '@angular/core';
import { By } from '@angular/platform-browser';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[myDirective]',
})
class MyDirective {
  @Input() public readonly value: string | null = null;
}

// @see https://github.com/ike18t/ng-mocks/issues/298
describe('issue-298:case', () => {
  beforeEach(() => MockBuilder(MyDirective));

  describe('ngMocks.findInstance', () => {
    it('handles undefined as element', () => {
      const fixture = MockRender(`
      <div class="p1"><span myDirective value="d1"></span></div>
      <div class="p2"><span myDirective value="d2"></span></div>
      <div class="p3"><span myDirective value="d3"></span></div>
    `);

      const instance1 = ngMocks.findInstance(
        fixture.debugElement.query(By.css('.p1')),
        MyDirective,
      );
      const instance2 = ngMocks.findInstance(
        fixture.debugElement.query(By.css('.p2')),
        MyDirective,
      );
      const instance3 = ngMocks.findInstance(
        fixture.debugElement.query(By.css('.p3')),
        MyDirective,
      );

      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
      expect(instance3).toBeDefined();
      expect(instance1).not.toBe(instance2);
      expect(instance1).not.toBe(instance3);
      expect(instance2).not.toBe(instance3);
      expect(instance1.value).toEqual('d1');
      expect(instance2.value).toEqual('d2');
      expect(instance3.value).toEqual('d3');
    });
  });

  describe('ngMocks.findInstance', () => {
    it('handles undefined as element', () => {
      const fixture = MockRender(`
      <div class="p1"><span myDirective value="d1"></span></div>
      <div class="p2"><span myDirective value="d2"></span></div>
      <div class="p3"><span myDirective value="d3"></span></div>
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
      expect(instances2.length).toEqual(1);
      expect(instances3.length).toEqual(1);
      expect(instances1[0].value).toEqual('d1');
      expect(instances2[0].value).toEqual('d2');
      expect(instances3[0].value).toEqual('d3');
    });
  });
});
