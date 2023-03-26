import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  Output,
  Pipe,
  PipeTransform,
  TemplateRef,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Pipe({
  name: 'translate',
})
class TranslatePipe implements PipeTransform {
  public transform(value: string): string {
    // Just for the test purpose
    // we do not use any translation services.
    return `translated:${value}`;
  }
}

// Our main component that we want to test.
@Component({
  selector: 'app-root',
  template: `
    <app-header
      [showLogo]="true"
      [title]="title"
      (logo)="logoClick.emit()"
    >
      <ng-template #menu>
        <ul>
          <li>
            <a [routerLink]="['/home']">{{ 'Home' | translate }}</a>
          </li>
          <li>
            <a [routerLink]="['/about']">{{ 'About' | translate }}</a>
          </li>
        </ul>
      </ng-template>
    </app-header>
    <router-outlet></router-outlet>
  `,
})
class AppComponent {
  @Output() public logoClick = new EventEmitter<void>();
  @Input() public title = 'My Application';

  public appRootMain() {}
}

// A dependency component out of which we want to create a mock
// component with a respect of its inputs, outputs and ContentChild.
@Component({
  selector: 'app-header',
  template: `
    <a (click)="logo.emit()">
      <img src="assets/logo.png" *ngIf="showLogo" />
    </a>
    {{ title }}
    <template [ngTemplateOutlet]="menu"></template>
  `,
})
class AppHeaderComponent {
  @Output() public readonly logo = new EventEmitter<void>();
  @ContentChild('menu', {} as any)
  public menu?: TemplateRef<ElementRef>;
  @Input() public showLogo = false;
  @Input() public title = '';

  public appHeaderMain() {}
}

// The module where our components are declared.
@NgModule({
  declarations: [AppComponent, AppHeaderComponent, TranslatePipe],
  imports: [CommonModule, RouterModule.forRoot([])],
})
class AppModule {}

describe('main', () => {
  // Usually, we would have something like that.
  // beforeEach(() => {
  //   TestBed.configureTestingModule({
  //     imports: [
  //       CommonModule,
  //       RouterModule.forRoot([]),
  //     ],
  //     declarations: [
  //       AppComponent,
  //       AppHeaderComponent,
  //       TranslatePipe,
  //     ],
  //   });
  //
  //   fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  // });
  // But, usually, instead of AppHeaderComponent and TranslatePipe
  // we want to have mocks.

  // With ng-mocks it can be defined in the next way.
  beforeEach(() => {
    // AppComponent will stay as it is,
    // everything in AppModule will be replaced with their mocks.
    return (
      MockBuilder(AppComponent, AppModule)
        // Adding a special config how to create
        // a mock AppHeaderComponent.
        .mock(AppHeaderComponent, {
          render: {
            // #menu template will be rendered simultaneously
            // with the mock AppHeaderComponent.
            menu: true,
          },
        })
        // a fake transform handler.
        .mock(TranslatePipe, v => `fake:${v}`)
    );
    // the same as
    // TestBed.configureTestingModule({
    //   imports: [
    //     MockModule(CommonModule),
    //     MockModule(RouterModule.forRoot([])),
    //   ],
    //   declarations: [
    //     AppComponent, // <- keeping it as it is.
    //     MockComponent(AppHeaderComponent),
    //     MockPipe(TranslatePipe, v => `fake:${v}`),
    //   ],
    // });
    // return testBed.compileComponents();
    //
    // of if we used ngMocks.guts
    // TestBed.configureTestingModule(ngMocks.guts(
    //   AppComponent, // <- keeping it as it is.
    //   AppModule,
    // ));
    // return testBed.compileComponents();
    // But in this case TranslatePipe will return undefined,
    // if we do not customize it via MockInstance or defaultMock.
  });

  it('asserts behavior of AppComponent', () => {
    const logoClickSpy =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    // in case of jest
    // const logoClickSpy = jest.fn();

    // Instead of TestBed.createComponent(AppComponent) in beforeEach
    // MockRender might be used directly in tests.
    const fixture = MockRender(AppComponent, {
      logoClick: logoClickSpy,
      title: 'Fake Application',
    });
    // It creates a helper component
    // with the next template:
    // <app-root
    //   [title]="'Fake Application'"
    //   (logoClick)="logoClickSpy($event)"
    // ></app-root>
    // and renders it via TestBed.createComponent(HelperComponent).
    // AppComponent is accessible via fixture.point.

    // The same as fixture.debugElement.query(
    //   By.directive(AppHeaderComponent)
    // );
    // but type safe and fails if nothing has been found.
    const header = ngMocks.find(AppHeaderComponent);

    // Verifies how AppComponent uses AppHeaderComponent.
    expect(header.componentInstance.showLogo).toBe(true);
    expect(header.componentInstance.title).toBe('Fake Application');

    // Checking that AppComponents updates AppHeaderComponent.
    fixture.componentInstance.title = 'Updated Application';
    fixture.detectChanges();
    expect(header.componentInstance.title).toBe(
      'Updated Application',
    );

    // Checking that AppComponent listens on outputs of
    // AppHeaderComponent.
    expect(logoClickSpy).not.toHaveBeenCalled();
    header.componentInstance.logo.emit();
    expect(logoClickSpy).toHaveBeenCalled();

    // Verifies that AppComponent passes the right menu into
    // AppHeaderComponent.
    const links = ngMocks.findAll(header, 'a');
    expect(links.length).toBe(2);
    const [link1, link2] = links;

    // Checking that TranslatePipe has been used.
    expect(link1.nativeElement.innerHTML).toEqual('fake:Home');
    // An easy way to get a value of an input. The same as
    // links[0].injector.get(RouterLinkWithHref).routerLink
    expect(ngMocks.input(link1, 'routerLink')).toEqual(['/home']);

    expect(link2.nativeElement.innerHTML).toEqual('fake:About');
    expect(ngMocks.input(link2, 'routerLink')).toEqual(['/about']);
  });
});
