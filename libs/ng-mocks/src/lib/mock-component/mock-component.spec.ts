import {
  Component,
  ContentChild,
  ContentChildren,
  DebugElement,
  ElementRef,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { By } from '@angular/platform-browser';

import { isMockOf } from '../common/func.is-mock-of';
import { MockedDirective } from '../mock-directive/types';
import { ngMocks } from '../mock-helper/mock-helper';
import { MockRender } from '../mock-render/mock-render';

import { MockComponent, MockComponents } from './mock-component';
import { ChildComponent } from './mock-component.spec.child-component.fixtures';
import { CustomFormControlComponent } from './mock-component.spec.custom-form-control.component.fixtures';
import { EmptyComponent } from './mock-component.spec.empty-component.component.fixtures';
import { GetterSetterComponent } from './mock-component.spec.getter-setter.component.fixtures';
import { SimpleComponent } from './mock-component.spec.simple-component.component.fixtures';
import { TemplateOutletComponent } from './mock-component.spec.template-outlet.component.fixtures';
import { MockedComponent } from './types';

@Component({
  selector: 'example-component-container',
  template: `
    <getter-setter></getter-setter>
    <simple-component
      [someInput]="'hi'"
      [someOtherInput]="'bye'"
      [someInput3]="true"
      (someOutput1)="emitted = $event"
      (someOutput2)="emitted = $event"
    >
    </simple-component>
    <simple-component
      [someInput]="'hi again'"
      #f="simple"
    ></simple-component>
    <empty-component></empty-component>
    <custom-form-control
      [formControl]="formControl"
    ></custom-form-control>
    <empty-component id="ng-content-component">doh</empty-component>
    <empty-component
      id="ngmodel-component"
      [(ngModel)]="someOutputHasEmitted"
    ></empty-component>
    <child-component></child-component>
    <template-outlet-component id="element-with-content-and-template">
      ng-content body header
      <ng-template #block1>
        <div>block 1 body</div>
      </ng-template>
      <ng-template #block2><span>block 2 body</span></ng-template>
      ng-content body footer
    </template-outlet-component>
    <empty-component
      id="element-without-content-and-template"
    ></empty-component>
    <empty-component id="element-with-content-only"
      >child of element-with-content-only</empty-component
    >
  `,
})
export class ExampleContainerComponent {
  @ViewChild(ChildComponent, { static: true } as any)
  public childComponent?: ChildComponent;
  public emitted = '';
  public someOutputHasEmitted = '';
  public readonly formControl = new FormControl('');

  public performActionOnChild(s: string): void {
    if (this.childComponent) {
      this.childComponent.performAction(s);
    }
  }
}

describe('MockComponent', () => {
  let component: ExampleContainerComponent;
  let fixture: ComponentFixture<ExampleContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ExampleContainerComponent,
        ...MockComponents(
          EmptyComponent,
          GetterSetterComponent,
          SimpleComponent,
          TemplateOutletComponent,
          ChildComponent,
          CustomFormControlComponent,
        ),
      ],
      imports: [FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleContainerComponent);
    component = fixture.componentInstance;
  });

  it('should have use a selector of the original component', () => {
    fixture.detectChanges();
    const mockComponent = fixture.debugElement.query(
      By.css('simple-component'),
    );
    expect(mockComponent).not.toBeNull();
  });

  it('should have the input set on the mock component', () => {
    fixture.detectChanges();
    const mockComponent = fixture.debugElement.query(
      By.directive(SimpleComponent),
    ).componentInstance;
    expect(mockComponent.someInput).toEqual('hi');
    expect(mockComponent.someInput2).toEqual('bye');
  });

  it('has no issues with multiple decorators on an input', () => {
    fixture.detectChanges();
    const mockComponent = fixture.debugElement.query(
      By.directive(SimpleComponent),
    );
    expect(mockComponent.componentInstance.someInput3).toEqual(true);
  });

  it('should trigger output bound behavior', () => {
    fixture.detectChanges();
    const mockComponent = fixture.debugElement.query(
      By.directive(SimpleComponent),
    ).componentInstance;
    mockComponent.someOutput1.emit('hi');
    expect(component.emitted).toEqual('hi');
  });

  it('should trigger output bound behavior for extended outputs', () => {
    fixture.detectChanges();
    const mockComponent = fixture.debugElement.query(
      By.directive(SimpleComponent),
    ).componentInstance;
    mockComponent.someOutput2.emit('hi');
    expect(component.emitted).toEqual('hi');
  });

  it('the mock should have an ng-content body', () => {
    fixture.detectChanges();
    const mockComponent = fixture.debugElement.query(
      By.css('#ng-content-component'),
    );
    expect(mockComponent.nativeElement.textContent).toContain('doh');
  });

  it('should give each instance of a mock component its own event emitter', () => {
    const mockComponents = fixture.debugElement.queryAll(
      By.directive(SimpleComponent),
    );
    const mockComponent1 = mockComponents[0].componentInstance;
    const mockComponent2 = mockComponents[1].componentInstance;
    expect(mockComponent1.someOutput1).not.toEqual(
      mockComponent2.someOutput1,
    );
  });

  it('should work with components w/o inputs or outputs', () => {
    const mockComponent = fixture.debugElement.query(
      By.directive(EmptyComponent),
    );
    expect(mockComponent).not.toBeNull();
  });

  it('should allow ngModel bindings', () => {
    const mockComponent = fixture.debugElement.query(
      By.css('#ngmodel-component'),
    );
    expect(mockComponent).not.toBeNull();
  });

  it('should memoize the return value by argument', () => {
    expect(MockComponent(EmptyComponent)).toBe(
      MockComponent(EmptyComponent),
    );
    expect(MockComponent(SimpleComponent)).toBe(
      MockComponent(SimpleComponent),
    );
    expect(MockComponent(EmptyComponent)).not.toBe(
      MockComponent(SimpleComponent),
    );
  });

  it('should set ViewChild components correctly', () => {
    fixture.detectChanges();
    expect(component.childComponent).toBeTruthy();
  });

  it('should allow spying of viewchild component methods', () => {
    const spy = component.childComponent
      ? component.childComponent.performAction
      : null;
    component.performActionOnChild('test');
    expect(spy).toHaveBeenCalledWith('test');
  });

  it('should set getters and setters to undefined instead of function', () => {
    const mockComponent = ngMocks.findInstance(
      fixture.debugElement,
      GetterSetterComponent,
    ) as MockedDirective<GetterSetterComponent>;

    expect(mockComponent.normalMethod).toBeDefined();
    expect(mockComponent.myGetter).not.toBeDefined();
    expect(mockComponent.mySetter).not.toBeDefined();
    expect(mockComponent.normalProperty).not.toBeDefined();
  });

  describe('ReactiveForms - ControlValueAccessor', () => {
    it('should allow you simulate the component being touched', () => {
      fixture.detectChanges();
      const customFormControl: MockedComponent<CustomFormControlComponent> =
        fixture.debugElement.query(
          By.css('custom-form-control'),
        ).componentInstance;
      customFormControl.__simulateTouch();
      expect(component.formControl.touched).toBe(true);
    });

    it('should allow you simulate a value being set', () => {
      fixture.detectChanges();
      const customFormControl: MockedComponent<CustomFormControlComponent> =
        fixture.debugElement.query(
          By.css('custom-form-control'),
        ).componentInstance;
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

      // a mock component with @ViewChild was created without errors.
      const templateOutlet = fixture.debugElement.query(
        By.css('#element-with-content-and-template'),
      );
      expect(templateOutlet).toBeTruthy();

      // looking for ng-content.
      const ngContent = templateOutlet;
      expect(ngContent).toBeTruthy();
      expect(
        ngContent.nativeElement.textContent
          .replace(/\s+/gim, ' ')
          .trim(),
      ).toEqual('ng-content body header ng-content body footer');

      // looking for 1st templateRef.
      block1 = templateOutlet.query(By.css('[data-key="block1"]'));
      expect(block1).toBeFalsy();
      (
        templateOutlet.componentInstance as MockedComponent<TemplateOutletComponent>
      ).__render('block1');
      block1 = templateOutlet.query(By.css('[data-key="block1"]'));
      expect(block1).toBeTruthy();
      expect(block1.nativeElement.textContent.trim()).toEqual(
        'block 1 body',
      );

      // looking for 2nd templateRef.
      block2 = templateOutlet.query(By.css('[data-key="block2"]'));
      expect(block2).toBeFalsy();
      (
        templateOutlet.componentInstance as MockedComponent<TemplateOutletComponent>
      ).__render('block2');
      block2 = templateOutlet.query(By.css('[data-key="block2"]'));
      expect(block2).toBeTruthy();
      expect(block2.nativeElement.textContent.trim()).toEqual(
        'block 2 body',
      );

      // looking for 3rd templateRef.
      block3 = templateOutlet.query(By.css('[data-key="block3"]'));
      expect(block3).toBeFalsy();
      (
        templateOutlet.componentInstance as MockedComponent<TemplateOutletComponent>
      ).__render('block3');
      fixture.detectChanges();
      block3 = templateOutlet.query(By.css('[data-key="block3"]'));
      expect(block3).toBeTruthy();
      expect(block3.nativeElement.textContent.trim()).toEqual('');
      (
        templateOutlet.componentInstance as MockedComponent<TemplateOutletComponent>
      ).__hide('block3');
      fixture.detectChanges();
      expect(
        templateOutlet.query(By.css('[data-key="block3"]')),
      ).toBeFalsy();
    });

    it('ignores missed blocks', () => {
      ngMocks.flushTestBed();
      const loFixture = MockRender(TemplateOutletComponent);
      const loComponent: any = loFixture.point.componentInstance;
      if (isMockOf(loComponent, TemplateOutletComponent, 'c')) {
        expect(() => loComponent.__hide('empty')).not.toThrow();
        expect(() => loComponent.__render('empty')).not.toThrow();
      } else {
        fail('the component is not replaced with its mock copy');
      }
    });

    it('renders nothing if no @ContentChild in component and ng-content is empty', () => {
      fixture.detectChanges();

      // a mock component was created without errors.
      const templateOutlet = fixture.debugElement.query(
        By.css('#element-without-content-and-template'),
      );
      expect(templateOutlet).toBeTruthy();
      expect(templateOutlet.nativeElement.innerHTML).toBeFalsy();
    });

    it('renders ng-content without wrapper if no @ContentChild in component', () => {
      fixture.detectChanges();

      // a mock component was created without errors.
      const templateOutlet = fixture.debugElement.query(
        By.css('#element-with-content-only'),
      );
      expect(templateOutlet).toBeTruthy();

      // content has right value
      expect(templateOutlet.nativeElement.innerHTML.trim()).toEqual(
        'child of element-with-content-only',
      );
    });
  });

  it('A9 correct mocking of ContentChild, ContentChildren, ViewChild, ViewChildren ISSUE #109', () => {
    @Component({
      template: '',
    })
    class MyComponent {
      @ContentChild('i1', { read: TemplateRef } as any)
      public o1?: TemplateRef<any>;
      @ContentChildren('i2', { read: TemplateRef } as any)
      public o2?: QueryList<TemplateRef<any>>;
      @ViewChild('i3', { read: TemplateRef } as any)
      public o3?: TemplateRef<any>;
      @ViewChildren('i4', { read: TemplateRef } as any)
      public o4?: QueryList<TemplateRef<any>>;

      @ContentChild('i5', { read: ElementRef } as any)
      public o5?: ElementRef;
      @ContentChildren('i6', { read: ElementRef } as any)
      public o6?: QueryList<ElementRef>;
      @ViewChild('i7', { read: ElementRef } as any)
      public o7?: ElementRef;
      @ViewChildren('i8', { read: ElementRef } as any)
      public o8?: QueryList<ElementRef>;
    }

    const actual = MockComponent(MyComponent) as any;
    expect(actual.__prop__metadata__).toEqual({
      o1: [
        jasmine.objectContaining({
          selector: 'i1',
          isViewQuery: false,
          read: TemplateRef,
          ngMetadataName: 'ContentChild',
        }),
      ],
      o2: [
        jasmine.objectContaining({
          selector: 'i2',
          isViewQuery: false,
          read: TemplateRef,
          ngMetadataName: 'ContentChildren',
        }),
      ],
      o3: [
        jasmine.objectContaining({
          selector: 'i3',
          isViewQuery: true,
          read: TemplateRef,
          ngMetadataName: 'ViewChild',
        }),
      ],
      o4: [
        jasmine.objectContaining({
          selector: 'i4',
          isViewQuery: true,
          read: TemplateRef,
          ngMetadataName: 'ViewChildren',
        }),
      ],
      o5: [
        jasmine.objectContaining({
          selector: 'i5',
          isViewQuery: false,
          read: ElementRef,
          ngMetadataName: 'ContentChild',
        }),
      ],
      o6: [
        jasmine.objectContaining({
          selector: 'i6',
          isViewQuery: false,
          read: ElementRef,
          ngMetadataName: 'ContentChildren',
        }),
      ],
      o7: [
        jasmine.objectContaining({
          selector: 'i7',
          isViewQuery: true,
          read: ElementRef,
          ngMetadataName: 'ViewChild',
        }),
      ],
      o8: [
        jasmine.objectContaining({
          selector: 'i8',
          isViewQuery: true,
          read: ElementRef,
          ngMetadataName: 'ViewChildren',
        }),
      ],

      __ngMocksVcr_o1: [
        jasmine.objectContaining({
          selector: 'i1',
          isViewQuery: false,
          read: ViewContainerRef,
          ngMetadataName: 'ContentChild',
        }),
      ],
      __ngMocksVcr_o2: [
        jasmine.objectContaining({
          selector: 'i2',
          isViewQuery: false,
          read: ViewContainerRef,
          ngMetadataName: 'ContentChildren',
        }),
      ],
      __ngMocksVcr_o5: [
        jasmine.objectContaining({
          selector: 'i5',
          isViewQuery: false,
          read: ViewContainerRef,
          ngMetadataName: 'ContentChild',
        }),
      ],
      __ngMocksVcr_o6: [
        jasmine.objectContaining({
          selector: 'i6',
          isViewQuery: false,
          read: ViewContainerRef,
          ngMetadataName: 'ContentChildren',
        }),
      ],

      __mockView_key_i1: [
        jasmine.objectContaining({
          selector: 'key_i1',
          isViewQuery: true,
          static: false,
          ngMetadataName: 'ViewChild',
        }),
      ],
      __mockTpl_key_i1: [
        jasmine.objectContaining({
          selector: 'i1',
          isViewQuery: false,
          ngMetadataName: 'ContentChild',
        }),
      ],
      __mockView_prop_o1: [
        jasmine.objectContaining({
          selector: 'prop_o1',
          isViewQuery: true,
          static: false,
          ngMetadataName: 'ViewChild',
        }),
      ],

      __mockView_key_i2: [
        jasmine.objectContaining({
          selector: 'key_i2',
          isViewQuery: true,
          static: false,
          ngMetadataName: 'ViewChild',
        }),
      ],
      __mockTpl_key_i2: [
        jasmine.objectContaining({
          selector: 'i2',
          isViewQuery: false,
          ngMetadataName: 'ContentChildren',
        }),
      ],
      __mockView_prop_o2: [
        jasmine.objectContaining({
          selector: 'prop_o2',
          isViewQuery: true,
          static: false,
          ngMetadataName: 'ViewChild',
        }),
      ],
    });
  });
});
