import { Component, DebugElement, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { MockComponent, MockComponents, MockedComponent } from './mock-component';
import { ChildComponent } from './test-components/child-component.component';
import { CustomFormControlComponent } from './test-components/custom-form-control.component';
import { EmptyComponent } from './test-components/empty-component.component';
import { SimpleComponent } from './test-components/simple-component.component';
import { TemplateOutletComponent } from './test-components/template-outlet.component';

@Component({
  selector: 'example-component-container',
  template: `
    <simple-component [someInput]="\'hi\'"
                      [someOtherInput]="\'bye\'"
                      [someInput3]=true
                      (someOutput1)="emitted = $event"
                      (someOutput2)="emitted = $event">
    </simple-component>
    <simple-component [someInput]="\'hi again\'" #f='seeimple'></simple-component>
    <empty-component></empty-component>
    <custom-form-control [formControl]="formControl"></custom-form-control>
    <empty-component id="ng-content-component">doh</empty-component>
    <empty-component id="ngmodel-component" [(ngModel)]="someOutputHasEmitted"></empty-component>
    <child-component></child-component>
    <template-outlet-component id="element-with-content-and-template">
      ng-content body header
      <ng-template #block1><div>block 1 body</div></ng-template>
      <ng-template #block2><span>block 2 body</span></ng-template>
      ng-content body footer
    </template-outlet-component>
    <empty-component id="element-without-content-and-template"></empty-component>
    <empty-component id="element-with-content-only">child of element-with-content-only</empty-component>
  `
})
export class ExampleComponentContainer {
  @ViewChild(ChildComponent) childComponent: ChildComponent;
  emitted: string;
  formControl = new FormControl('');

  performActionOnChild(s: string): void {
    this.childComponent.performAction(s);
  }
}

describe('MockComponent', () => {
  let component: ExampleComponentContainer;
  let fixture: ComponentFixture<ExampleComponentContainer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ExampleComponentContainer,
        MockComponents(EmptyComponent,
                       SimpleComponent,
                       TemplateOutletComponent,
                       ChildComponent,
                       CustomFormControlComponent),
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule
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
                                   .query(By.directive(SimpleComponent))
                                   .componentInstance;
    expect(mockedComponent.someInput).toEqual('hi');
    expect(mockedComponent.someInput2).toEqual('bye');
  });

  it('has no issues with multiple decorators on an input', () => {
    fixture.detectChanges();
    const mockedComponent = fixture.debugElement
                                   .query(By.directive(SimpleComponent));
    expect(mockedComponent.componentInstance.someInput3).toEqual(true);
  });

  it('should trigger output bound behavior', () => {
    fixture.detectChanges();
    const mockedComponent = fixture.debugElement
                                   .query(By.directive(SimpleComponent))
                                   .componentInstance;
    mockedComponent.someOutput1.emit('hi');
    expect(component.emitted).toEqual('hi');
  });

  it('should trigger output bound behavior for extended outputs', () => {
    fixture.detectChanges();
    const mockedComponent = fixture.debugElement
                                   .query(By.directive(SimpleComponent))
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
                                    .queryAll(By.directive(SimpleComponent));
    const mockedComponent1 = mockedComponents[0].componentInstance;
    const mockedComponent2 = mockedComponents[1].componentInstance;
    expect(mockedComponent1.someOutput1).not.toEqual(mockedComponent2.someOutput1);
  });

  it('should work with components w/o inputs or outputs', () => {
    const mockedComponent = fixture.debugElement
                                   .query(By.directive(EmptyComponent));
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

  it('should set ViewChild components correctly', () => {
    fixture.detectChanges();
    expect(component.childComponent).toBeTruthy();
  });

  it('should allow spying of viewchild component methods', () => {
    const spy = spyOn(component.childComponent, 'performAction');
    component.performActionOnChild('test');
    expect(spy).toHaveBeenCalledWith('test');
  });

  describe('ReactiveForms - ControlValueAccessor', () => {
    it('should allow you simulate the component being touched', () => {
      fixture.detectChanges();
      const customFormControl: MockedComponent<CustomFormControlComponent> =
        fixture.debugElement.query(By.css('custom-form-control')).componentInstance;
      customFormControl.__simulateTouch();
      expect(component.formControl.touched).toBe(true);
    });

    it('should allow you simulate a value being set', () => {
      fixture.detectChanges();
      const customFormControl: MockedComponent<CustomFormControlComponent>
        = fixture.debugElement.query(By.css('custom-form-control')).componentInstance;
      customFormControl.__simulateChange('foo');
      expect(component.formControl.value).toBe('foo');
    });
  });

  describe('NgTemplateOutlet', () => {
    it('renders all @ContentChild properties and ngContent in wrappers too', () => {
      let block1: DebugElement;
      let block2: DebugElement;
      let block3: DebugElement;
      fixture.detectChanges();

      // mocked component with @ViewChild was created without errors.
      const templateOutlet = fixture.debugElement.query(By.css('#element-with-content-and-template'));
      expect(templateOutlet).toBeTruthy();

      // looking for ng-content.
      const ngContent = templateOutlet;
      expect(ngContent).toBeTruthy();
      expect(ngContent.nativeElement.innerText.trim()).toEqual('ng-content body header ng-content body footer');

      // looking for 1st templateRef.
      block1 = templateOutlet.query(By.css('[data-key="block1"]'));
      expect(block1).toBeFalsy();
      (templateOutlet.componentInstance as MockedComponent<TemplateOutletComponent>).__render('block1');
      block1 = templateOutlet.query(By.css('[data-key="block1"]'));
      expect(block1).toBeTruthy();
      expect(block1.nativeElement.innerText.trim()).toEqual('block 1 body');

      // looking for 2nd templateRef.
      block2 = templateOutlet.query(By.css('[data-key="block2"]'));
      expect(block2).toBeFalsy();
      (templateOutlet.componentInstance as MockedComponent<TemplateOutletComponent>).__render('block2');
      block2 = templateOutlet.query(By.css('[data-key="block2"]'));
      expect(block2).toBeTruthy();
      expect(block2.nativeElement.innerText.trim()).toEqual('block 2 body');

      // looking for 3rd templateRef.
      block3 = templateOutlet.query(By.css('[data-key="block3"]'));
      expect(block3).toBeFalsy();
      (templateOutlet.componentInstance as MockedComponent<TemplateOutletComponent>).__render('block3');
      fixture.detectChanges();
      block3 = templateOutlet.query(By.css('[data-key="block3"]'));
      expect(block3).toBeTruthy();
      expect(block3.nativeElement.innerText.trim()).toEqual('');
    });

    it('renders nothing if no @ContentChild in component and ng-content is empty', () => {
      fixture.detectChanges();

      // mocked component was created without errors.
      const templateOutlet = fixture.debugElement.query(By.css('#element-without-content-and-template'));
      expect(templateOutlet).toBeTruthy();
      expect(templateOutlet.nativeElement.innerHTML).toBeFalsy();
    });

    it('renders ng-content without wrapper if no @ContentChild in component', () => {
      fixture.detectChanges();

      // mocked component was created without errors.
      const templateOutlet = fixture.debugElement.query(By.css('#element-with-content-only'));
      expect(templateOutlet).toBeTruthy();

      // content has right value
      expect(templateOutlet.nativeElement.innerHTML.trim())
          .toEqual('child of element-with-content-only');
    });
  });
});
