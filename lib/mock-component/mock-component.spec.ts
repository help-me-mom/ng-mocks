import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockComponent } from './mock-component';
import { EmptyComponent } from './test-components/empty-component.component';
import { SimpleComponent } from './test-components/simple-component.component';

@Component({
  selector: 'example-component-container',
  template: `
    <simple-component [someInput]="\'hi\'"
                      [someOtherInput]="\'bye\'"
                      (someOutput1)="emitted = $event"
                      (someOutput2)="emitted = $event">
    </simple-component>
    <simple-component [someInput]="\'hi again\'" #f='seeimple'></simple-component>
    <empty-component></empty-component>
    <empty-component id="ng-content-component">doh</empty-component>
    <empty-component id="ngmodel-component" [(ngModel)]="someOutputHasEmitted"></empty-component>
  `
})
export class ExampleComponentContainer {
  emitted: string;
}

describe('MockComponent', () => {
  let component: ExampleComponentContainer;
  let fixture: ComponentFixture<ExampleComponentContainer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ExampleComponentContainer,
        MockComponent(EmptyComponent),
        MockComponent(SimpleComponent)
      ],
      imports: [
        FormsModule
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(ExampleComponentContainer);
      component = fixture.componentInstance;
    });
  }));

  it('should have use the original component\'s selector', () => {
    fixture.detectChanges();
    const mockedComponent = fixture.debugElement.query(By.css('simple-component'));
    expect(mockedComponent).not.toBeNull();
  });

  it('should have the input set on the mock component', () => {
    fixture.detectChanges();
    const mockedComponent = fixture.debugElement
                                   .query(By.directive(MockComponent(SimpleComponent)))
                                   .componentInstance;
    expect(mockedComponent.someInput).toEqual('hi');
    expect(mockedComponent.someInput2).toEqual('bye');
  });

  it('should trigger output bound behavior', () => {
    fixture.detectChanges();
    const mockedComponent = fixture.debugElement
                                   .query(By.directive(MockComponent(SimpleComponent)))
                                   .componentInstance;
    mockedComponent.someOutput1.emit('hi');
    expect(component.emitted).toEqual('hi');
  });

  it('should trigger output bound behavior for extended outputs', () => {
    fixture.detectChanges();
    const mockedComponent = fixture.debugElement
                                   .query(By.directive(MockComponent(SimpleComponent)))
                                   .componentInstance;
    mockedComponent.someOutput2.emit('hi');
    expect(component.emitted).toEqual('hi');
  });

  it('the mock should have an ng-content body', () => {
    fixture.detectChanges();
    const mockedComponent = fixture.debugElement.query(By.css('#ng-content-component'));
    expect(mockedComponent.nativeElement.innerText).toContain('doh');
  });

  it('should give each instance of a mocked component its own event emitter', () => {
    const mockedComponents = fixture.debugElement
                                    .queryAll(By.directive(MockComponent(SimpleComponent)));
    const mockedComponent1 = mockedComponents[0].componentInstance;
    const mockedComponent2 = mockedComponents[1].componentInstance;
    expect(mockedComponent1.someOutput1).not.toEqual(mockedComponent2.someOutput1);
  });

  it('should work with components w/o inputs or outputs', () => {
    const mockedComponent = fixture.debugElement
                                   .query(By.directive(MockComponent(EmptyComponent)));
    expect(mockedComponent).not.toBeNull();
  });

  it('should allow ngModel bindings', () => {
    const mockedComponent = fixture.debugElement.query(By.css('#ngmodel-component'));
    expect(mockedComponent).not.toBeNull();
  });

  it('should memoize the return value by argument', () => {
    expect(MockComponent(EmptyComponent)).toBe(MockComponent(EmptyComponent));
    expect(MockComponent(SimpleComponent)).toBe(MockComponent(SimpleComponent));
    expect(MockComponent(EmptyComponent)).not.toBe(MockComponent(SimpleComponent));
  });
});
