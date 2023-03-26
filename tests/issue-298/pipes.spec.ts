import { Component, Pipe, PipeTransform } from '@angular/core';
import { By } from '@angular/platform-browser';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Pipe({
  name: 'pipe',
  pure: false,
})
class MyPipe implements PipeTransform {
  public lastValue: any;

  public transform(value: any): any {
    this.lastValue = value;

    return value;
  }
}

@Component({
  selector: 'app',
  template: `
    <div class="p1">{{ 'd1' | pipe }}</div>
    <div class="p2">{{ 'd2' | pipe }}</div>
    <div class="p3">{{ 'd3' | pipe }}</div>
  `,
})
class AppComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/298
describe('issue-298:pipes', () => {
  beforeEach(() => MockBuilder(AppComponent).keep(MyPipe));

  it('handles pipes via findInstance', () => {
    const fixture = MockRender(AppComponent);

    const instance1 = ngMocks.findInstance(
      fixture.debugElement.query(By.css('.p1')),
      MyPipe,
    );
    const instance2 = ngMocks.findInstance(
      fixture.debugElement.query(By.css('.p2')),
      MyPipe,
    );
    const instance3 = ngMocks.findInstance(
      fixture.debugElement.query(By.css('.p3')),
      MyPipe,
    );

    expect(instance1).toBeDefined();
    expect(instance2).toBeDefined();
    expect(instance3).toBeDefined();
    expect(instance1).not.toBe(instance2);
    expect(instance1).not.toBe(instance3);
    expect(instance2).not.toBe(instance3);
    expect(instance1.lastValue).toEqual('d1');
    expect(instance2.lastValue).toEqual('d2');
    expect(instance3.lastValue).toEqual('d3');
  });

  it('handles pipes via findInstances', () => {
    const fixture = MockRender(AppComponent);

    const instances1 = ngMocks.findInstances(
      fixture.debugElement.query(By.css('.p1')),
      MyPipe,
    );
    const instances2 = ngMocks.findInstances(
      fixture.debugElement.query(By.css('.p2')),
      MyPipe,
    );
    const instances3 = ngMocks.findInstances(
      fixture.debugElement.query(By.css('.p3')),
      MyPipe,
    );

    expect(instances1.length).toEqual(1);
    expect(instances2.length).toEqual(1);
    expect(instances3.length).toEqual(1);
    expect(instances1[0].lastValue).toEqual('d1');
    expect(instances2[0].lastValue).toEqual('d2');
    expect(instances3[0].lastValue).toEqual('d3');
  });
});
