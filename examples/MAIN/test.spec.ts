// tslint:disable:object-literal-sort-keys member-ordering arrow-return-shorthand

import { CommonModule } from '@angular/common';
import { Component, ContentChild, ElementRef, EventEmitter, Input, NgModule, Output, TemplateRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// Our main component that we want to test.
@Component({
  selector: 'app-root',
  template: `
    <app-header [showLogo]="true" [title]="title" (logo)="logoClick.emit()">
      <ng-template #menu>
        <ul>
          <li><a [routerLink]="['/home']">Home</a></li>
          <li><a [routerLink]="['/about']">Home</a></li>
        </ul>
      </ng-template>
    </app-header>
    <router-outlet></router-outlet>
  `,
})
class AppComponent {
  @Input() public title = 'My Application';

  @Output() public logoClick = new EventEmitter<void>();
}

// A dependency component that we want to mock with a respect
// of its inputs and outputs.
@Component({
  selector: 'app-header',
  template: `
    <a (click)="logo.emit()"><img src="assets/logo.png" *ngIf="showLogo" /></a>
    {{ title }}
    <template [ngTemplateOutlet]="menu"></template>
  `,
})
class AppHeaderComponent {
  @Input() public showLogo: boolean;
  @Input() public title: string;

  @Output() public logo: EventEmitter<void>;

  @ContentChild('menu', { read: false } as any) public menu: TemplateRef<ElementRef>;
}

// The module where our components are declared.
@NgModule({
  imports: [CommonModule, RouterModule.forRoot([])],
  declarations: [AppComponent, AppHeaderComponent],
  bootstrap: [AppComponent],
})
class AppModule {}

describe('main', () => {
  // Usually we would have something like that.
  // beforeEach(() => {
  //   TestBed.configureTestingModule({
  //     imports: [CommonModule],
  //     declarations: [AppComponent, AppHeaderComponent],
  //   });
  //
  //   fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  // });
  // Instead of AppHeaderComponent we want to have a mock and
  // usually doing it via a helper component
  // or setting NO_ERRORS_SCHEMA.

  // With ng-mocks it can be defined in the next way.
  beforeEach(() => {
    // AppComponent will stay as it is,
    // everything in AppModule will be mocked.
    return (
      MockBuilder(AppComponent, AppModule)
        // Adding a special config how to mock AppHeaderComponent.
        .mock(AppHeaderComponent, {
          render: {
            // #menu template will be rendered together
            // with mocked AppHeaderComponent.
            menu: true,
          },
        })
    );
    // the same as
    // TestBed.configureTestingModule({
    //   imports: [
    //     MockModule(CommonModule),
    //     MockModule(RouterModule.forRoot([])),
    //   ],
    //   declarations: [
    //     AppComponent, // not mocked
    //     MockComponent(AppHeaderComponent),
    //   ],
    // });
    // return testBed.compileComponents();
  });

  it('example', () => {
    const logoClickSpy = typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();

    // Instead of TestBed.createComponent(AppComponent)
    // in beforeEach MockRender should be directly used
    // in tests.
    const fixture = MockRender(AppComponent, {
      title: 'Fake Application',
      logoClick: logoClickSpy,
    });
    // It creates a helper component
    // with the next template:
    // <app-root
    //   [title]="'Fake Application'"
    //   (logoClick)="logoClickSpy($event)"
    // ></app-root>
    // and renders it via TestBed.createComponent(HelperComponent).
    // AppComponent is accessible via fixture.point.

    // The same as fixture.debugElement.query(By.directive(AppHeaderComponent));
    // but typesafe and fails if nothing was found.
    const header = ngMocks.find(fixture.debugElement, AppHeaderComponent);

    // Asserting how AppComponent uses AppHeaderComponent.
    expect(header.componentInstance.showLogo).toBe(true);
    expect(header.componentInstance.title).toBe('Fake Application');

    // Checking that AppComponents updates AppHeaderComponent.
    fixture.componentInstance.title = 'Updated Application';
    fixture.detectChanges();
    expect(header.componentInstance.title).toBe('Updated Application');

    // Checking that AppComponent listens on outputs of AppHeaderComponent.
    expect(logoClickSpy).not.toHaveBeenCalled();
    header.componentInstance.logo.emit();
    expect(logoClickSpy).toHaveBeenCalled();

    // Asserting that AppComponent passes the right menu into AppHeaderComponent.
    const links = ngMocks.findAll(header, 'a');
    expect(links.length).toBe(2);

    // An easy way to get a value of an input.
    // the same as links[0].injector.get(RouterLinkWithHref).routerLink
    expect(ngMocks.input(links[0], 'routerLink')).toEqual(['/home']);
    expect(ngMocks.input(links[1], 'routerLink')).toEqual(['/about']);
  });
});
