import {
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Injectable,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormControlDirective } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { isMockedNgDefOf } from '../common/func.is-mocked-ng-def-of';
import { MockBuilder } from '../mock-builder/mock-builder';
import { ngMocks } from '../mock-helper/mock-helper';
import { MockRender } from '../mock-render/mock-render';

import { MockDirective, MockDirectives } from './mock-directive';
import { MockedDirective } from './types';

@Injectable()
class TargetService {}

@Directive({
  exportAs: 'foo',
  selector: '[exampleDirective]',
})
class ExampleDirective {
  @Input() public exampleDirective = '';
  @Output() public readonly someOutput = new EventEmitter<boolean>();
  @Input('bah') public something = '';

  protected s: any;

  public performAction(s: string) {
    this.s = s;

    return this;
  }
}

@Directive({
  providers: [TargetService],
  selector: '[exampleStructuralDirective]',
})
class ExampleStructuralDirective {
  @Input() public exampleStructuralDirective = true;
}

@Directive({
  selector: '[getters-and-setters]',
})
class GettersAndSettersDirective {
  @Input()
  public normalInput?: boolean;

  public normalProperty = false;

  protected value: any;

  public get myGetter() {
    return true;
  }

  public set mySetter(value: string) {
    this.value = value;
  }

  public normalMethod(): boolean {
    return this.myGetter;
  }
}

@Component({
  selector: 'example-component-container',
  template: `
    <div
      [exampleDirective]="'bye'"
      [bah]="'hi'"
      #f="foo"
      (someOutput)="emitted = $event"
    ></div>
    <div exampleDirective></div>
    <div
      id="example-structural-directive"
      *exampleStructuralDirective="true"
    >
      hi
    </div>
    <input [formControl]="fooControl" />
    <div getters-and-setters></div>
  `,
})
class ExampleContainerComponent {
  @ViewChild(ExampleDirective, {} as any)
  public childDirective?: ExampleDirective;
  public emitted = false;
  public readonly foo = new FormControl('');

  public performActionOnChild(s: string): void {
    if (this.childDirective) {
      this.childDirective.performAction(s);
    }
  }
}

describe('MockDirective', () => {
  let component: ExampleContainerComponent;
  let fixture: ComponentFixture<ExampleContainerComponent>;

  beforeEach(async () => {
    return TestBed.configureTestingModule({
      declarations: [
        ExampleContainerComponent,
        MockDirective(FormControlDirective),
        MockDirective(ExampleDirective),
        MockDirective(ExampleStructuralDirective),
        MockDirective(GettersAndSettersDirective),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have use a selector of the original component', () => {
    const element = fixture.debugElement.query(
      By.directive(ExampleDirective),
    );
    expect(element).not.toBeNull();
  });

  it('should have the input set on the mock component', () => {
    const debugElement = fixture.debugElement.query(
      By.directive(ExampleDirective),
    );
    const element = ngMocks.get(debugElement, ExampleDirective);
    expect(element.something).toEqual('hi');
    expect(element.exampleDirective).toEqual('bye');
  });

  it('triggers output bound behavior for extended outputs', () => {
    const debugElement = fixture.debugElement.query(
      By.directive(ExampleDirective),
    );
    const element = ngMocks.get(debugElement, ExampleDirective);

    element.someOutput.emit(true);
    expect(component.emitted).toEqual(true);
  });

  it('should memoize the return value by argument', () => {
    expect(MockDirective(ExampleDirective)).toEqual(
      MockDirective(ExampleDirective),
    );
    expect(MockDirective(ExampleDirective)).not.toEqual(
      ExampleDirective,
    );
  });

  it('can mock formControlDirective from angular', () => {
    // Some angular directives set up their metadata in a different way than @Directive does
    // I found that FormControlDirective is one of those weird directives.
    // Since I do not know how they did it, I don't know how to test it except to write this
    // Test around a known-odd directive.
    const debugElement = fixture.debugElement.query(
      By.directive(ExampleDirective),
    );
    expect(debugElement).not.toBeNull();
  });

  it('should display structural directive content', () => {
    const mockDirective = ngMocks.findInstance(
      fixture.debugElement,
      ExampleStructuralDirective,
    ) as MockedDirective<ExampleStructuralDirective>;

    // structural directives should be rendered first.
    mockDirective.__render();
    fixture.detectChanges();
    expect(mockDirective.exampleStructuralDirective).toBeTruthy();

    const debugElement = fixture.debugElement.query(
      By.css('#example-structural-directive'),
    );
    expect(debugElement.nativeElement.innerHTML).toContain('hi');
  });

  it('renders with true', async () => {
    await MockBuilder(ExampleContainerComponent).mock(
      ExampleStructuralDirective,
      {
        render: true,
      },
    );
    expect(() => MockRender(ExampleContainerComponent)).not.toThrow();
  });

  it('renders with $implicit', async () => {
    await MockBuilder(ExampleContainerComponent).mock(
      ExampleStructuralDirective,
      {
        render: {
          $implicit: true,
        },
      },
    );
    expect(() => MockRender(ExampleContainerComponent)).not.toThrow();
  });

  it('should set ViewChild directives correctly', () => {
    fixture.detectChanges();
    expect(component.childDirective).toBeTruthy();
  });

  it('should allow spying of viewchild directive methods', () => {
    const spy = component.childDirective
      ? component.childDirective.performAction
      : null;
    component.performActionOnChild('test');
    expect(spy).toHaveBeenCalledWith('test');
  });

  it('should set getters and setters to undefined instead of function', () => {
    const mockDirective = ngMocks.findInstance(
      fixture.debugElement,
      GettersAndSettersDirective,
    ) as MockedDirective<GettersAndSettersDirective>;
    expect(() => mockDirective.__render()).not.toThrow();
    expect(mockDirective.normalMethod).toBeDefined();
    expect(mockDirective.myGetter).not.toBeDefined();
    expect(mockDirective.mySetter).not.toBeDefined();
    expect(mockDirective.normalProperty).not.toBeDefined();
  });

  it('mocks several directives', () => {
    const mocks = MockDirectives(
      GettersAndSettersDirective,
      ExampleStructuralDirective,
    );
    expect(mocks.length).toEqual(2);
    expect(
      isMockedNgDefOf(mocks[0], GettersAndSettersDirective, 'd'),
    ).toBeTruthy();
    expect(
      isMockedNgDefOf(mocks[1], ExampleStructuralDirective, 'd'),
    ).toBeTruthy();
  });

  it('A9 correct mocking of ContentChild, ContentChildren, ViewChild, ViewChildren ISSUE #109', () => {
    @Directive({
      selector: 'never',
    })
    class MyDirective {
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

    const actual = MockDirective(MyDirective) as any;
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
    });
  });
});
